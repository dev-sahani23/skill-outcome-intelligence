import { FollowUpStage } from "@prisma/client";

export type WhatsappErrorType = 'invalid_number' | 'auth_error' | 'rate_limit' | 'server_error';

export interface WhatsappResponse {
  success: boolean;
  messageId?: string;
  errorType?: WhatsappErrorType;
}

export function normalizePhoneNumber(phone: string): string {
  // strip all non-digits except +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  if (normalized.startsWith('+91')) {
    normalized = normalized;
  } else if (normalized.startsWith('91') && normalized.length === 12) {
    normalized = '+' + normalized;
  } else if (normalized.startsWith('0') && normalized.length === 11) {
    normalized = '+91' + normalized.substring(1);
  } else if (normalized.length === 10) {
    normalized = '+91' + normalized;
  }
  
  return normalized;
}

export function buildFollowUpMessage(stage: FollowUpStage, name: string): string {
  switch (stage) {
    case 'AT_CERTIFICATION':
      return `Hi ${name}, congratulations on completing your training! We will check in with you over the next 2 years to understand how your career is progressing. Your feedback helps improve training programmes in your district.`;
    case 'DAY_30':
      return `Hi ${name}, it has been 30 days since you completed your training. Are you currently working? Please reply: YES with your job role and monthly income, or NO with the reason you are not working yet.`;
    case 'MONTH_3':
      return `Hi ${name}, it has been 3 months since your training. Quick update request: Are you still in the same job? Please reply with your current job role, employer name, and monthly income. If not working, please share why.`;
    case 'MONTH_6':
      return `Hi ${name}, 6 months update: Are you working? Reply with job role, employer, and monthly salary. If your job changed or you left, please tell us what happened. Your response improves training quality in your district.`;
    case 'MONTH_12':
      return `Hi ${name}, it has been 1 year since your training. Please share: Are you working? Job role? Monthly income? Has your salary increased? Your honest reply helps the government improve skilling programmes.`;
    case 'MONTH_24':
      return `Hi ${name}, 2-year update: Are you working in a field related to your training? Please reply with your current job, income, and whether the training was useful for your career.`;
    default:
      return `Hi ${name}, please update us on your current employment status.`;
  }
}

export async function sendFollowUpWhatsApp(
  phone: string,
  stage: FollowUpStage,
  traineeFirstName: string
): Promise<WhatsappResponse> {
  const normalizedPhone = normalizePhoneNumber(phone);
  
  // Reject with errorType: 'invalid_number' if result is not exactly +91 followed by 10 digits
  const phoneRegex = /^\+91\d{10}$/;
  if (!phoneRegex.test(normalizedPhone)) {
    return { success: false, errorType: 'invalid_number' };
  }

  const messageText = buildFollowUpMessage(stage, traineeFirstName);

  if (process.env.MOCK_WHATSAPP === 'true') {
    console.log(`[MOCK WhatsApp] To: ${normalizedPhone} | Stage: ${stage} | Message: ${messageText}`);
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error("WhatsApp credentials missing in non-mock environment");
    return { success: false, errorType: 'server_error' };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    
    // WhatsApp Cloud API typically expects the number without the '+' symbol
    const toPhone = normalizedPhone.replace('+', '');

    const requestBody = {
      messaging_product: "whatsapp",
      to: toPhone,
      type: "text",
      text: { body: messageText }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("WhatsApp API Error:", response.status, errorData);
      
      const status = response.status;
      if (status === 400) return { success: false, errorType: 'invalid_number' };
      if (status === 401 || status === 403) return { success: false, errorType: 'auth_error' };
      if (status === 429) return { success: false, errorType: 'rate_limit' };
      return { success: false, errorType: 'server_error' };
    }

    const data = await response.json();
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error("WhatsApp Request Failed:", error);
    return { success: false, errorType: 'server_error' };
  }
}
