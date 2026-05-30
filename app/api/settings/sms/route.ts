import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let cravingStart: string | undefined, cravingEnd: string | undefined, active: boolean | undefined;
  try {
    ({ cravingStart, cravingEnd, active } = (await req.json()) as {
      cravingStart?: string;
      cravingEnd?: string;
      active?: boolean;
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  type SmsUpdate = { craving_start?: string; craving_end?: string; active?: boolean };
  const updates: SmsUpdate = {};
  if (cravingStart !== undefined) updates.craving_start = cravingStart;
  if (cravingEnd !== undefined) updates.craving_end = cravingEnd;
  if (active !== undefined) updates.active = active;

  const { error } = await supabase
    .from('sms_schedules')
    .update(updates)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
