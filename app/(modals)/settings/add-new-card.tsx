import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Wifi,
  Lock,
  Camera,
  HelpCircle,
} from 'lucide-react-native';

const LIGHT_COLORS = {
  background: '#f6f8f8',
  surface: '#ffffff',
  primary: '#11a4d4',
  textPrimary: '#111618',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  success: '#22c55e',
};

type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

const getCardType = (number: string): CardType => {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  return 'unknown';
};

const getCardBrandDisplay = (type: CardType): string => {
  switch (type) {
    case 'visa': return 'VISA';
    case 'mastercard': return 'MASTERCARD';
    case 'amex': return 'AMEX';
    case 'discover': return 'DISCOVER';
    default: return 'CARD';
  }
};

const getCardGradient = (type: CardType): [string, string] => {
  switch (type) {
    case 'visa': return ['#135bec', '#8b5cf6'];
    case 'mastercard': return ['#eb001b', '#ff5f00'];
    case 'amex': return ['#006fcf', '#00aeef'];
    case 'discover': return ['#ff6000', '#f76b1c'];
    default: return ['#135bec', '#8b5cf6'];
  }
};

export default function AddNewCardScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const cardType = useMemo(() => getCardType(cardNumber), [cardNumber]);

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

  const getDisplayCardNumber = () => {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length === 0) return '4242 4242 4242 4242';
    return formatCardNumber(cleaned.padEnd(16, '•'));
  };

  const getDisplayExpiry = () => {
    if (!expiryDate) return '12/25';
    return expiryDate;
  };

  const getDisplayName = () => {
    if (!cardholderName.trim()) return 'JOHN DOE';
    return cardholderName.toUpperCase();
  };

  const handleSaveCard = async () => {
    const cleanedNumber = cardNumber.replace(/\D/g, '');
    if (cleanedNumber.length < 16) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number');
      return;
    }
    if (!cardholderName.trim()) {
      Alert.alert('Missing Name', 'Please enter the cardholder name');
      return;
    }
    if (expiryDate.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV');
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);

    Alert.alert('Success', 'Card added successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Add New Card',
          headerStyle: { backgroundColor: LIGHT_COLORS.background },
          headerTitleStyle: { fontWeight: '700', color: LIGHT_COLORS.textPrimary },
          headerTitleAlign: 'center',
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardPreviewContainer}>
            <View style={styles.cardShadow}>
              <LinearGradient
                colors={getCardGradient(cardType)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardPreview}
              >
                <View style={styles.cardNoiseOverlay} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Wifi size={32} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.cardBrand}>
                      {getCardBrandDisplay(cardType)}
                    </Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardNumberDisplay}>
                      {getDisplayCardNumber()}
                    </Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <View style={styles.cardFooterLeft}>
                      <Text style={styles.cardLabel}>Card Holder</Text>
                      <Text style={styles.cardValue} numberOfLines={1}>
                        {getDisplayName()}
                      </Text>
                    </View>
                    <View style={styles.cardFooterRight}>
                      <Text style={styles.cardLabel}>Expires</Text>
                      <Text style={styles.cardValue}>{getDisplayExpiry()}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Card Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.cardInputContainer}>
                <RNTextInput
                  style={styles.cardInput}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={LIGHT_COLORS.textMuted}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <Pressable style={styles.cameraButton}>
                  <Camera size={22} color={LIGHT_COLORS.primary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <RNTextInput
                style={styles.input}
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholder="John Doe"
                placeholderTextColor={LIGHT_COLORS.textMuted}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <RNTextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  placeholder="MM/YY"
                  placeholderTextColor={LIGHT_COLORS.textMuted}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <View style={styles.cvvLabelRow}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <HelpCircle size={14} color={LIGHT_COLORS.textMuted} />
                  </Pressable>
                </View>
                <RNTextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor={LIGHT_COLORS.textMuted}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <Pressable
              style={styles.checkboxRow}
              onPress={() => setSetAsDefault(!setAsDefault)}
            >
              <View style={[
                styles.checkbox,
                setAsDefault && styles.checkboxChecked
              ]}>
                {setAsDefault && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Set as default payment method
              </Text>
            </Pressable>
          </View>

          <View style={styles.securityBadge}>
            <Lock size={14} color={LIGHT_COLORS.success} />
            <Text style={styles.securityText}>
              128-bit SSL Secured. Your data is safe.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveCard}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Card</Text>
            )}
          </Pressable>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPreviewContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    borderRadius: 16,
  },
  cardPreview: {
    aspectRatio: 1.586,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardNoiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    backgroundColor: 'transparent',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumberDisplay: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardFooterLeft: {
    flex: 1,
  },
  cardFooterRight: {
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 1,
    maxWidth: 160,
    textTransform: 'uppercase',
  },
  formSection: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: LIGHT_COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: LIGHT_COLORS.surface,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: LIGHT_COLORS.textPrimary,
  },
  cardInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInput: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.surface,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 0,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: LIGHT_COLORS.textPrimary,
  },
  cameraButton: {
    backgroundColor: LIGHT_COLORS.surface,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    height: 48,
    width: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  cvvLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    backgroundColor: LIGHT_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: LIGHT_COLORS.primary,
    borderColor: LIGHT_COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: LIGHT_COLORS.textMuted,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    opacity: 0.6,
  },
  securityText: {
    fontSize: 12,
    color: LIGHT_COLORS.textMuted,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: LIGHT_COLORS.background,
    borderTopWidth: 1,
    borderTopColor: LIGHT_COLORS.border,
  },
  saveButton: {
    backgroundColor: LIGHT_COLORS.primary,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: LIGHT_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
