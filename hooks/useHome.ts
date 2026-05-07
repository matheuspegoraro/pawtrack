import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { appEvents, DATA_CHANGED } from '@/lib/events';
import { startOfDay, endOfDay, format } from 'date-fns';
import type { Pet, HealthRecord, Reminder } from '@/types';

export interface ReminderWithPet extends Reminder {
  pet_name: string;
}

export interface UpcomingRecord extends HealthRecord {
  pet_name: string;
  pet_photo: string | null;
}

export function useHome() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [todayTasks, setTodayTasks] = useState<ReminderWithPet[]>([]);
  const [overdue, setOverdue] = useState<ReminderWithPet[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const todayEnd = endOfDay(now).toISOString();

      const [petsRes, todayRes, overdueRes, upcomingRes] = await Promise.all([
        // Fetch user's pets
        supabase
          .from('pets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),

        // Today's reminders: remind_at is today and is_active
        supabase
          .from('reminders')
          .select('*, pets(name)')
          .eq('is_active', true)
          .gte('remind_at', todayStart)
          .lte('remind_at', todayEnd)
          .order('remind_at', { ascending: true }),

        // Overdue reminders: remind_at < start of today and still active
        supabase
          .from('reminders')
          .select('*, pets(name)')
          .eq('is_active', true)
          .lt('remind_at', todayStart)
          .order('remind_at', { ascending: true }),

        // Upcoming health records with future next_due_date
        supabase
          .from('health_records')
          .select('*, pets(name, photo_url)')
          .gt('next_due_date', todayEnd)
          .order('next_due_date', { ascending: true })
          .limit(5),
      ]);

      if (petsRes.data) {
        setPets(petsRes.data as Pet[]);
      }

      if (todayRes.data) {
        setTodayTasks(
          (todayRes.data as any[]).map((r) => ({
            ...r,
            pet_name: r.pets?.name ?? 'Unknown',
            pets: undefined,
          }))
        );
      }

      if (overdueRes.data) {
        setOverdue(
          (overdueRes.data as any[]).map((r) => ({
            ...r,
            pet_name: r.pets?.name ?? 'Unknown',
            pets: undefined,
          }))
        );
      }

      if (upcomingRes.data) {
        setUpcoming(
          (upcomingRes.data as any[]).map((r) => ({
            ...r,
            pet_name: r.pets?.name ?? 'Unknown',
            pet_photo: r.pets?.photo_url ?? null,
            pets: undefined,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch home data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
    const unsub = appEvents.on(DATA_CHANGED, fetchAll);
    return unsub;
  }, [fetchAll]);

  return { pets, todayTasks, overdue, upcoming, loading, refresh: fetchAll };
}
