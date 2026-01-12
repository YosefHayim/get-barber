import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  TextInput as RNTextInput,
} from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Phone,
  ChevronRight,
  Clock,
  CreditCard,
  Scissors,
  User,
  Shield,
  Receipt,
  Gift,
  Headphones,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '@/constants/theme';

// Light theme colors matching the design system
const LIGHT_COLORS = {
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  primary: '#11a4d4',
  textPrimary: '#111618',
  textSecondary: '#637588',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  // Category colors
  purple: '#9333ea',
  purpleBg: '#f3e8ff',
  orange: '#ea580c',
  orangeBg: '#fff7ed',
  blue: '#2563eb',
  blueBg: '#eff6ff',
  teal: '#0d9488',
  tealBg: '#f0fdfa',
  green: '#16a34a',
  greenBg: '#f0fdf4',
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

interface TopicCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How to reschedule my booking?',
    answer:
      'Go to your bookings, select the appointment you want to change, and tap "Reschedule". Choose a new date and time that works for you.',
    icon: <Clock size={20} color={LIGHT_COLORS.primary} style={{ opacity: 0.8 }} />,
  },
  {
    id: '2',
    question: 'Payment methods accepted',
    answer:
      'We accept cash, credit/debit cards, and digital wallets. You can pay directly to the barber after your service.',
    icon: <CreditCard size={20} color={LIGHT_COLORS.primary} style={{ opacity: 0.8 }} />,
  },
  {
    id: '3',
    question: 'Barber cancellation policy',
    answer:
      'Barbers can cancel up to 2 hours before the scheduled time. If cancelled, you\'ll receive a full refund and priority rebooking.',
    icon: <Scissors size={20} color={LIGHT_COLORS.primary} style={{ opacity: 0.8 }} />,
  },
];

const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'account',
    title: 'Account',
    icon: <User size={20} color={LIGHT_COLORS.purple} />,
    color: LIGHT_COLORS.purple,
    bgColor: LIGHT_COLORS.purpleBg,
  },
  {
    id: 'safety',
    title: 'Safety',
    icon: <Shield size={20} color={LIGHT_COLORS.orange} />,
    color: LIGHT_COLORS.orange,
    bgColor: LIGHT_COLORS.orangeBg,
  },
  {
    id: 'orders',
    title: 'Orders',
    icon: <Receipt size={20} color={LIGHT_COLORS.blue} />,
    color: LIGHT_COLORS.blue,
    bgColor: LIGHT_COLORS.blueBg,
  },
  {
    id: 'promos',
    title: 'Promos',
    icon: <Gift size={20} color={LIGHT_COLORS.teal} />,
    color: LIGHT_COLORS.teal,
    bgColor: LIGHT_COLORS.tealBg,
  },
];

function PopularArticleItem({
  item,
  isLast,
}: {
  item: FAQItem;
  isLast: boolean;
}) {
  const handlePress = () => {
    // Navigate to article or show detail
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.articleItem,
        pressed && styles.articleItemPressed,
      ]}
    >
      <View style={styles.articleContent}>
        {item.icon}
        <Text style={styles.articleTitle}>{item.question}</Text>
      </View>
      <ChevronRight size={20} color={LIGHT_COLORS.textMuted} />
    </Pressable>
  );
}

function TopicCard({ topic }: { topic: TopicCategory }) {
  const handlePress = () => {
    // Navigate to topic
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.topicCard,
        pressed && styles.topicCardPressed,
      ]}
    >
      <View style={[styles.topicIcon, { backgroundColor: topic.bgColor }]}>
        {topic.icon}
      </View>
      <Text style={styles.topicTitle}>{topic.title}</Text>
    </Pressable>
  );
}

export default function HelpSupportScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLiveChat = () => {
    Linking.openURL('https://wa.me/972501234567?text=Hi,%20I%20need%20help%20with%20GetBarber');
  };

  const handleCallUs = () => {
    Linking.openURL('tel:+972501234567');
  };

  const handleOpenLink = (type: 'terms' | 'privacy') => {
    const url =
      type === 'terms'
        ? 'https://getbarber.app/terms'
        : 'https://getbarber.app/privacy';
    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Help & Support',
          headerStyle: { backgroundColor: LIGHT_COLORS.surface },
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
            color: LIGHT_COLORS.textPrimary,
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color={LIGHT_COLORS.textPrimary} />
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
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={24} color={LIGHT_COLORS.primary} />
            <RNTextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="How can we help?"
              placeholderTextColor={LIGHT_COLORS.textSecondary}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Contact Support Section */}
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.contactGrid}>
          {/* Live Chat Card */}
          <Pressable
            style={({ pressed }) => [
              styles.contactCard,
              pressed && styles.contactCardPressed,
            ]}
            onPress={handleLiveChat}
          >
            <View style={[styles.contactIconWrapper, { backgroundColor: LIGHT_COLORS.blueBg }]}>
              <MessageCircle size={26} color={LIGHT_COLORS.primary} />
            </View>
            <View style={styles.contactTextWrapper}>
              <Text style={styles.contactTitle}>Live Chat</Text>
              <Text style={styles.contactSubtitle}>Wait time: ~2 min</Text>
            </View>
          </Pressable>

          {/* Call Us Card */}
          <Pressable
            style={({ pressed }) => [
              styles.contactCard,
              pressed && styles.contactCardPressed,
            ]}
            onPress={handleCallUs}
          >
            <View style={[styles.contactIconWrapper, { backgroundColor: LIGHT_COLORS.greenBg }]}>
              <Phone size={26} color={LIGHT_COLORS.green} />
            </View>
            <View style={styles.contactTextWrapper}>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactSubtitle}>Available 9-5</Text>
            </View>
          </Pressable>
        </View>

        {/* Popular Articles Section */}
        <Text style={styles.sectionTitle}>Popular Articles</Text>
        <Surface style={styles.articlesCard} elevation={0}>
          {FAQ_ITEMS.map((item, index) => (
            <View key={item.id}>
              <PopularArticleItem item={item} isLast={index === FAQ_ITEMS.length - 1} />
              {index !== FAQ_ITEMS.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </Surface>

        {/* Browse by Topic Section */}
        <Text style={styles.sectionTitle}>Browse by Topic</Text>
        <View style={styles.topicsGrid}>
          {TOPIC_CATEGORIES.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>App Version 2.4.0 (Build 1042)</Text>
          <View style={styles.legalLinks}>
            <Pressable onPress={() => handleOpenLink('terms')}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </Pressable>
            <Pressable onPress={() => handleOpenLink('privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Floating Support Button */}
      <Pressable
        style={({ pressed }) => [
          styles.floatingButton,
          pressed && styles.floatingButtonPressed,
        ]}
        onPress={handleLiveChat}
      >
        <Headphones size={28} color="#FFFFFF" />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
  },

  // Search Bar
  searchContainer: {
    marginBottom: -8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: LIGHT_COLORS.textPrimary,
  },

  // Section Titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
    marginBottom: -8,
    paddingHorizontal: 4,
  },

  // Contact Support Grid
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  contactCardPressed: {
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    borderColor: `${LIGHT_COLORS.primary}50`,
  },
  contactIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTextWrapper: {
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
  },
  contactSubtitle: {
    fontSize: 12,
    color: LIGHT_COLORS.textSecondary,
    marginTop: 2,
  },

  // Popular Articles
  articlesCard: {
    borderRadius: 12,
    backgroundColor: LIGHT_COLORS.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  articleItemPressed: {
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: LIGHT_COLORS.textPrimary,
    flex: 1,
  },
  divider: {
    backgroundColor: LIGHT_COLORS.border,
  },

  // Browse by Topic
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '48%',
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  topicCardPressed: {
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    gap: 8,
  },
  versionText: {
    fontSize: 12,
    color: LIGHT_COLORS.textSecondary,
  },
  legalLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  legalLink: {
    fontSize: 12,
    color: LIGHT_COLORS.primary,
    fontWeight: '500',
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LIGHT_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    shadowColor: LIGHT_COLORS.primary,
    shadowOpacity: 0.4,
  },
  floatingButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
});
