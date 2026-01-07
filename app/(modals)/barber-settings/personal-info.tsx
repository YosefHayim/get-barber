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
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Check,
} from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

export default function PersonalInfoScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  
  const [firstName, setFirstName] = useState('Yossi');
  const [lastName, setLastName] = useState('Cohen');
  const [email, setEmail] = useState('yossi@barbershop.com');
  const [phone, setPhone] = useState('+972-50-123-4567');
  const [businessName, setBusinessName] = useState("Yossi's Barbershop");
  const [bio, setBio] = useState('Master barber with 15 years of experience. Specializing in classic cuts and hot towel shaves.');
  const [address, setAddress] = useState('Tel Aviv, Israel');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
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
    Alert.alert('Coming Soon', 'Photo upload will be available soon!');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Personal Info',
          headerStyle: { backgroundColor: COLORS.charcoal },
          headerTitleStyle: { fontWeight: '700', color: COLORS.textInverse },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={COLORS.gold} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={isSaving} style={styles.headerButton}>
              <Check size={24} color={isSaving ? COLORS.textMuted : COLORS.gold} />
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
              <Avatar uri={null} name="Yossi Cohen" size={100} />
              <Pressable style={styles.cameraButton} onPress={handleChangePhoto}>
                <Camera size={18} color={COLORS.charcoal} />
              </Pressable>
            </View>
            <Pressable onPress={handleChangePhoto}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <User size={18} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Briefcase size={18} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Business Details</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name</Text>
              <TextInput
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Enter your business name"
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell clients about yourself..."
                mode="outlined"
                style={[styles.input, styles.textArea]}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Mail size={18} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+972 XX XXX XXXX"
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Area</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your service area"
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
                left={<TextInput.Icon icon={() => <MapPin size={18} color={COLORS.textMuted} />} />}
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
            buttonColor={COLORS.gold}
            textColor={COLORS.charcoal}
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
    backgroundColor: COLORS.charcoal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.charcoal,
  },
  changePhotoText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.gold,
  },
  formCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.charcoal,
  },
  textArea: {
    minHeight: 100,
  },
  saveButton: {
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
  },
  saveButtonContent: {
    height: 52,
  },
});
