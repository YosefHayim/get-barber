import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { CreditCard, Shield, Info } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, formatPrice } from '@/constants/theme';

const DEPOSIT_PERCENTAGE = 0.1;

interface PaymentBreakdownProps {
  totalAmount: number;
  serviceName?: string;
  homeServiceSurcharge?: number;
  showDepositOnly?: boolean;
}

export function PaymentBreakdown({
  totalAmount,
  serviceName,
  homeServiceSurcharge = 0,
  showDepositOnly = false,
}: PaymentBreakdownProps): React.JSX.Element {
  const subtotal = totalAmount - homeServiceSurcharge;
  const depositAmount = Math.round(totalAmount * DEPOSIT_PERCENTAGE);
  const remainingAmount = totalAmount - depositAmount;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CreditCard size={20} color={COLORS.navy} />
        <Text style={styles.headerTitle}>Payment Summary</Text>
      </View>

      <View style={styles.breakdown}>
        {serviceName && (
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>{serviceName}</Text>
            <Text style={styles.lineValue}>{formatPrice(subtotal)}</Text>
          </View>
        )}

        {homeServiceSurcharge > 0 && (
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Home Service Fee</Text>
            <Text style={styles.lineValue}>{formatPrice(homeServiceSurcharge)}</Text>
          </View>
        )}

        {!showDepositOnly && (
          <>
            <View style={styles.divider} />
            <View style={styles.lineItem}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.depositSection}>
        <View style={styles.depositHeader}>
          <Shield size={18} color={COLORS.success} />
          <Text style={styles.depositTitle}>Secure Deposit (10%)</Text>
        </View>
        
        <View style={styles.depositAmountRow}>
          <Text style={styles.depositLabel}>Pay now to confirm</Text>
          <Text style={styles.depositAmount}>{formatPrice(depositAmount)}</Text>
        </View>

        <View style={styles.remainingRow}>
          <Text style={styles.remainingLabel}>Pay on arrival</Text>
          <Text style={styles.remainingAmount}>{formatPrice(remainingAmount)}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Info size={16} color={COLORS.info} />
        <Text style={styles.infoText}>
          Your deposit is fully refundable if you cancel at least 2 hours before your appointment
        </Text>
      </View>
    </View>
  );
}

interface DepositBadgeProps {
  amount: number;
}

export function DepositBadge({ amount }: DepositBadgeProps): React.JSX.Element {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>Deposit</Text>
      <Text style={styles.badgeAmount}>{formatPrice(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  breakdown: {
    marginBottom: SPACING.lg,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  lineLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  lineValue: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.navy,
  },
  depositSection: {
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  depositHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  depositTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.successDark,
  },
  depositAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  depositLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.successDark,
    fontWeight: TYPOGRAPHY.medium,
  },
  depositAmount: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.success,
  },
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  remainingAmount: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.infoDark,
    lineHeight: TYPOGRAPHY.sm * 1.5,
  },
  badge: {
    backgroundColor: COLORS.copper,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badgeLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textInverse,
  },
  badgeAmount: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
  },
});
