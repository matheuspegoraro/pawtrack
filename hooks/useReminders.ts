import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { appEvents, DATA_CHANGED } from '@/lib/events';
import type { Reminder } from '@/types';

export interface ReminderWithPet extends Reminder {
  pet_name: string;
}

interface AddReminderData {
  pet_id: string;
  health_record_id?: string | null;
  title: string;
  remind_at: string;
  repeat_interval?: string | null;
}

export function useReminders() {
  const [reminders, setReminders] = useState<ReminderWithPet[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, pets(name)')
        .order('remind_at', { ascending: true });

      if (error) throw error;

      const mapped: ReminderWithPet[] = (data ?? []).map((r: any) => ({
        id: r.id,
        pet_id: r.pet_id,
        health_record_id: r.health_record_id,
        title: r.title,
        remind_at: r.remind_at,
        repeat_interval: r.repeat_interval,
        is_active: r.is_active,
        last_notified_at: r.last_notified_at,
        created_at: r.created_at,
        pet_name: r.pets?.name ?? 'Unknown',
      }));

      setReminders(mapped);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsub = appEvents.on(DATA_CHANGED, refresh);
    return unsub;
  }, [refresh]);

  const addReminder = useCallback(async (data: AddReminderData) => {
    const { error } = await supabase.from('reminders').insert({
      pet_id: data.pet_id,
      health_record_id: data.health_record_id ?? null,
      title: data.title,
      remind_at: data.remind_at,
      repeat_interval: data.repeat_interval ?? null,
      is_active: true,
    });

    if (error) throw error;
    await refresh();
  }, [refresh]);

  const toggleReminder = useCallback(async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_active: active })
      .eq('id', id);

    if (error) throw error;
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: active } : r))
    );
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { reminders, loading, addReminder, toggleReminder, deleteReminder, refresh };
}
