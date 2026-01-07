import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Text, Surface, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Trash2,
  Star,
  Check,
  Wallet,
} from 'lucide-react-native';

const GOLD = '#DAA520';
const DARK_GOLD = '#B8860B';
const BURGUNDY = '#722F37';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'cash';
  lastFour: string;
  expiryDate: string;
  isDefault: boolean;
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
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
    lastFour: '8888',
    expiryDate: '06/26',
    isDefault: false,
  },
];

function CardIcon({ type }: { type: PaymentMethod['type'] }) {
  const colors = {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    amex: '#006FCF',
    cash: DARK_GOLD,
  };

  if (type === 'cash') {
    return <Wallet size={24} color={colors.cash} />;
  }

  return <CreditCard size={24} color={colors[type]} />;
}

function CardName({ type }: { type: PaymentMethod['type'] }) {
  const names = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    cash: 'Cash',
  };
  return names[type];
}

export default function PaymentMethodsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [methods, setMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const detectCardType = (number: string): PaymentMethod['type'] => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    return 'visa';
  };

  const handleAddCard = () => {
    const cleanedNumber = cardNumber.replace(/\D/g, '');
    if (cleanedNumber.length < 16 || expiryDate.length < 5 || cvv.length < 3) {
      Alert.alert('Error', 'Please fill in all card details correctly');
      return;
    }

    const newId = Date.now().toString();
    setMethods([
      ...methods,
      {
        id: newId,
        type: detectCardType(cardNumber),
        lastFour: cleanedNumber.slice(-4),
        expiryDate: expiryDate,
        isDefault: methods.length === 0,
      },
    ]);
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setShowAddModal(false);
  };

  const handleDeleteMethod = (id: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMethods(methods.filter((m) => m.id !== id));
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setMethods(
      methods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Payment Methods',
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
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {methods.length === 0 ? (
          <View style={styles.emptyState}>
            <CreditCard size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No payment methods</Text>
            <Text style={styles.emptyText}>
              Add a card to make booking and payments seamless
            </Text>
          </View>
        ) : (
          methods.map((method) => (
            <Surface key={method.id} style={styles.cardItem} elevation={1}>
              <Pressable
                style={styles.cardContent}
                onPress={() => handleSetDefault(method.id)}
              >
                <View style={styles.cardIconContainer}>
                  <CardIcon type={method.type} />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardLabelRow}>
                    <Text style={styles.cardType}>
                      <CardName type={method.type} />
                    </Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Check size={10} color="#FFFFFF" />
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardNumber}>
                    **** **** **** {method.lastFour}
                  </Text>
                  <Text style={styles.cardExpiry}>Expires {method.expiryDate}</Text>
                </View>
                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Star size={18} color="#6B7280" />
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleDeleteMethod(method.id)}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </Pressable>
            </Surface>
          ))
        )}

        <Surface style={styles.infoCard} elevation={1}>
          <View style={styles.infoIcon}>
            <Wallet size={24} color={DARK_GOLD} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Cash Payment</Text>
            <Text style={styles.infoText}>
              You can always pay with cash directly to your barber after the service
            </Text>
          </View>
        </Surface>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          mode="contained"
          onPress={() => setShowAddModal(true)}
          icon={() => <Plus size={20} color="#FFFFFF" />}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
          buttonColor={DARK_GOLD}
        >
          Add New Card
        </Button>
      </View>

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Add New Card</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              placeholder="1234 5678 9012 3456"
              mode="outlined"
              style={styles.modalInput}
              outlineStyle={styles.inputOutline}
              outlineColor="#E5E7EB"
              activeOutlineColor={DARK_GOLD}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.cardDetailsRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                placeholder="MM/YY"
                mode="outlined"
                style={styles.modalInput}
                outlineStyle={styles.inputOutline}
                outlineColor="#E5E7EB"
                activeOutlineColor={DARK_GOLD}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                mode="outlined"
                style={styles.modalInput}
                outlineStyle={styles.inputOutline}
                outlineColor="#E5E7EB"
                activeOutlineColor={DARK_GOLD}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="Name on card"
              mode="outlined"
              style={styles.modalInput}
              outlineStyle={styles.inputOutline}
              outlineColor="#E5E7EB"
              activeOutlineColor={DARK_GOLD}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddModal(false)}
              style={styles.modalButton}
              textColor="#6B7280"
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddCard}
              style={styles.modalButton}
              buttonColor={DARK_GOLD}
            >
              Add Card
            </Button>
          </View>

          <Text style={styles.securityNote}>
            Your card details are encrypted and securely stored
          </Text>
        </Modal>
      </Portal>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 240,
  },
  cardItem: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: DARK_GOLD,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardNumber: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addButton: {
    borderRadius: 14,
  },
  addButtonContent: {
    height: 52,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BURGUNDY,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
  },
  inputOutline: {
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  securityNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});
