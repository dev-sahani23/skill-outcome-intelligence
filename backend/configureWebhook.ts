import "dotenv/config";

async function run() {
  const appId = "1042467461955024";
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const callbackUrl = "https://most-subsidize-viral.ngrok-free.dev/webhook/whatsapp";
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  
  if (!token) throw new Error("Missing WHATSAPP_ACCESS_TOKEN");

  console.log("1. Checking current webhook configuration...");
  try {
    const getRes = await fetch(`https://graph.facebook.com/v19.0/${appId}/subscriptions?access_token=${token}`);
    const getData = await getRes.json();
    console.log(JSON.stringify(getData, null, 2));

    console.log("\n2. Configuring Webhook Callback URL and subscribing 'messages' field...");
    const postData = new URLSearchParams();
    postData.append('object', 'whatsapp_business_account');
    postData.append('callback_url', callbackUrl);
    postData.append('verify_token', verifyToken!);
    postData.append('fields', 'messages');
    postData.append('access_token', token);

    const postRes = await fetch(`https://graph.facebook.com/v19.0/${appId}/subscriptions`, {
      method: 'POST',
      body: postData
    });
    const postResult = await postRes.json();
    console.log("Subscription Result:", postResult);

    console.log("\n3. Confirming subscription is active...");
    const checkRes = await fetch(`https://graph.facebook.com/v19.0/${appId}/subscriptions?access_token=${token}`);
    const checkData = await checkRes.json();
    console.log(JSON.stringify(checkData, null, 2));

  } catch (err) {
    console.error("Error configuring webhook:", err);
  }
}

run();
