import React, { useState } from 'react';
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
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DARK_COLORS } from '@/constants/theme';

export default function EditProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement profile update with Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePhoto = () => {
    // TODO: Implement image picker
    Alert.alert('Coming Soon', 'Photo upload will be available soon!');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit Profile',
          headerStyle: { backgroundColor: DARK_COLORS.background },
          headerTitleStyle: { fontWeight: '700', color: DARK_COLORS.textPrimary },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color={DARK_COLORS.textPrimary} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={isSaving} style={styles.headerButton}>
              <Check size={24} color={isSaving ? DARK_COLORS.textMuted : DARK_COLORS.primary} />
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
                uri={null}
                name={user?.email ?? 'User'}
                size={120}
              />
              <Pressable style={styles.cameraButton} onPress={handleChangePhoto}>
                <Camera size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            <Pressable onPress={handleChangePhoto}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
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
                placeholderTextColor={DARK_COLORS.textMuted}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={DARK_COLORS.border}
                activeOutlineColor={DARK_COLORS.primary}
                textColor={DARK_COLORS.textPrimary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={DARK_COLORS.textMuted}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={DARK_COLORS.border}
                activeOutlineColor={DARK_COLORS.primary}
                textColor={DARK_COLORS.textPrimary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+972 XX XXX XXXX"
                placeholderTextColor={DARK_COLORS.textMuted}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={DARK_COLORS.border}
                activeOutlineColor={DARK_COLORS.primary}
                textColor={DARK_COLORS.textPrimary}
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
                outlineColor={DARK_COLORS.border}
                textColor={DARK_COLORS.textMuted}
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
                placeholderTextColor={DARK_COLORS.textMuted}
                mode="outlined"
                style={[styles.input, styles.textArea]}
                outlineStyle={styles.inputOutline}
                outlineColor={DARK_COLORS.border}
                activeOutlineColor={DARK_COLORS.primary}
                textColor={DARK_COLORS.textPrimary}
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
            buttonColor={DARK_COLORS.primary}
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
    backgroundColor: DARK_COLORS.background,
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
    backgroundColor: DARK_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: DARK_COLORS.surface,
  },
  changePhotoText: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK_COLORS.primary,
  },
  formCard: {
    borderRadius: 16,
    backgroundColor: DARK_COLORS.surface,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: DARK_COLORS.input,
  },
  inputOutline: {
    borderRadius: 12,
  },
  textArea: {
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    color: DARK_COLORS.textMuted,
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
