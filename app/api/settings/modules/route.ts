import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AddictionType } from '@/types';

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { addictionType, active } = (await req.json()) as {
    addictionType: AddictionType;
    active: boolean;
  };

  // Upsert the module record
  const { error } = await supabase
    .from('modules')
    .upsert(
      { user_id: user.id, addiction_type: addictionType, active },
      { onConflict: 'user_id,addiction_type' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
