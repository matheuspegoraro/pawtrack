import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import type { Pet } from '@/types';

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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

    if (!user) return;

    const channel = supabase
      .channel(`pets:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPets((prev) => [payload.new as Pet, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPets((prev) =>
              prev.map((p) => (p.id === (payload.new as Pet).id ? (payload.new as Pet) : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setPets((prev) => prev.filter((p) => p.id !== (payload.old as Pet).id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, fetchPets]);

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
