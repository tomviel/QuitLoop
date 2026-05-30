import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let phone: string;
  try {
    ({ phone } = (await req.json()) as { phone: string });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!phone?.trim()) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('users')
    .update({ phone: phone.trim() })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
