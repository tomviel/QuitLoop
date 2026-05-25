'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Streak, AddictionType } from '@/types';

export function useStreak(addictionType?: AddictionType) {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id);

      if (addictionType) {
        query = query.eq('addiction_type', addictionType);
      }

      const { data } = await query;
      if (data) setStreaks(data as Streak[]);
      setLoading(false);
    }

    load();
  }, [addictionType]);

  const getStreak = (type: AddictionType) =>
    streaks.find((s) => s.addiction_type === type);

  const totalCurrentStreak = streaks.reduce((sum, s) => sum + s.current_streak, 0);

  return { streaks, loading, getStreak, totalCurrentStreak };
}
