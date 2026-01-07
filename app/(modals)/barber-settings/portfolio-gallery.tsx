import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Plus,
  X,
  Camera,
  Image as ImageIcon,
  Instagram,
  Facebook,
  Globe,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';

const MAX_PORTFOLIO_IMAGES = 12;

interface SocialLinks {
  instagram: string;
  facebook: string;
  website: string;
}

export default function PortfolioGalleryScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: '',
    facebook: '',
    website: '',
  });

  const canAddMore = portfolioImages.length < MAX_PORTFOLIO_IMAGES;

  const handlePickImage = async () => {
    if (!canAddMore) {
      Alert.alert('Maximum Reached', `You can upload up to ${MAX_PORTFOLIO_IMAGES} photos.`);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPortfolioImages([...portfolioImages, result.assets[0].uri]);
    }
  };

  const handleTakePhoto = async () => {
    if (!canAddMore) {
      Alert.alert('Maximum Reached', `You can upload up to ${MAX_PORTFOLIO_IMAGES} photos.`);
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPortfolioImages([...portfolioImages, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (uri: string) => {
    setPortfolioImages(portfolioImages.filter((img) => img !== uri));
  };

  const handleOpenInstagram = async () => {
    const instagramUrl = Platform.select({
      ios: 'instagram://user?username=',
      android: 'intent://www.instagram.com/#Intent;package=com.instagram.android;scheme=https;end',
      default: 'https://www.instagram.com/',
    });

    try {
      const canOpen = await Linking.canOpenURL('instagram://');
      if (canOpen) {
        await Linking.openURL('instagram://');
      } else {
        await Linking.openURL('https://www.instagram.com/');
      }
    } catch {
      Alert.alert('Error', 'Could not open Instagram. Please make sure the app is installed.');
    }
  };

  const handleConnectInstagram = () => {
    Alert.alert(
      'Connect Instagram',
      'Enter your Instagram username to link your profile. Customers will be able to see more of your work.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Instagram',
          onPress: handleOpenInstagram,
        },
      ]
    );
  };

  const handleOpenLink = async (url: string, type: string) => {
    if (!url) return;

    let fullUrl = url;
    if (type === 'instagram') {
      const username = url.replace('@', '');
      fullUrl = `https://www.instagram.com/${username}`;
    } else if (type === 'facebook') {
      fullUrl = url.startsWith('http') ? url : `https://www.facebook.com/${url}`;
    } else if (!url.startsWith('http')) {
      fullUrl = `https://${url}`;
    }

    try {
      await Linking.openURL(fullUrl);
    } catch {
      Alert.alert('Error', 'Could not open link.');
    }
  };

  const handleSave = () => {
    Alert.alert('Saved', 'Your portfolio and social links have been updated.');
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Portfolio & Social',
          headerStyle: { backgroundColor: COLORS.charcoal },
          headerTitleStyle: { fontWeight: '700', color: COLORS.textInverse },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={COLORS.gold} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.tipsCard}>
          <Sparkles size={20} color={COLORS.gold} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Showcase Your Best Work</Text>
            <Text style={styles.tipsText}>
              Upload photos of your haircuts and styles to help customers understand your expertise.
              Connect your social media to build trust and grow your following.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Work Gallery</Text>
            <Text style={styles.counterText}>
              {portfolioImages.length}/{MAX_PORTFOLIO_IMAGES}
            </Text>
          </View>

          <View style={styles.portfolioGrid}>
            {portfolioImages.map((uri, index) => (
              <Animated.View
                key={uri}
                entering={ZoomIn.delay(index * 50).duration(300)}
                style={styles.imageContainer}
              >
                <Image source={{ uri }} style={styles.portfolioImage} />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(uri)}
                >
                  <X size={14} color={COLORS.textInverse} />
                </Pressable>
              </Animated.View>
            ))}

            {canAddMore && (
              <View style={styles.addContainer}>
                <Pressable style={styles.addButton} onPress={handlePickImage}>
                  <ImageIcon size={24} color={COLORS.gold} />
                  <Text style={styles.addButtonText}>Gallery</Text>
                </Pressable>
                <Pressable style={styles.addButton} onPress={handleTakePhoto}>
                  <Camera size={24} color={COLORS.gold} />
                  <Text style={styles.addButtonText}>Camera</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media Links</Text>
          <Text style={styles.sectionSubtitle}>
            Connect your profiles to let customers follow your work
          </Text>

          <View style={styles.socialCard}>
            <View style={styles.socialItem}>
              <View style={[styles.socialIcon, { backgroundColor: '#E1306C20' }]}>
                <Instagram size={20} color="#E1306C" />
              </View>
              <View style={styles.socialInputContainer}>
                <TextInput
                  mode="outlined"
                  placeholder="@your_username"
                  value={socialLinks.instagram}
                  onChangeText={(text) =>
                    setSocialLinks({ ...socialLinks, instagram: text })
                  }
                  outlineColor={COLORS.mediumGray}
                  activeOutlineColor={COLORS.gold}
                  style={styles.socialInput}
                  textColor={COLORS.textInverse}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              {socialLinks.instagram ? (
                <Pressable
                  style={styles.openLinkButton}
                  onPress={() => handleOpenLink(socialLinks.instagram, 'instagram')}
                >
                  <ExternalLink size={18} color={COLORS.gold} />
                </Pressable>
              ) : (
                <Pressable style={styles.connectButton} onPress={handleConnectInstagram}>
                  <LinkIcon size={16} color={COLORS.gold} />
                </Pressable>
              )}
            </View>

            <View style={styles.socialDivider} />

            <View style={styles.socialItem}>
              <View style={[styles.socialIcon, { backgroundColor: '#1877F220' }]}>
                <Facebook size={20} color="#1877F2" />
              </View>
              <View style={styles.socialInputContainer}>
                <TextInput
                  mode="outlined"
                  placeholder="Facebook page or profile"
                  value={socialLinks.facebook}
                  onChangeText={(text) =>
                    setSocialLinks({ ...socialLinks, facebook: text })
                  }
                  outlineColor={COLORS.mediumGray}
                  activeOutlineColor={COLORS.gold}
                  style={styles.socialInput}
                  textColor={COLORS.textInverse}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              {socialLinks.facebook && (
                <Pressable
                  style={styles.openLinkButton}
                  onPress={() => handleOpenLink(socialLinks.facebook, 'facebook')}
                >
                  <ExternalLink size={18} color={COLORS.gold} />
                </Pressable>
              )}
            </View>

            <View style={styles.socialDivider} />

            <View style={styles.socialItem}>
              <View style={[styles.socialIcon, { backgroundColor: COLORS.goldMuted }]}>
                <Globe size={20} color={COLORS.gold} />
              </View>
              <View style={styles.socialInputContainer}>
                <TextInput
                  mode="outlined"
                  placeholder="www.yourwebsite.com"
                  value={socialLinks.website}
                  onChangeText={(text) =>
                    setSocialLinks({ ...socialLinks, website: text })
                  }
                  outlineColor={COLORS.mediumGray}
                  activeOutlineColor={COLORS.gold}
                  style={styles.socialInput}
                  textColor={COLORS.textInverse}
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
              {socialLinks.website && (
                <Pressable
                  style={styles.openLinkButton}
                  onPress={() => handleOpenLink(socialLinks.website, 'website')}
                >
                  <ExternalLink size={18} color={COLORS.gold} />
                </Pressable>
              )}
            </View>
          </View>

          <Text style={styles.privacyNote}>
            Your social links will be visible on your public profile to help customers connect with you.
          </Text>
        </Animated.View>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          buttonColor={COLORS.gold}
          textColor={COLORS.charcoal}
          labelStyle={styles.saveButtonLabel}
        >
          Save Changes
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  tipsCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  tipsText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  counterText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  imageContainer: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  addContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.mediumGray,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    gap: SPACING.xs,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  socialCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialInputContainer: {
    flex: 1,
  },
  socialInput: {
    backgroundColor: COLORS.charcoal,
    height: 44,
  },
  socialDivider: {
    height: 1,
    backgroundColor: COLORS.mediumGray,
    marginHorizontal: SPACING.md,
  },
  openLinkButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyNote: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  saveButtonLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    paddingVertical: SPACING.xs,
  },
});
