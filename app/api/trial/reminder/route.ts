import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Runs daily at 9am UTC via Vercel Cron.
// Sends a "trial ends tomorrow" email on day 6 of the trial.
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();

  // Find trialing subscriptions where trial ends in ~24h (between 20h and 28h from now)
  const low = new Date(now.getTime() + 20 * 60 * 60 * 1000).toISOString();
  const high = new Date(now.getTime() + 28 * 60 * 60 * 1000).toISOString();

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, trial_ends_at')
    .eq('status', 'trialing')
    .gte('trial_ends_at', low)
    .lte('trial_ends_at', high);

  if (!subscriptions?.length) {
    return NextResponse.json({ sent: 0, message: 'No expiring trials' });
  }

  let sent = 0;

  for (const sub of subscriptions) {
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', sub.user_id)
      .single();

    if (!user?.email) continue;

    await sendTrialEndingEmail(user.email);
    sent++;
  }

  return NextResponse.json({ sent });
}

async function sendTrialEndingEmail(email: string) {
  if (!process.env.RESEND_API_KEY) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getquitloop.com';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'QuitLoop <noreply@quitloop.app>',
      to: email,
      subject: 'Your QuitLoop free trial ends tomorrow',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0A0A0A;color:#FFFFFF;padding:32px;border-radius:16px">
          <div style="width:48px;height:48px;border-radius:50%;background:#C0392B;display:flex;align-items:center;justify-content:center;margin-bottom:20px">
            <span style="color:white;font-weight:bold;font-size:14px">QL</span>
          </div>
          <h2 style="font-size:22px;margin:0 0 12px">Your free trial ends tomorrow</h2>
          <p style="color:#888;margin:0 0 20px;line-height:1.6">
            You've been building something real. Don't let it stop here —
            subscribe to keep your streaks, alerts, and AI interventions going.
          </p>
          <a href="${appUrl}/pricing"
             style="display:inline-block;background:#C0392B;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
            Continue with QuitLoop
          </a>
          <p style="color:#555;font-size:12px;margin-top:24px">
            Plans start at €9/month. Cancel anytime.
          </p>
        </div>
      `,
    }),
  }).catch((err) => console.error('[trial/reminder] email error:', err));
}
