import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { appEvents, DATA_CHANGED } from '@/lib/events';
import type { Pet } from '@/types';

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  const fetchPets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPets(data as Pet[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPets();
    const unsub = appEvents.on(DATA_CHANGED, fetchPets);
    return unsub;
  }, [fetchPets]);

  const addPet = useCallback(
    async (data: Omit<Pet, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('pets')
        .insert({ ...data, user_id: user.id });
      if (error) throw error;
    },
    [user]
  );

  const updatePet = useCallback(
    async (id: string, data: Partial<Omit<Pet, 'id' | 'user_id' | 'created_at'>>) => {
      const { error } = await supabase.from('pets').update(data).eq('id', id);
      if (error) throw error;
    },
    []
  );

  const deletePet = useCallback(async (id: string) => {
    const { error } = await supabase.from('pets').delete().eq('id', id);
    if (error) throw error;
  }, []);

  return { pets, loading, addPet, updatePet, deletePet, refresh: fetchPets };
}
