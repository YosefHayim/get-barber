import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Smartphone,
  Check,
  Lock,
  CircleDot,
} from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

const LIGHT_COLORS = {
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#111618',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  primary: '#11a4d4',
};

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'apple_pay';
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  isDigitalWallet?: boolean;
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'apple_pay',
    type: 'apple_pay',
    isDefault: false,
    isDigitalWallet: true,
  },
  {
    id: '1',
    type: 'visa',
    lastFour: '4242',
    expiryDate: '12/25',
    isDefault: true,
  },
  {
    id: '2',
    type: 'mastercard',
    lastFour: '8899',
    expiryDate: '09/24',
    isDefault: false,
  },
];

function CardLogo({ type }: { type: PaymentMethod['type'] }) {
  if (type === 'apple_pay') {
    return (
      <View style={styles.applePayLogo}>
        <Smartphone size={20} color="#FFFFFF" />
      </View>
    );
  }

  if (type === 'visa') {
    return (
      <View style={styles.cardLogo}>
        <Text style={styles.visaText}>Visa</Text>
      </View>
    );
  }

  if (type === 'mastercard') {
    return (
      <View style={styles.cardLogo}>
        <View style={styles.mastercardCircles}>
          <View style={[styles.mastercardCircle, styles.mastercardRed]} />
          <View style={[styles.mastercardCircle, styles.mastercardYellow]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardLogo}>
      <CreditCard size={20} color={COLORS.copper} />
    </View>
  );
}

function CardName({ type }: { type: PaymentMethod['type'] }) {
  const names = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    apple_pay: 'Apple Pay',
  };
  return names[type];
}

export default function PaymentMethodsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [methods, setMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);

  const handleSetDefault = (id: string) => {
    // Only allow setting cards as default (not digital wallets)
    const method = methods.find(m => m.id === id);
    if (method?.isDigitalWallet) return;

    setMethods(
      methods.map((m) => ({
        ...m,
        isDefault: m.isDigitalWallet ? false : m.id === id,
      }))
    );
  };

  const digitalWallets = methods.filter(m => m.isDigitalWallet);
  const cards = methods.filter(m => !m.isDigitalWallet);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Payment Methods',
          headerStyle: { backgroundColor: LIGHT_COLORS.background },
          headerTitleStyle: { fontWeight: '700', color: LIGHT_COLORS.textPrimary },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={LIGHT_COLORS.textPrimary} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Digital Wallets Section */}
        {digitalWallets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DIGITAL WALLETS</Text>
            <Surface style={styles.sectionCard} elevation={0}>
              {digitalWallets.map((wallet) => (
                <Pressable
                  key={wallet.id}
                  style={styles.walletItem}
                >
                  <View style={styles.walletContent}>
                    <CardLogo type={wallet.type} />
                    <View style={styles.walletInfo}>
                      <Text style={styles.walletName}>
                        <CardName type={wallet.type} />
                      </Text>
                      <Text style={styles.walletStatus}>Linked</Text>
                    </View>
                  </View>
                  <Pressable>
                    <Text style={styles.editButton}>Edit</Text>
                  </Pressable>
                </Pressable>
              ))}
            </Surface>
          </View>
        )}

        {/* Credit & Debit Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CREDIT & DEBIT CARDS</Text>
          <Surface style={styles.sectionCard} elevation={0}>
            {cards.length === 0 ? (
              <View style={styles.emptyState}>
                <CreditCard size={48} color={LIGHT_COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No cards added</Text>
                <Text style={styles.emptyText}>
                  Add a card to make payments seamless
                </Text>
              </View>
            ) : (
              cards.map((card, index) => (
                <Pressable
                  key={card.id}
                  style={[
                    styles.cardItem,
                    index !== cards.length - 1 && styles.cardItemBorder,
                  ]}
                  onPress={() => handleSetDefault(card.id)}
                >
                  <View style={styles.cardContent}>
                    <CardLogo type={card.type} />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>
                        <CardName type={card.type} /> ending in {card.lastFour}
                      </Text>
                      <Text style={styles.cardExpiry}>
                        Expires {card.expiryDate}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.selectionIndicator}>
                    {card.isDefault ? (
                      <View style={styles.selectedRadio}>
                        <Check size={16} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.unselectedRadio} />
                    )}
                  </View>
                </Pressable>
              ))
            )}
          </Surface>
        </View>

        {/* Add New Card Section */}
        <View style={styles.section}>
          <Surface style={styles.sectionCard} elevation={0}>
            <Pressable
              style={styles.addCardButton}
              onPress={() => router.push('/(modals)/settings/add-new-card')}
            >
              <View style={styles.addCardIcon}>
                <Plus size={20} color={LIGHT_COLORS.primary} />
              </View>
              <Text style={styles.addCardText}>Add New Card</Text>
            </Pressable>
          </Surface>
        </View>

        {/* Security Footer */}
        <View style={styles.securityFooter}>
          <Lock size={14} color={LIGHT_COLORS.textMuted} />
          <Text style={styles.securityText}>
            Payments are processed securely
          </Text>
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
    padding: 16,
  },
  headerButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: LIGHT_COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 12,
    backgroundColor: LIGHT_COLORS.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  // Digital Wallet Styles
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  walletContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  walletInfo: {
    gap: 2,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '500',
    color: LIGHT_COLORS.textPrimary,
  },
  walletStatus: {
    fontSize: 14,
    color: LIGHT_COLORS.textMuted,
  },
  editButton: {
    fontSize: 14,
    fontWeight: '500',
    color: LIGHT_COLORS.primary,
  },
  applePayLogo: {
    width: 56,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogo: {
    width: 56,
    height: 40,
    borderRadius: 4,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visaText: {
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#1A1F71',
  },
  mastercardCircles: {
    flexDirection: 'row',
  },
  mastercardCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: -4,
  },
  mastercardRed: {
    backgroundColor: '#EB001B',
    opacity: 0.8,
  },
  mastercardYellow: {
    backgroundColor: '#F79E1B',
    opacity: 0.8,
  },
  // Card Item Styles
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '500',
    color: LIGHT_COLORS.textPrimary,
  },
  cardExpiry: {
    fontSize: 14,
    color: LIGHT_COLORS.textMuted,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  selectedRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LIGHT_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: LIGHT_COLORS.textMuted,
  },
  // Add Card Button
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  addCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(17, 164, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: LIGHT_COLORS.primary,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: LIGHT_COLORS.textMuted,
    textAlign: 'center',
  },
  // Security Footer
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    opacity: 0.6,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '500',
    color: LIGHT_COLORS.textMuted,
  },
});
