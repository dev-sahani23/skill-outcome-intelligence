/// <reference types="node" />
import fs from 'fs';

const API_BASE = 'http://localhost:5000/api';
let MOCK_EMAIL = process.env.MOCK_EMAIL !== 'false';

async function registerTestUser(email: string) {
    try {
        console.log(`[TEST] Registering test user with email ${email}...`);
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'TRAINEE',
                email: email,
                password: 'password123',
                fullName: 'Test User',
                phone: Date.now().toString().slice(-10)
            })
        });
        const data = await res.json();
        console.log(`[TEST] Registration status: ${res.status}, Body:`, JSON.stringify(data));
        return email;
    } catch (err) {
        console.error(err);
    }
    return email;
}

function extractOtpFromLog(email: string): string | null {
    if (!fs.existsSync('mock_email.log')) return null;
    const log = fs.readFileSync('mock_email.log', 'utf8');
    // Find the last OTP sent to this email
    // Example: To: test-123@example.com ... Your OTP is <strong>123456</strong>
    const lines = log.split('\n');
    let lastOtp = null;
    let isTargetEmail = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`To: ${email}`)) {
            isTargetEmail = true;
        } else if (lines[i].includes('========== MOCK EMAIL ==========')) {
            isTargetEmail = false; // reset on new email block
        }
        
        if (isTargetEmail) {
            const match = lines[i].match(/Your OTP is <strong>(\d{6})<\/strong>/);
            if (match) {
                lastOtp = match[1];
            }
        }
    }
    return lastOtp;
}

async function checkEnumeration(validEmail: string, invalidEmail: string) {
    console.log(`\n--- ENUMERATION CHECK ---`);
    
    // Check valid email (different case)
    const testValid = validEmail.toLowerCase();
    const t1 = performance.now();
    const res1 = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testValid })
    });
    const data1 = await res1.json();
    const t2 = performance.now();
    console.log(`Valid Email (${testValid}): Status ${res1.status}, Time ${(t2-t1).toFixed(2)}ms, Body:`, data1);
    
    // Check invalid email
    const t3 = performance.now();
    const res2 = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invalidEmail })
    });
    const data2 = await res2.json();
    const t4 = performance.now();
    console.log(`Invalid Email (${invalidEmail}): Status ${res2.status}, Time ${(t4-t3).toFixed(2)}ms, Body:`, data2);
}

async function testRateLimitFlooding(emailBase: string) {
    console.log(`\n--- SEND-OTP RATE LIMIT FLOOD TEST ---`);
    const email = `test-ratelimit-${Date.now()}@example.com`;
    await registerTestUser(email);

    console.log(`[TEST] Rapid send-otp requests with varied case...`);
    const caseVariations = [
      email,
      email.toLowerCase(),
      email.toUpperCase(),
      email.charAt(0).toLowerCase() + email.slice(1).toUpperCase()
    ];

    for (let i = 1; i <= 4; i++) {
        const variant = caseVariations[i-1];
        const res = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: variant })
        });
        const data = await res.json();
        console.log(`Request #${i} (${variant}): Status ${res.status}, Body:`, data);
        if (i < 4) await new Promise(r => setTimeout(r, 500)); // wait a bit
    }
}

async function testVerifyAttemptLimit(emailBase: string) {
    console.log(`\n--- VERIFY-OTP ATTEMPT LIMIT TEST ---`);
    const email = `test-attemptlimit-${Date.now()}@example.com`;
    await registerTestUser(email);
    
    console.log(`[TEST] Requesting a fresh OTP...`);
    const res = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    });
    const data = await res.json();
    console.log(`Fresh OTP request status: ${res.status}, Body:`, data);
    
    if (res.status !== 200) {
        console.log(`[TEST] Failed to get fresh OTP! Aborting this test section.`);
        return;
    }

    // Give it a tiny pause so file IO can complete
    await new Promise(r => setTimeout(r, 200));
    const realOtp = extractOtpFromLog(email);
    console.log(`[TEST] Captured real OTP from log: ${realOtp}`);
    
    if (!realOtp) {
        console.log(`[TEST] Could not extract real OTP from mock_email.log! Aborting this test section.`);
        return;
    }

    console.log(`[TEST] Submitting 4 WRONG codes...`);
    for (let i = 1; i <= 4; i++) {
        const variant = email.toLowerCase(); // Just use one case for wrong attempts to show it counts
        const resVerify = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: variant, otp: '111111' })
        });
        const dataVerify = await resVerify.json();
        console.log(`Attempt #${i} (WRONG): Status ${resVerify.status}, Body:`, dataVerify);
    }

    console.log(`[TEST] Submitting the 1 CORRECT code as 5th request...`);
    const resVerifyCorrect = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: realOtp })
    });
    const dataVerifyCorrect = await resVerifyCorrect.json();
    console.log(`Attempt #5 (CORRECT): Status ${resVerifyCorrect.status}, Body:`, dataVerifyCorrect);

    console.log(`[TEST] Submitting the correct code again as 6th request...`);
    const resVerifyDuplicate = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: realOtp })
    });
    const dataVerifyDuplicate = await resVerifyDuplicate.json();
    console.log(`Attempt #6 (CORRECT AGAIN): Status ${resVerifyDuplicate.status}, Body:`, dataVerifyDuplicate);
}

async function testCrossEmailLeakage() {
    console.log(`\n--- NO CROSS-EMAIL LEAKAGE TEST ---`);
    const emailA = `test-leaka-${Date.now()}@example.com`;
    const emailB = `test-leakb-${Date.now()}@example.com`;
    
    await registerTestUser(emailA);
    await registerTestUser(emailB);

    // Request OTP for A
    const resA = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailA })
    });
    console.log(`[TEST] Send OTP A Status: ${resA.status}`);
    await new Promise(r => setTimeout(r, 200));
    const otpA = extractOtpFromLog(emailA);

    // Request OTP for B
    const resB = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailB })
    });
    console.log(`[TEST] Send OTP B Status: ${resB.status}`);
    await new Promise(r => setTimeout(r, 200));
    const otpB = extractOtpFromLog(emailB);

    console.log(`[TEST] Captured OTP A: ${otpA}, OTP B: ${otpB}`);
    if (!otpA || !otpB) return console.log(`[TEST] Failed to capture OTPs. Aborting.`);

    console.log(`[TEST] Attempt to verify A using B's OTP...`);
    const resAWithB = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailA, otp: otpB })
    });
    console.log(`Attempt A with B's OTP: Status ${resAWithB.status}, Body:`, await resAWithB.json());

    console.log(`[TEST] Attempt to verify B using A's OTP...`);
    const resBWithA = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailB, otp: otpA })
    });
    console.log(`Attempt B with A's OTP: Status ${resBWithA.status}, Body:`, await resBWithA.json());

    console.log(`[TEST] Verify A using its own correct OTP...`);
    const resACorrect = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailA, otp: otpA })
    });
    console.log(`Attempt A with A's OTP: Status ${resACorrect.status}, Body:`, await resACorrect.json());

    console.log(`[TEST] Confirm B's OTP is still valid (verify B with its correct OTP)...`);
    const resBCorrect = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailB, otp: otpB })
    });
    console.log(`Attempt B with B's OTP: Status ${resBCorrect.status}, Body:`, await resBCorrect.json());
}

async function runAll() {
    const ts = Date.now();
    const enumEmail = `test-enum-${ts}@example.com`;
    const invalidEmail = `invalid-${ts}@example.com`;
    
    await registerTestUser(enumEmail);
    await checkEnumeration(enumEmail, invalidEmail);
    
    await testRateLimitFlooding(ts.toString());
    await testCrossEmailLeakage();
    await testVerifyAttemptLimit(ts.toString());
    
    console.log("\nDone!");
}

runAll();
