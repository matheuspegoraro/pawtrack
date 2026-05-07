import { View, Text, ScrollView, TextInput, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { X, Syringe, Pill, Stethoscope, Weight, Camera, Check } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useState } from 'react';
import type { RecordType } from '@/types';

const RECORD_TYPES: { type: RecordType; label: string; icon: typeof Syringe }[] = [
  { type: 'vaccine', label: 'Vaccine', icon: Syringe },
  { type: 'medication', label: 'Meds', icon: Pill },
  { type: 'vet_visit', label: 'Visit', icon: Stethoscope },
  { type: 'weight', label: 'Weight', icon: Weight },
];

const PETS = [
  { id: '1', name: 'Max', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop&crop=face' },
  { id: '2', name: 'Luna', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop&crop=face' },
  { id: '3', name: 'Buddy', image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fcebc4?w=100&h=100&fit=crop&crop=face' },
];

export default function AddRecordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<RecordType>('vaccine');
  const [selectedPet, setSelectedPet] = useState('1');

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
        <Text style={styles.label}>Record type</Text>
        <View style={styles.typeGrid}>
          {RECORD_TYPES.map((rt) => {
            const Icon = rt.icon;
            const active = selectedType === rt.type;
            return (
              <Pressable
                key={rt.type}
                style={[styles.typeOption, active && styles.typeOptionActive]}
                onPress={() => setSelectedType(rt.type)}
              >
                <Icon size={22} color={active ? Colors.terracotta : Colors.textTertiary} />
                <Text style={[styles.typeLabel, active && { color: Colors.terracotta }]}>{rt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Pet selector */}
        <Text style={styles.label}>Pet</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PETS.map((pet) => (
              <Pressable
                key={pet.id}
                style={[styles.petPill, selectedPet === pet.id && styles.petPillActive]}
                onPress={() => setSelectedPet(pet.id)}
              >
                <Image source={{ uri: pet.image }} style={styles.petImg} />
                <Text style={styles.petLabel}>{pet.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Fields */}
        <Text style={styles.label}>Vaccine name</Text>
        <TextInput style={styles.input} placeholder="e.g. Rabies, DHPP, Bordetella..." placeholderTextColor={Colors.textTertiary} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Date given</Text>
            <TextInput style={styles.input} value="May 6, 2026" placeholderTextColor={Colors.textTertiary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Next due</Text>
            <TextInput style={styles.input} placeholder="Auto-calculated" placeholderTextColor={Colors.textTertiary} />
          </View>
        </View>

        <Text style={styles.label}>Veterinarian</Text>
        <TextInput style={styles.input} placeholder="Dr. name or clinic" placeholderTextColor={Colors.textTertiary} />

        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, styles.textarea]} placeholder="Any additional notes..." placeholderTextColor={Colors.textTertiary} multiline />

        <Pressable style={styles.uploadBtn}>
          <Camera size={18} color={Colors.textTertiary} />
          <Text style={styles.uploadText}>Add photo of document</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.saveBtn}>
          <Check size={18} color="white" />
          <Text style={styles.saveBtnText}>Save Record</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.warmWhite },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 12,
    backgroundColor: Colors.warmWhite,
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
  body: { flex: 1, paddingHorizontal: Spacing.lg },
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
    backgroundColor: Colors.sand,
  },
  petPillActive: { borderColor: Colors.terracotta, backgroundColor: Colors.terracottaLight },
  petImg: { width: 26, height: 26, borderRadius: 13 },
  petLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  input: {
    backgroundColor: Colors.sand,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: 13,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    marginTop: Spacing.sm,
  },
  uploadText: { fontSize: 14, fontWeight: '600', color: Colors.textTertiary },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.terracotta,
    padding: 16,
    borderRadius: Radius.md,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
});
