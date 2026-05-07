import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { HealthRecord, RecordType } from '@/types';

interface UseRecordsOptions {
  petId: string;
  type?: RecordType;
}

export function useRecords({ petId, type }: UseRecordsOptions) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!petId) return;
    setLoading(true);

    let query = supabase
      .from('health_records')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (!error && data) {
      setRecords(data as HealthRecord[]);
    }
    setLoading(false);
  }, [petId, type]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = useCallback(
    async (data: Omit<HealthRecord, 'id' | 'created_at'>) => {
      const { data: inserted, error } = await supabase
        .from('health_records')
        .insert(data)
        .select()
        .single();
      if (error) throw error;

      const record = inserted as HealthRecord;

      // Auto-create a reminder when next_due_date is set
      if (record.next_due_date) {
        await supabase.from('reminders').insert({
          pet_id: record.pet_id,
          health_record_id: record.id,
          title: record.title,
          remind_at: record.next_due_date,
          is_active: true,
        });
      }

      setRecords((prev) => [record, ...prev]);
      return record;
    },
    []
  );

  const deleteRecord = useCallback(async (id: string) => {
    const { error } = await supabase.from('health_records').delete().eq('id', id);
    if (error) throw error;
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { records, loading, addRecord, deleteRecord, refresh: fetchRecords };
}
