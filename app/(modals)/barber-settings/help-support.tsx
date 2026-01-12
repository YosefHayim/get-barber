import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Shield,
  Users,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

interface HelpItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
}

export default function HelpSupportScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const handleOpenChat = () => {
    Alert.alert('Coming Soon', 'Live chat support will be available soon!');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@barberconnect.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+972-3-123-4567');
  };

  const handleOpenFAQ = () => {
    Alert.alert('Coming Soon', 'FAQ section will be available soon!');
  };

  const handleOpenTerms = () => {
    Alert.alert('Coming Soon', 'Terms of service will be available soon!');
  };

  const handleOpenPrivacy = () => {
    Alert.alert('Coming Soon', 'Privacy policy will be available soon!');
  };

  const handleOpenCommunity = () => {
    Alert.alert('Coming Soon', 'Community forum will be available soon!');
  };

  const contactOptions: HelpItem[] = [
    {
      id: 'chat',
      icon: <MessageCircle size={20} color={COLORS.gold} />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: handleOpenChat,
    },
    {
      id: 'email',
      icon: <Mail size={20} color={COLORS.gold} />,
      title: 'Email Support',
      description: 'support@barberconnect.com',
      action: handleEmail,
    },
    {
      id: 'phone',
      icon: <Phone size={20} color={COLORS.gold} />,
      title: 'Phone Support',
      description: 'Call us during business hours',
      action: handlePhone,
    },
  ];

  const resourceOptions: HelpItem[] = [
    {
      id: 'faq',
      icon: <HelpCircle size={20} color={COLORS.gold} />,
      title: 'FAQ',
      description: 'Frequently asked questions',
      action: handleOpenFAQ,
    },
    {
      id: 'guide',
      icon: <BookOpen size={20} color={COLORS.gold} />,
      title: 'Barber Guide',
      description: 'Tips to grow your business',
      action: handleOpenFAQ,
    },
    {
      id: 'community',
      icon: <Users size={20} color={COLORS.gold} />,
      title: 'Community',
      description: 'Connect with other barbers',
      action: handleOpenCommunity,
    },
  ];

  const legalOptions: HelpItem[] = [
    {
      id: 'terms',
      icon: <FileText size={20} color={COLORS.gold} />,
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      action: handleOpenTerms,
    },
    {
      id: 'privacy',
      icon: <Shield size={20} color={COLORS.gold} />,
      title: 'Privacy Policy',
      description: 'How we handle your data',
      action: handleOpenPrivacy,
    },
  ];

  const renderHelpItem = (item: HelpItem, isLast: boolean) => (
    <Pressable
      key={item.id}
      style={[styles.helpItem, !isLast && styles.helpItemBorder]}
      onPress={item.action}
    >
      <View style={styles.helpIconContainer}>{item.icon}</View>
      <View style={styles.helpContent}>
        <Text style={styles.helpTitle}>{item.title}</Text>
        <Text style={styles.helpDescription}>{item.description}</Text>
      </View>
      <ChevronRight size={18} color={LIGHT_COLORS.textMuted} />
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Help & Support',
          headerStyle: { backgroundColor: LIGHT_COLORS.surface },
          headerTitleStyle: { fontWeight: '700', color: LIGHT_COLORS.textPrimary },
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
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <HelpCircle size={40} color={COLORS.gold} />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroText}>
            We're here to support you. Choose an option below or contact us directly.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Contact Us</Text>

        <View style={styles.card}>
          {contactOptions.map((item, index) =>
            renderHelpItem(item, index === contactOptions.length - 1)
          )}
        </View>

        <Text style={styles.sectionTitle}>Resources</Text>

        <View style={styles.card}>
          {resourceOptions.map((item, index) =>
            renderHelpItem(item, index === resourceOptions.length - 1)
          )}
        </View>

        <Text style={styles.sectionTitle}>Legal</Text>

        <View style={styles.card}>
          {legalOptions.map((item, index) =>
            renderHelpItem(item, index === legalOptions.length - 1)
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Business Hours</Text>
          <Text style={styles.infoText}>
            Sunday - Thursday: 9:00 AM - 6:00 PM{'\n'}
            Friday: 9:00 AM - 2:00 PM{'\n'}
            Saturday: Closed
          </Text>
        </View>

        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>Need urgent help?</Text>
          <Text style={styles.emergencyText}>
            For urgent booking issues or emergencies, call our priority line.
          </Text>
          <Button
            mode="contained"
            onPress={handlePhone}
            style={styles.emergencyButton}
            contentStyle={styles.emergencyButtonContent}
            buttonColor={COLORS.gold}
            textColor={COLORS.charcoal}
            icon={() => <Phone size={18} color={COLORS.charcoal} />}
          >
            Call Priority Support
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  heroCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  heroText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textMuted,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  helpItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  helpIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  helpContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  helpTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  helpDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
  },
  infoBox: {
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    lineHeight: 22,
  },
  emergencyCard: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  emergencyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  emergencyText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  emergencyButton: {
    borderRadius: RADIUS.md,
  },
  emergencyButtonContent: {
    height: 48,
  },
});
