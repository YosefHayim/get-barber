import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { Text, Surface, TextInput, Button, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  ChevronRight,
  HelpCircle,
  FileText,
  Shield,
  ExternalLink,
  Send,
} from 'lucide-react-native';

const GOLD = '#DAA520';
const DARK_GOLD = '#B8860B';
const BURGUNDY = '#722F37';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How do I book a barber?',
    answer:
      'Select your services from the home screen, then tap "Find Available Barbers" to send a request. Nearby barbers will receive your request and can accept it.',
  },
  {
    id: '2',
    question: 'How do payments work?',
    answer:
      'You can pay directly to the barber after your service with cash or card. In-app payment will be available soon.',
  },
  {
    id: '3',
    question: 'Can I cancel a booking?',
    answer:
      'Yes, you can cancel a booking up to 1 hour before the scheduled time without any charges. Late cancellations may incur a fee.',
  },
  {
    id: '4',
    question: 'How are barbers verified?',
    answer:
      'All barbers go through our verification process including ID check, license verification, and background checks to ensure your safety.',
  },
  {
    id: '5',
    question: 'What if I have an issue with my service?',
    answer:
      'Contact our support team within 24 hours of your service. We take all complaints seriously and will work to resolve any issues.',
  },
];

function FAQSection({ item, isExpanded, onToggle }: { item: FAQItem; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.faqItem}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <ChevronRight
          size={20}
          color="#6B7280"
          style={{
            transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
          }}
        />
      </View>
      {isExpanded && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </Pressable>
  );
}

export default function HelpSupportScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleContact = (method: 'email' | 'phone' | 'whatsapp') => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@getbarber.app?subject=Support%20Request');
        break;
      case 'phone':
        Linking.openURL('tel:+972501234567');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/972501234567?text=Hi,%20I%20need%20help%20with%20GetBarber');
        break;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSending(false);
    setMessage('');
    Alert.alert(
      'Message Sent',
      "Thanks for contacting us! We'll get back to you within 24 hours.",
      [{ text: 'OK' }]
    );
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
          headerTitleStyle: { fontWeight: '700', color: BURGUNDY },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={BURGUNDY} />
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
        <Surface style={styles.contactCard} elevation={1}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.contactSubtitle}>
            We're here to help! Reach out through any of these channels:
          </Text>

          <View style={styles.contactMethods}>
            <Pressable
              style={styles.contactMethod}
              onPress={() => handleContact('whatsapp')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#25D366' }]}>
                <MessageCircle size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.contactLabel}>WhatsApp</Text>
            </Pressable>

            <Pressable
              style={styles.contactMethod}
              onPress={() => handleContact('email')}
            >
              <View style={[styles.contactIcon, { backgroundColor: DARK_GOLD }]}>
                <Mail size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.contactLabel}>Email</Text>
            </Pressable>

            <Pressable
              style={styles.contactMethod}
              onPress={() => handleContact('phone')}
            >
              <View style={[styles.contactIcon, { backgroundColor: BURGUNDY }]}>
                <Phone size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.contactLabel}>Call</Text>
            </Pressable>
          </View>
        </Surface>

        <Surface style={styles.messageCard} elevation={1}>
          <Text style={styles.sectionTitle}>Send Us a Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue or question..."
            mode="outlined"
            style={styles.messageInput}
            outlineStyle={styles.inputOutline}
            outlineColor="#E5E7EB"
            activeOutlineColor={DARK_GOLD}
            multiline
            numberOfLines={4}
          />
          <Button
            mode="contained"
            onPress={handleSendMessage}
            loading={isSending}
            disabled={isSending || !message.trim()}
            icon={() => <Send size={18} color="#FFFFFF" />}
            style={styles.sendButton}
            contentStyle={styles.sendButtonContent}
            buttonColor={DARK_GOLD}
          >
            Send Message
          </Button>
        </Surface>

        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

        <Surface style={styles.faqCard} elevation={1}>
          {FAQ_ITEMS.map((item, index) => (
            <View key={item.id}>
              <FAQSection
                item={item}
                isExpanded={expandedFAQ === item.id}
                onToggle={() =>
                  setExpandedFAQ(expandedFAQ === item.id ? null : item.id)
                }
              />
              {index !== FAQ_ITEMS.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </Surface>

        <Text style={styles.legalTitle}>Legal</Text>

        <Surface style={styles.legalCard} elevation={1}>
          <Pressable
            style={styles.legalItem}
            onPress={() => handleOpenLink('terms')}
          >
            <View style={styles.legalIcon}>
              <FileText size={20} color={DARK_GOLD} />
            </View>
            <Text style={styles.legalLabel}>Terms of Service</Text>
            <ExternalLink size={18} color="#9CA3AF" />
          </Pressable>

          <Divider style={styles.divider} />

          <Pressable
            style={styles.legalItem}
            onPress={() => handleOpenLink('privacy')}
          >
            <View style={styles.legalIcon}>
              <Shield size={20} color={DARK_GOLD} />
            </View>
            <Text style={styles.legalLabel}>Privacy Policy</Text>
            <ExternalLink size={18} color="#9CA3AF" />
          </Pressable>
        </Surface>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>GetBarber v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 GetBarber. All rights reserved.</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  headerButton: {
    padding: 8,
  },
  contactCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BURGUNDY,
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactMethod: {
    alignItems: 'center',
    gap: 10,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  messageCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 24,
  },
  messageInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  inputOutline: {
    borderRadius: 12,
  },
  sendButton: {
    borderRadius: 12,
  },
  sendButtonContent: {
    height: 48,
  },
  faqTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 24,
  },
  faqItem: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    paddingRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  divider: {
    backgroundColor: '#F3F4F6',
  },
  legalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legalCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 24,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  legalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  legalLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});
