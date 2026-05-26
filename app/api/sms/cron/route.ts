import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '@/lib/twilio';
import type { Database } from '@/types/database';

// Vercel Cron calls this every 30 minutes.
// Auth: Vercel automatically sets Authorization: Bearer <CRON_SECRET>
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Use the service role to bypass RLS — cron runs on behalf of all users
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getquitloop.com';
  const dashboardUrl = `${appUrl}/dashboard`;

  // Fetch all active SMS schedules joined with user phone
  const { data: schedules, error } = await supabase
    .from('sms_schedules')
    .select('user_id, craving_start, craving_end, timezone, users!inner(phone)')
    .eq('active', true);

  if (error) {
    console.error('[sms/cron] fetch error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  const today = new Date().toISOString().split('T')[0]; // UTC date

  for (const schedule of schedules ?? []) {
    const phone = (schedule.users as { phone: string | null } | null)?.phone;
    if (!phone) {
      skipped++;
      continue;
    }

    const { userId, smsType, shouldSend } = evaluateSchedule(schedule);
    if (!shouldSend || !smsType) {
      skipped++;
      continue;
    }

    // Check if we already sent this type today
    const { data: existing } = await supabase
      .from('sms_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('sms_type', smsType)
      .eq('sent_date', today)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    // Check total SMS sent today (max 2)
    const { count: todayCount } = await supabase
      .from('sms_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('sent_date', today);

    if ((todayCount ?? 0) >= 2) {
      skipped++;
      continue;
    }

    // Check if user already used the app today (skip in-window SMS if so)
    if (smsType === 'in_window') {
      const userLocalDate = getLocalDate(schedule.timezone);
      const { count: sessionsToday } = await supabase
        .from('craving_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${userLocalDate}T00:00:00`);

      if ((sessionsToday ?? 0) > 0) {
        skipped++;
        continue;
      }
    }

    // Send the SMS
    const message =
      smsType === 'pre_window'
        ? `Your craving window is starting soon. Open QuitLoop before it hits: ${dashboardUrl}`
        : `Still holding? We're here if you need us ${dashboardUrl}`;

    try {
      await sendSMS(phone, message);

      // Log the send to prevent duplicates
      await supabase.from('sms_logs').insert({
        user_id: userId,
        sms_type: smsType,
        sent_date: today,
      });

      sent++;
    } catch (err) {
      console.error(`[sms/cron] failed to send SMS to user ${userId}:`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    total: (schedules ?? []).length,
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface Schedule {
  user_id: string;
  craving_start: string; // "HH:MM"
  craving_end: string;   // "HH:MM"
  timezone: string;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function getCurrentMinutesInTz(timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0');
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0');
    return h * 60 + m;
  } catch {
    return 0;
  }
}

function getLocalDate(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone })
      .format(new Date()); // en-CA gives YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function evaluateSchedule(
  schedule: Schedule
): { userId: string; smsType: 'pre_window' | 'in_window' | null; shouldSend: boolean } {
  const nowMins = getCurrentMinutesInTz(schedule.timezone);
  const startMins = timeToMinutes(schedule.craving_start);
  const endMins = timeToMinutes(schedule.craving_end);

  // 15 minutes before the craving window opens
  const preWindowStart = startMins - 15;
  const preWindowEnd = startMins;

  if (nowMins >= preWindowStart && nowMins < preWindowEnd) {
    return { userId: schedule.user_id, smsType: 'pre_window', shouldSend: true };
  }

  // Inside the craving window
  if (nowMins >= startMins && nowMins < endMins) {
    return { userId: schedule.user_id, smsType: 'in_window', shouldSend: true };
  }

  return { userId: schedule.user_id, smsType: null, shouldSend: false };
}
