import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  X,
  Syringe,
  Pill,
  Stethoscope,
  Weight,
  Camera,
  Check,
  PawPrint,
  Plus,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { scheduleLocalNotification } from '@/lib/notifications';
import type { RecordType, Pet } from '@/types';

const RECORD_TYPES: { type: RecordType; label: string; icon: typeof Syringe }[] = [
  { type: 'vaccine', label: 'Vaccine', icon: Syringe },
  { type: 'medication', label: 'Meds', icon: Pill },
  { type: 'vet_visit', label: 'Visit', icon: Stethoscope },
  { type: 'weight', label: 'Weight', icon: Weight },
];

const FIELD_LABELS: Record<RecordType, string> = {
  vaccine: 'Vaccine name',
  medication: 'Medication name',
  vet_visit: 'Visit reason',
  symptom: 'Symptom',
  weight: 'Weight (lb)',
};

export default function AddRecordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedType, setSelectedType] = useState<RecordType>('vaccine');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [nextDueDate, setNextDueDate] = useState('');
  const [vetName, setVetName] = useState('');
  const [notes, setNotes] = useState('');
  const [dosage, setDosage] = useState('');
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Fetch pets from Supabase
  useEffect(() => {
    async function fetchPets() {
      const { data } = await supabase
        .from('pets')
        .select('*')
        .order('name');

      if (data && data.length > 0) {
        setPets(data);
        setSelectedPetId(data[0].id);
      }
    }
    fetchPets();
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedPetId) {
      Alert.alert('Select a pet', 'Please select a pet for this record.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for this record.');
      return;
    }

    setSaving(true);
    try {
      // Insert health record
      const { data: record, error: recordError } = await supabase
        .from('health_records')
        .insert({
          pet_id: selectedPetId,
          type: selectedType,
          title: title.trim(),
          date,
          next_due_date: nextDueDate || null,
          description: notes.trim() || null,
          vet_name: vetName.trim() || null,
          dosage: dosage.trim() || null,
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Auto-create reminder if next_due_date is set
      if (nextDueDate && record) {
        const remindAt = new Date(nextDueDate);
        remindAt.setHours(9, 0, 0, 0); // Default to 9 AM

        const pet = pets.find((p) => p.id === selectedPetId);
        const reminderTitle = `${title.trim()} — ${pet?.name ?? 'Pet'}`;

        const { error: reminderError } = await supabase
          .from('reminders')
          .insert({
            pet_id: selectedPetId,
            health_record_id: record.id,
            title: reminderTitle,
            remind_at: remindAt.toISOString(),
            is_active: true,
          });

        if (reminderError) {
          console.warn('Failed to create reminder:', reminderError);
        } else {
          // Schedule local notification
          try {
            await scheduleLocalNotification(
              reminderTitle,
              `Due: ${format(remindAt, 'MMM d, yyyy')}`,
              remindAt
            );
          } catch {
            // Notification scheduling is best-effort
          }
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Health record saved successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error('Save failed:', err);
      Alert.alert('Error', err?.message ?? 'Failed to save record. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [selectedPetId, selectedType, title, date, nextDueDate, notes, vetName, dosage, pets, router]);

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={18} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.topTitle}>New Record</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Type selector */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={styles.label}>Record type</Text>
          <View style={styles.typeGrid}>
            {RECORD_TYPES.map((rt) => {
              const Icon = rt.icon;
              const active = selectedType === rt.type;
              return (
                <Pressable
                  key={rt.type}
                  style={[styles.typeOption, active && styles.typeOptionActive]}
                  onPress={() => {
                    setSelectedType(rt.type);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Icon size={22} color={active ? Colors.terracotta : Colors.textTertiary} />
                  <Text style={[styles.typeLabel, active && { color: Colors.terracotta }]}>
                    {rt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Pet selector */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.label}>Pet</Text>
          {pets.length === 0 ? (
            <View style={styles.emptyPets}>
              <View style={styles.emptyPetsIcon}>
                <PawPrint size={24} color={Colors.terracotta} />
              </View>
              <Text style={styles.emptyPetsTitle}>No pets yet</Text>
              <Text style={styles.emptyPetsText}>
                Add a pet first to start tracking their health records.
              </Text>
              <Pressable
                style={styles.emptyPetsBtn}
                onPress={() => router.push('/pet/add')}
              >
                <Plus size={16} color={Colors.warmWhite} />
                <Text style={styles.emptyPetsBtnText}>Add a Pet</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.lg }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {pets.map((pet) => (
                  <Pressable
                    key={pet.id}
                    style={[styles.petPill, selectedPetId === pet.id && styles.petPillActive]}
                    onPress={() => setSelectedPetId(pet.id)}
                  >
                    {pet.photo_url ? (
                      <Image source={{ uri: pet.photo_url }} style={styles.petImg} />
                    ) : (
                      <View style={[styles.petImg, styles.petImgPlaceholder]}>
                        <Text style={styles.petInitial}>
                          {pet.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.petLabel}>{pet.name}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
        </Animated.View>

        {/* Fields */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={styles.label}>{FIELD_LABELS[selectedType]}</Text>
          <TextInput
            style={inputStyle('title')}
            placeholder={
              selectedType === 'vaccine'
                ? 'e.g. Rabies, DHPP, Bordetella...'
                : selectedType === 'medication'
                ? 'e.g. Heartworm pill, Flea treatment...'
                : selectedType === 'weight'
                ? 'e.g. 45'
                : 'Enter title...'
            }
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setFocusedField('title')}
            onBlur={() => setFocusedField(null)}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={inputStyle('date')}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textTertiary}
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Next due</Text>
              <TextInput
                style={inputStyle('nextDue')}
                value={nextDueDate}
                onChangeText={setNextDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textTertiary}
                onFocus={() => setFocusedField('nextDue')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          {(selectedType === 'medication') && (
            <>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={inputStyle('dosage')}
                placeholder="e.g. 50mg daily"
                placeholderTextColor={Colors.textTertiary}
                value={dosage}
                onChangeText={setDosage}
                onFocus={() => setFocusedField('dosage')}
                onBlur={() => setFocusedField(null)}
              />
            </>
          )}

          {(selectedType === 'vaccine' || selectedType === 'vet_visit') && (
            <>
              <Text style={styles.label}>Veterinarian</Text>
              <TextInput
                style={inputStyle('vet')}
                placeholder="Dr. name or clinic"
                placeholderTextColor={Colors.textTertiary}
                value={vetName}
                onChangeText={setVetName}
                onFocus={() => setFocusedField('vet')}
                onBlur={() => setFocusedField(null)}
              />
            </>
          )}

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[...inputStyle('notes'), styles.textarea]}
            placeholder="Any additional notes..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            value={notes}
            onChangeText={setNotes}
            onFocus={() => setFocusedField('notes')}
            onBlur={() => setFocusedField(null)}
          />

          <Pressable style={styles.uploadBtn}>
            <Camera size={18} color={Colors.textTertiary} />
            <Text style={styles.uploadText}>Add photo of document</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInDown.duration(400).delay(500)}
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Check size={18} color="white" />
          )}
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : 'Save Record'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sand },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 16,
    backgroundColor: Colors.warmWhite,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: -4,
    zIndex: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  body: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  typeGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.warmWhite,
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  typeOptionActive: {
    borderColor: Colors.terracotta,
    backgroundColor: Colors.terracottaLight,
  },
  typeLabel: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary },
  petPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 12,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.warmWhite,
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  petPillActive: { borderColor: Colors.terracotta, backgroundColor: Colors.terracottaLight },
  petImg: { width: 26, height: 26, borderRadius: 13 },
  petImgPlaceholder: {
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInitial: { fontSize: 12, fontWeight: '700', color: Colors.terracotta },
  petLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  emptyPets: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyPetsIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyPetsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyPetsText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyPetsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.terracotta,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  emptyPetsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warmWhite,
  },
  input: {
    backgroundColor: Colors.warmWhite,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: 13,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputFocused: {
    borderColor: Colors.terracotta,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    marginTop: Spacing.sm,
    backgroundColor: Colors.warmWhite,
  },
  uploadText: { fontSize: 14, fontWeight: '600', color: Colors.textTertiary },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.sand,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.terracotta,
    padding: 16,
    borderRadius: Radius.md,
    shadowColor: Colors.terracottaDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
});
