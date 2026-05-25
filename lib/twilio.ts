import twilio from 'twilio';

let _client: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  return _client;
}

export async function sendSMS(to: string, body: string): Promise<void> {
  const client = getTwilioClient();
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });
}
