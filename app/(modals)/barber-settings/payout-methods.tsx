import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Text, Surface, Button, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Plus,
  Trash2,
  Check,
  Shield,
  AlertCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface PayoutMethod {
  id: string;
  type: 'bank' | 'paypal';
  name: string;
  lastFour: string;
  isDefault: boolean;
}

export default function PayoutMethodsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [methods, setMethods] = useState<PayoutMethod[]>([
    {
      id: '1',
      type: 'bank',
      name: 'Bank Leumi',
      lastFour: '4567',
      isDefault: true,
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMethod, setNewMethod] = useState({
    bankName: '',
    accountNumber: '',
    branchNumber: '',
  });

  const handleSetDefault = (id: string) => {
    setMethods(
      methods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    const method = methods.find((m) => m.id === id);
    if (method?.isDefault) {
      Alert.alert('Cannot Delete', 'You cannot delete your default payout method.');
      return;
    }
    Alert.alert(
      'Delete Payout Method',
      'Are you sure you want to delete this payout method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMethods(methods.filter((m) => m.id !== id));
          },
        },
      ]
    );
  };

  const handleAddMethod = () => {
    if (!newMethod.bankName || !newMethod.accountNumber || !newMethod.branchNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const newId = `payout-${Date.now()}`;
    const lastFour = newMethod.accountNumber.slice(-4);
    setMethods([
      ...methods,
      {
        id: newId,
        type: 'bank',
        name: newMethod.bankName,
        lastFour,
        isDefault: methods.length === 0,
      },
    ]);
    setNewMethod({ bankName: '', accountNumber: '', branchNumber: '' });
    setIsAdding(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Payout Methods',
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
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <CreditCard size={28} color={COLORS.gold} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Earnings Payout</Text>
            <Text style={styles.summaryText}>
              Payouts are processed weekly on Sundays
            </Text>
          </View>
        </View>

        <View style={styles.alertBox}>
          <AlertCircle size={18} color={COLORS.warning} />
          <Text style={styles.alertText}>
            Minimum payout amount is 100. Earnings below this will roll over to next week.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your Payout Methods</Text>

        {methods.length > 0 ? (
          <View style={styles.methodsCard}>
            {methods.map((method, index) => (
              <View
                key={method.id}
                style={[
                  styles.methodItem,
                  index !== methods.length - 1 && styles.methodItemBorder,
                ]}
              >
                <View style={styles.methodIcon}>
                  <Building2 size={20} color={COLORS.gold} />
                </View>
                <View style={styles.methodContent}>
                  <View style={styles.methodHeader}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.methodDetails}>
                    Account ending in {method.lastFour}
                  </Text>
                </View>
                <View style={styles.methodActions}>
                  {!method.isDefault && (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Check size={16} color={COLORS.success} />
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleDelete(method.id)}
                  >
                    <Trash2 size={16} color={COLORS.error} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <CreditCard size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Payout Methods</Text>
            <Text style={styles.emptyText}>
              Add a bank account to receive your earnings
            </Text>
          </View>
        )}

        {isAdding ? (
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>Add Bank Account</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                value={newMethod.bankName}
                onChangeText={(text) =>
                  setNewMethod({ ...newMethod, bankName: text })
                }
                placeholder="e.g., Bank Leumi"
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Branch Number</Text>
              <TextInput
                value={newMethod.branchNumber}
                onChangeText={(text) =>
                  setNewMethod({ ...newMethod, branchNumber: text })
                }
                placeholder="e.g., 123"
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                value={newMethod.accountNumber}
                onChangeText={(text) =>
                  setNewMethod({ ...newMethod, accountNumber: text })
                }
                placeholder="Enter account number"
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.mediumGray}
                activeOutlineColor={COLORS.gold}
                textColor={COLORS.textInverse}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.addActions}>
              <Button
                mode="outlined"
                onPress={() => setIsAdding(false)}
                style={styles.addCancelButton}
                textColor={COLORS.textMuted}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddMethod}
                style={styles.addSaveButton}
                buttonColor={COLORS.gold}
                textColor={COLORS.charcoal}
              >
                Add Account
              </Button>
            </View>
          </View>
        ) : (
          <Pressable style={styles.addButton} onPress={() => setIsAdding(true)}>
            <Plus size={20} color={COLORS.gold} />
            <Text style={styles.addButtonText}>Add Payout Method</Text>
          </Pressable>
        )}

        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Shield size={20} color={COLORS.success} />
            <Text style={styles.securityTitle}>Secure & Protected</Text>
          </View>
          <Text style={styles.securityText}>
            Your banking information is encrypted and stored securely. We never
            share your data with third parties.
          </Text>
        </View>
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
    marginBottom: SPACING.xxs,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  alertText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  methodsCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  methodItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  methodContent: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  methodName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
  },
  defaultBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.xs,
  },
  defaultBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.success,
  },
  methodDetails: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  methodActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: RADIUS.lg,
    padding: SPACING['3xl'],
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderStyle: 'dashed',
    marginBottom: SPACING.lg,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.gold,
  },
  addCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  addTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
    marginBottom: SPACING.lg,
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
  addActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  addCancelButton: {
    flex: 1,
    borderColor: COLORS.mediumGray,
  },
  addSaveButton: {
    flex: 1,
  },
  securityCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  securityTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.success,
  },
  securityText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});
