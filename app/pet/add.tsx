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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { X, Check, ChevronDown, PawPrint } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { appEvents, DATA_CHANGED } from '@/lib/events';
import { usePets } from '@/hooks/usePets';
import { usePremiumStore } from '@/stores/premium';

type Species = 'dog' | 'cat' | 'bird' | 'other';

const SPECIES_OPTIONS: { value: Species; label: string; emoji: string }[] = [
  { value: 'dog', label: 'Dog', emoji: '\u{1F415}' },
  { value: 'cat', label: 'Cat', emoji: '\u{1F408}' },
  { value: 'bird', label: 'Bird', emoji: '\u{1F426}' },
  { value: 'other', label: 'Other', emoji: '\u{1F43E}' },
];

const cardShadow = {
  shadowColor: '#2A2017',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.03,
  shadowRadius: 8,
  elevation: 2,
};

export default function AddPetScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const { pets, addPet, updatePet } = usePets();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const isEditing = !!params.editId;

  // Free users limited to 1 pet
  const atPetLimit = !isPremium && !isEditing && pets.length >= 1;

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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    if (atPetLimit) {
      router.push('/premium');
      return;
    }
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

      appEvents.emit(DATA_CHANGED);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const selectedSpecies = SPECIES_OPTIONS.find((s) => s.value === species)!;
  const displayPhoto = photoUri ?? existingPhotoUrl;

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: Spacing.md }]}>
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
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.photoSection}>
            <Pressable onPress={pickImage} style={styles.photoPickerBtn}>
              {displayPhoto ? (
                <Image source={{ uri: displayPhoto }} style={styles.photoPreview} contentFit="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <PawPrint size={32} color={Colors.terracotta} />
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>

          {/* Name */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={inputStyle('name')}
              placeholder="Your pet's name"
              placeholderTextColor={Colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
          </Animated.View>

          {/* Species picker */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
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
                {SPECIES_OPTIONS.map((opt, index) => {
                  const active = species === opt.value;
                  return (
                    <Animated.View
                      key={opt.value}
                      entering={FadeInDown.duration(300).delay(index * 60)}
                      style={{ flex: 1 }}
                    >
                      <Pressable
                        style={[
                          styles.speciesOption,
                          active && styles.speciesOptionActive,
                        ]}
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
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </Animated.View>

          {/* Breed */}
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={inputStyle('breed')}
              placeholder="e.g. Golden Retriever"
              placeholderTextColor={Colors.textTertiary}
              value={breed}
              onChangeText={setBreed}
              autoCapitalize="words"
              onFocus={() => setFocusedField('breed')}
              onBlur={() => setFocusedField(null)}
            />
          </Animated.View>

          {/* Birth date + Weight */}
          <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Birth Date</Text>
              <TextInput
                style={inputStyle('birthDate')}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textTertiary}
                value={birthDate}
                onChangeText={setBirthDate}
                keyboardType="numbers-and-punctuation"
                onFocus={() => setFocusedField('birthDate')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Weight (lb)</Text>
              <TextInput
                style={inputStyle('weightLb')}
                placeholder="e.g. 55"
                placeholderTextColor={Colors.textTertiary}
                value={weightLb}
                onChangeText={setWeightLb}
                keyboardType="decimal-pad"
                onFocus={() => setFocusedField('weightLb')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </Animated.View>

          {/* Chip ID */}
          <Animated.View entering={FadeInDown.duration(400).delay(600)}>
            <Text style={styles.label}>Microchip ID</Text>
            <TextInput
              style={inputStyle('chipId')}
              placeholder="Optional chip number"
              placeholderTextColor={Colors.textTertiary}
              value={chipId}
              onChangeText={setChipId}
              autoCapitalize="characters"
              onFocus={() => setFocusedField('chipId')}
              onBlur={() => setFocusedField(null)}
            />
          </Animated.View>
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
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
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
  body: { flex: 1, paddingHorizontal: Spacing.lg },

  // Photo
  photoSection: { alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.lg },
  photoPickerBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.terracotta,
    borderStyle: 'dashed',
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoPlaceholderText: { fontSize: 12, fontWeight: '600', color: Colors.terracotta },

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
  inputFocused: {
    borderColor: Colors.terracotta,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
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
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.sand,
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  speciesOptionActive: {
    borderColor: Colors.terracotta,
    backgroundColor: Colors.terracottaLight,
    shadowColor: Colors.terracotta,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
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
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
