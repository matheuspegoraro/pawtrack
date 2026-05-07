export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed: string | null;
  birth_date: string | null;
  weight_lb: number | null;
  photo_url: string | null;
  chip_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  pet_id: string;
  type: 'vaccine' | 'medication' | 'vet_visit' | 'symptom' | 'weight';
  title: string;
  description: string | null;
  date: string;
  next_due_date: string | null;
  dosage: string | null;
  frequency: string | null;
  vet_name: string | null;
  vet_clinic: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  pet_id: string;
  health_record_id: string | null;
  title: string;
  remind_at: string;
  repeat_interval: string | null;
  is_active: boolean;
  last_notified_at: string | null;
  created_at: string;
}

export type RecordType = HealthRecord['type'];
