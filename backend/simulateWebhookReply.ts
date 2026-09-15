async function run() {
  const payload = {
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "1937533330248247",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "phone_number_id": "1295613003641963"
          },
          "messages": [{
            "from": "917567186619",
            "id": "wamid.test123",
            "timestamp": "1234567890",
            "text": {
              "body": "haan kaam mil gaya electrician ka, 14000 mahina"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  };

  try {
    const res = await fetch('http://localhost:5000/webhook/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
