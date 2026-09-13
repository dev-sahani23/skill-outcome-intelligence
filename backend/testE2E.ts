/// <reference types="node" />
import fs from 'fs';

const API_BASE = 'http://localhost:5000/api';

async function delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

async function getLatestSmsMatch(regex: RegExp) {
    try {
        const content = fs.readFileSync('mock_sms.log', 'utf-8');
        const lines = content.trim().split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
            const match = lines[i].match(regex);
            if (match) return match[1];
        }
    } catch (e) {}
    return null;
}

async function registerTestUser() {
    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const phone = `555${randomSuffix}`;
    try {
        const email = `test_e2e_${Date.now()}@example.com`;
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'TRAINEE',
                email: email,
                password: 'password123',
                fullName: 'Test E2E User',
                phone: phone
            })
        });
        const data = await res.json();
        console.log(`[TEST] Registration status: ${res.status}`);
        return { phone, email };
    } catch (err) {
        console.error(err);
    }
    return { phone, email: '' };
}

async function runE2E() {
    // Clean log
    if (fs.existsSync('mock_sms.log')) fs.unlinkSync('mock_sms.log');

    const { phone: validPhone, email: validEmail } = await registerTestUser();
    const invalidPhone = `555${Math.floor(1000000 + Math.random() * 9000000)}`;

    console.log(`\n--- 3. ENUMERATION CHECK ---`);
    const t1 = performance.now();
    const res1 = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: validPhone })
    });
    const t2 = performance.now();
    console.log(`Valid Phone (${validPhone}): Status ${res1.status}, Time ${(t2-t1).toFixed(2)}ms, Body:`, await res1.json());

    const t3 = performance.now();
    const res2 = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: invalidPhone })
    });
    const t4 = performance.now();
    console.log(`Invalid Phone (${invalidPhone}): Status ${res2.status}, Time ${(t4-t3).toFixed(2)}ms, Body:`, await res2.json());

    console.log(`\n--- 4. RATE LIMIT / ATTEMPT LIMIT ---`);
    console.log(`Firing 4 rapid send-otp requests...`);
    for (let i = 1; i <= 4; i++) {
        const res = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: validPhone })
        });
        console.log(`Send OTP Request #${i}: Status ${res.status}, Body:`, await res.json());
        await delay(100);
    }

    const otp = await getLatestSmsMatch(/OTP is (\d+)\./);
    console.log(`\nCaptured OTP from SMS log: ${otp}`);

    console.log(`Firing 6 verify-otp requests with WRONG code...`);
    for (let i = 1; i <= 6; i++) {
        const resVerify = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: validPhone, otp: '111111' })
        });
        console.log(`Attempt #${i}: Status ${resVerify.status}, Body:`, await resVerify.json());
    }

    console.log(`Retrying verify-otp with ORIGINAL CORRECT OTP after attempt limit...`);
    const resVerifyCorrect = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: validPhone, otp: otp })
    });
    console.log(`Status ${resVerifyCorrect.status}, Body:`, await resVerifyCorrect.json());


    console.log(`\n--- 2. END-TO-END HAPPY PATH ---`);
    const { phone: happyPhone, email: happyEmail } = await registerTestUser();
    console.log(`Triggering send-otp for happy path...`);
    const resHappy = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: happyPhone })
    });
    console.log(`Send OTP Status ${resHappy.status}, Body:`, await resHappy.json());
    
    await delay(1000); // wait for file write
    const happyOtp = await getLatestSmsMatch(/OTP is (\d+)\./);
    console.log(`Captured OTP: ${happyOtp}`);

    console.log(`Submitting verify-otp...`);
    const resVerifyHappy = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: happyPhone, otp: happyOtp })
    });
    console.log(`Verify OTP Status ${resVerifyHappy.status}, Body:`, await resVerifyHappy.json());

    await delay(1000);
    const tempPwd = await getLatestSmsMatch(/password is (\w+)\./);
    console.log(`Captured Temp Password: ${tempPwd}`);

    console.log(`Attempting login with temp password...`);
    const resLogin = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: happyEmail, password: tempPwd })
    });
    const loginData = await resLogin.json();
    console.log(`Login Status ${resLogin.status}, Body:`, loginData);
    
    if (loginData.user && loginData.accessToken) {
        const token = loginData.accessToken;
        console.log(`\n--- 5. PASSWORD CHANGE ENFORCEMENT ---`);
        console.log(`Attempting to access /me (should be blocked)`);
        const resMeBlocked = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`GET /me Status ${resMeBlocked.status}, Body:`, await resMeBlocked.json());
        
        console.log(`Attempting to change password...`);
        const resChangePwd = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ newPassword: 'newsecurepassword123' })
        });
        console.log(`POST /change-password Status ${resChangePwd.status}, Body:`, await resChangePwd.json());
        
        console.log(`Attempting to login with NEW password...`);
        const resLoginNew = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: happyEmail, password: 'newsecurepassword123' })
        });
        const loginNewData = await resLoginNew.json();
        console.log(`Login NEW Status ${resLoginNew.status}, Body:`, loginNewData);
        
        console.log(`Attempting to access /me with NEW token (should succeed)`);
        const resMeSuccess = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${loginNewData.accessToken}` }
        });
        console.log(`GET /me NEW Status ${resMeSuccess.status}, Body:`, await resMeSuccess.json());
    }
}

runE2E().catch(console.error);
