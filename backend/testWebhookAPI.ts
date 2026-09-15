import 'dotenv/config';

async function run() {
  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const WABA_ID = '1937533330248247';
  const APP_ID = '1042467461955024';

  console.log("STEP 1: Check current app-level webhook subscription (Phone Number)");
  let res = await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/subscribed_apps`, {
    headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
  });
  console.log(await res.text());

  console.log("\nSTEP 1b: Check current app-level webhook subscription (WABA)");
  res = await fetch(`https://graph.facebook.com/v19.0/${WABA_ID}/subscribed_apps`, {
    headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
  });
  console.log(await res.text());

  console.log("\nSTEP 2: Subscribe at the app level");
  res = await fetch(`https://graph.facebook.com/v19.0/${WABA_ID}/subscribed_apps`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
  });
  console.log(await res.text());

  console.log("\nSTEP 3: Verify webhook registered at app level");
  res = await fetch(`https://graph.facebook.com/v19.0/${APP_ID}/subscriptions`, {
    headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
  });
  console.log(await res.text());

  console.log("\nSTEP 4: Register programmatic webhook subscription");
  const form = new URLSearchParams();
  form.append('object', 'whatsapp_business_account');
  form.append('callback_url', 'https://most-subsidize-viral.ngrok-free.dev/webhook/whatsapp');
  form.append('verify_token', 'skillportal_webhook_secret_2007');
  form.append('fields', 'messages');

  res = await fetch(`https://graph.facebook.com/v19.0/${APP_ID}/subscriptions`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form
  });
  console.log(await res.text());
}
run();
