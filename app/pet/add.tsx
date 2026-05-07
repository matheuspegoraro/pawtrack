import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera, Check, ChevronDown } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { usePets } from '@/hooks/usePets';

type Species = 'dog' | 'cat' | 'bird' | 'other';

const SPECIES_OPTIONS: { value: Species; label: string; emoji: string }[] = [
  { value: 'dog', label: 'Dog', emoji: '🐕' },
  { value: 'cat', label: 'Cat', emoji: '🐈' },
  { value: 'bird', label: 'Bird', emoji: '🐦' },
  { value: 'other', label: 'Other', emoji: '🐾' },
];

export default function AddPetScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const { pets, addPet, updatePet } = usePets();
  const isEditing = !!params.editId;

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('dog');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weightLb, setWeightLb] = useState('');
  const [chipId, setChipId] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (isEditing && pets.length > 0) {
      const pet = pets.find((p) => p.id === params.editId);
      if (pet) {
        setName(pet.name);
        setSpecies(pet.species);
        setBreed(pet.breed ?? '');
        setBirthDate(pet.birth_date ?? '');
        setWeightLb(pet.weight_lb?.toString() ?? '');
        setChipId(pet.chip_id ?? '');
        setExistingPhotoUrl(pet.photo_url);
      }
    }
  }, [isEditing, pets, params.editId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    try {
      const extension = uri.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}.${extension}`;
      const filePath = `pets/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${extension}`,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage.from('pet-photos').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Photo upload failed:', err);
      return null;
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter your pet\'s name.');
      return;
    }

    setSaving(true);

    try {
      let photoUrl = existingPhotoUrl;

      if (photoUri) {
        const uploaded = await uploadPhoto(photoUri);
        if (uploaded) photoUrl = uploaded;
      }

      const petData = {
        name: name.trim(),
        species,
        breed: breed.trim() || null,
        birth_date: birthDate.trim() || null,
        weight_lb: weightLb ? parseFloat(weightLb) : null,
        chip_id: chipId.trim() || null,
        photo_url: photoUrl,
        notes: null,
      };

      if (isEditing && params.editId) {
        await updatePet(params.editId, petData);
      } else {
        await addPet(petData);
      }

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const selectedSpecies = SPECIES_OPTIONS.find((s) => s.value === species)!;
  const displayPhoto = photoUri ?? existingPhotoUrl;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={18} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.topTitle}>{isEditing ? 'Edit Pet' : 'Add Pet'}</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo picker */}
          <View style={styles.photoSection}>
            <Pressable onPress={pickImage} style={styles.photoPickerBtn}>
              {displayPhoto ? (
                <Image source={{ uri: displayPhoto }} style={styles.photoPreview} contentFit="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Camera size={28} color={Colors.textTertiary} />
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Name */}
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your pet's name"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Species picker */}
          <Text style={styles.label}>Species</Text>
          <Pressable
            style={styles.pickerBtn}
            onPress={() => setShowSpeciesPicker(!showSpeciesPicker)}
          >
            <Text style={styles.pickerValue}>
              {selectedSpecies.emoji} {selectedSpecies.label}
            </Text>
            <ChevronDown size={16} color={Colors.textTertiary} />
          </Pressable>

          {showSpeciesPicker && (
            <View style={styles.speciesGrid}>
              {SPECIES_OPTIONS.map((opt) => {
                const active = species === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.speciesOption, active && styles.speciesOptionActive]}
                    onPress={() => {
                      setSpecies(opt.value);
                      setShowSpeciesPicker(false);
                    }}
                  >
                    <Text style={styles.speciesEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.speciesLabel, active && { color: Colors.terracotta }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Breed */}
          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Golden Retriever"
            placeholderTextColor={Colors.textTertiary}
            value={breed}
            onChangeText={setBreed}
            autoCapitalize="words"
          />

          {/* Birth date + Weight */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Birth Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textTertiary}
                value={birthDate}
                onChangeText={setBirthDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Weight (lb)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 55"
                placeholderTextColor={Colors.textTertiary}
                value={weightLb}
                onChangeText={setWeightLb}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Chip ID */}
          <Text style={styles.label}>Microchip ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional chip number"
            placeholderTextColor={Colors.textTertiary}
            value={chipId}
            onChangeText={setChipId}
            autoCapitalize="characters"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Check size={18} color={Colors.white} />
              <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Add Pet'}</Text>
            </>
          )}
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

  // Photo
  photoSection: { alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg },
  photoPickerBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: Colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoPlaceholderText: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary },

  // Form
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
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
  row: { flexDirection: 'row', gap: 10 },

  // Species picker
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.sand,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: 13,
    marginBottom: Spacing.sm,
  },
  pickerValue: { fontSize: 15, color: Colors.textPrimary },
  speciesGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  speciesOption: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.sand,
  },
  speciesOptionActive: {
    borderColor: Colors.terracotta,
    backgroundColor: Colors.terracottaLight,
  },
  speciesEmoji: { fontSize: 22 },
  speciesLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  // Footer
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
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
