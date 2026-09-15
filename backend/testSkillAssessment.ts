import { groq, generateVerificationQuestions } from "./src/services/groqService";
import Groq from "groq-sdk";

const API_BASE = "http://localhost:5000/api";

async function registerTestTrainee(prefix: string) {
  const email = `${prefix}_${Date.now()}@example.com`;
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "TRAINEE",
      email,
      password: "password123",
      fullName: `Test Trainee ${prefix}`,
      phone: Date.now().toString().slice(-10),
    }),
  });
  const data = await res.json();
  return { token: data.accessToken, user: data.user };
}

async function startAssessment(token: string) {
  const res = await fetch(`${API_BASE}/trainees/skill-assessment/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      claimedSkills: ["React", "Node.js"],
    }),
  });
  return res;
}

async function getAssessment(token: string, id: string) {
  return fetch(`${API_BASE}/trainees/skill-assessment/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function submitAssessment(token: string, id: string, answers: any) {
  return fetch(`${API_BASE}/trainees/skill-assessment/${id}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  });
}

async function testMockedGroq() {
  console.log("\n--- Testing Mocked Groq Retry Logic ---");
  const originalCreate = groq.chat.completions.create;

  try {
    // 1. Test RateLimitError backoff
    let rateLimitCalls = 0;
    groq.chat.completions.create = (async () => {
      rateLimitCalls++;
      if (rateLimitCalls === 1) {
        const err = new Groq.RateLimitError(429, {}, "Rate limited", {
          "retry-after": "1", // 1 second
        } as any);
        throw err;
      }
      return {
        choices: [{ message: { content: JSON.stringify({ questions: [] }) } }],
      } as any;
    }) as any;

    const start = Date.now();
    await generateVerificationQuestions({
      claimedSkills: ["Test"],
      claimedCertifications: [],
      claimedProjects: [],
      claimedCourses: [],
    });
    const duration = Date.now() - start;
    console.log(`RateLimitError retry passed. Waited ~${duration}ms.`);
    if (duration < 1000) throw new Error("Did not wait for retry-after");

    // 2. Test JSON Schema violation immediate retry
    let schemaErrorCalls = 0;
    groq.chat.completions.create = (async (options: any) => {
      schemaErrorCalls++;
      if (schemaErrorCalls === 1) {
        throw new Groq.BadRequestError(
          400,
          {},
          "JSON schema strict violation",
          {} as any
        );
      }
      // verify strict prompt was appended
      const lastMessage = options.messages[options.messages.length - 1].content;
      if (!lastMessage.includes("CRITICAL")) {
        throw new Error("Strict prompt not appended on retry");
      }
      return {
        choices: [{ message: { content: JSON.stringify({ questions: [] }) } }],
      } as any;
    }) as any;

    await generateVerificationQuestions({
      claimedSkills: ["Test"],
      claimedCertifications: [],
      claimedProjects: [],
      claimedCourses: [],
    });
    console.log(`Schema violation retry passed.`);
  } finally {
    groq.chat.completions.create = originalCreate;
  }
}

async function testRBACAndRateLimit() {
  console.log("\n--- Testing RBAC and Rate Limiting ---");
  console.log("Registering Trainee 1...");
  const trainee1 = await registerTestTrainee("T1");
  console.log("Registering Trainee 2...");
  const trainee2 = await registerTestTrainee("T2");

  // Rate Limiting Test (4 calls)
  console.log("Testing Rate Limiting (max 3/day)...");
  for (let i = 1; i <= 4; i++) {
    const res = await startAssessment(trainee1.token);
    if (i <= 3) {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Call ${i} failed unexpectedly: ${res.status} - ${text}`);
      }
      console.log(`Call ${i} successful (201).`);
    } else {
      if (res.status !== 429) throw new Error(`Call 4 did not return 429. Got: ${res.status}`);
      console.log(`Call ${i} correctly blocked by rate limiter (429).`);
    }
  }

  // Get the first assessment from trainee1
  const res = await startAssessment(trainee2.token); // this is trainee 2's 1st call
  const data = await res.json();
  const t2AssessmentId = data.assessmentId;

  console.log(`Trainee 2 created assessment ${t2AssessmentId}`);

  // RBAC Test
  console.log("Testing RBAC...");
  const rbacGetRes = await getAssessment(trainee1.token, t2AssessmentId);
  if (rbacGetRes.status !== 403 && rbacGetRes.status !== 404) {
    throw new Error(`RBAC Get failed, expected 403/404, got ${rbacGetRes.status}`);
  }
  console.log(`RBAC GET correctly blocked (${rbacGetRes.status}).`);

  const rbacSubmitRes = await submitAssessment(trainee1.token, t2AssessmentId, [
    { questionId: "q1", answerText: "ans" },
  ]);
  if (rbacSubmitRes.status !== 403 && rbacSubmitRes.status !== 404) {
    throw new Error(`RBAC Submit failed, expected 403/404, got ${rbacSubmitRes.status}`);
  }
  console.log(`RBAC SUBMIT correctly blocked (${rbacSubmitRes.status}).`);
}

async function runTests() {
  try {
    await testMockedGroq();
    await testRBACAndRateLimit();
    console.log("\nALL TESTS PASSED SUCCESSFULLY.");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

runTests();
