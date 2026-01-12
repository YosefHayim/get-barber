import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Camera, X, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/services/supabase/client';
import { COLORS } from '@/constants/theme';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

export default function EditProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Initialize form with existing profile data
  useEffect(() => {
    if (profile) {
      const nameParts = (profile.display_name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPhone(profile.phone || '');
      setAvatarUri(profile.avatar_url || null);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const displayName = `${firstName} ${lastName}`.trim();
      const updates: { display_name?: string; phone?: string } = {};

      if (displayName) updates.display_name = displayName;
      if (phone) updates.phone = phone;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadProfileImage = async (uri: string) => {
    if (!user?.id) return;

    setIsUploadingImage(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      Alert.alert('Success', 'Profile photo updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      setAvatarUri(profile?.avatar_url || null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleChangePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await uploadProfileImage(uri);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit Profile',
          headerStyle: { backgroundColor: LIGHT_COLORS.background },
          headerTitleStyle: { fontWeight: '700', color: LIGHT_COLORS.textPrimary },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color={LIGHT_COLORS.textPrimary} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={isSaving} style={styles.headerButton}>
              <Check size={24} color={isSaving ? LIGHT_COLORS.textMuted : COLORS.copper} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Avatar
                uri={avatarUri}
                name={profile?.display_name ?? user?.email ?? 'User'}
                size={120}
              />
              <Pressable
                style={[styles.cameraButton, isUploadingImage && styles.cameraButtonDisabled]}
                onPress={handleChangePhoto}
                disabled={isUploadingImage}
              >
                <Camera size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            <Pressable onPress={handleChangePhoto} disabled={isUploadingImage}>
              <Text style={styles.changePhotoText}>
                {isUploadingImage ? 'Uploading...' : 'Change Photo'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={LIGHT_COLORS.textMuted}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={LIGHT_COLORS.border}
                activeOutlineColor={COLORS.copper}
                textColor={LIGHT_COLORS.textPrimary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={LIGHT_COLORS.textMuted}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={LIGHT_COLORS.border}
                activeOutlineColor={COLORS.copper}
                textColor={LIGHT_COLORS.textPrimary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+972 XX XXX XXXX"
                placeholderTextColor={LIGHT_COLORS.textMuted}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={LIGHT_COLORS.border}
                activeOutlineColor={COLORS.copper}
                textColor={LIGHT_COLORS.textPrimary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={user?.email ?? ''}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={LIGHT_COLORS.border}
                textColor={LIGHT_COLORS.textMuted}
                disabled
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>About You</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us a bit about yourself..."
                placeholderTextColor={LIGHT_COLORS.textMuted}
                mode="outlined"
                style={[styles.input, styles.textArea]}
                outlineStyle={styles.inputOutline}
                outlineColor={LIGHT_COLORS.border}
                activeOutlineColor={COLORS.copper}
                textColor={LIGHT_COLORS.textPrimary}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            buttonColor={COLORS.copper}
          >
            Save Changes
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerButton: {
    padding: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.copper,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: LIGHT_COLORS.surface,
  },
  cameraButtonDisabled: {
    opacity: 0.5,
  },
  changePhotoText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.copper,
  },
  formCard: {
    borderRadius: 16,
    backgroundColor: LIGHT_COLORS.surface,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LIGHT_COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
  },
  inputOutline: {
    borderRadius: 12,
  },
  textArea: {
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    color: LIGHT_COLORS.textMuted,
    marginTop: 4,
  },
  saveButton: {
    borderRadius: 14,
    marginTop: 8,
  },
  saveButtonContent: {
    height: 52,
  },
});
