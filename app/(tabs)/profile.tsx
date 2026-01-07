import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/context/AuthContext';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showBadge?: boolean;
}

function MenuItem({ icon, label, onPress, showBadge }: MenuItemProps): React.JSX.Element {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.menuItem}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
        {showBadge && <View style={styles.badge} />}
        <ChevronRight size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loginPrompt}>
          <User size={64} color="#D1D5DB" />
          <Text style={styles.loginTitle}>Sign in to continue</Text>
          <Text style={styles.loginText}>
            Create an account to book barbers and track your appointments
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          >
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Surface style={styles.profileCard} elevation={2}>
        <Avatar
          uri={null}
          name={user.email ?? 'User'}
          size={80}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user.email?.split('@')[0] ?? 'User'}
          </Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.ratingRow}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>5.0 rating</Text>
          </View>
        </View>
      </Surface>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Surface style={styles.menuCard} elevation={1}>
          <MenuItem
            icon={<User size={20} color="#6B7280" />}
            label="Edit Profile"
            onPress={() => {}}
          />
          <MenuItem
            icon={<MapPin size={20} color="#6B7280" />}
            label="Saved Addresses"
            onPress={() => {}}
          />
          <MenuItem
            icon={<CreditCard size={20} color="#6B7280" />}
            label="Payment Methods"
            onPress={() => {}}
          />
        </Surface>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Surface style={styles.menuCard} elevation={1}>
          <MenuItem
            icon={<Bell size={20} color="#6B7280" />}
            label="Notifications"
            onPress={() => {}}
            showBadge
          />
          <MenuItem
            icon={<HelpCircle size={20} color="#6B7280" />}
            label="Help & Support"
            onPress={() => {}}
          />
        </Surface>
      </View>

      <Button
        mode="outlined"
        onPress={handleSignOut}
        loading={isLoading}
        icon={() => <LogOut size={18} color="#EF4444" />}
        textColor="#EF4444"
        style={styles.signOutButton}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  signOutButton: {
    borderColor: '#FEE2E2',
    borderRadius: 12,
  },
});
