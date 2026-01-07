import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Text, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Home,
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  Star,
} from 'lucide-react-native';
import { DARK_COLORS } from '@/constants/theme';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

const MOCK_ADDRESSES: SavedAddress[] = [
  {
    id: '1',
    label: 'Home',
    address: 'Dizengoff 123, Tel Aviv, Israel',
    type: 'home',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    address: 'Rothschild 45, Tel Aviv, Israel',
    type: 'work',
    isDefault: false,
  },
];

function AddressIcon({ type }: { type: SavedAddress['type'] }) {
  switch (type) {
    case 'home':
      return <Home size={20} color={DARK_COLORS.primary} />;
    case 'work':
      return <Briefcase size={20} color={DARK_COLORS.primary} />;
    default:
      return <MapPin size={20} color={DARK_COLORS.primary} />;
  }
}

export default function SavedAddressesScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState<SavedAddress[]>(MOCK_ADDRESSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [selectedType, setSelectedType] = useState<SavedAddress['type']>('home');

  const handleAddAddress = () => {
    if (!newLabel.trim() || !newAddress.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newId = Date.now().toString();
    setAddresses([
      ...addresses,
      {
        id: newId,
        label: newLabel,
        address: newAddress,
        type: selectedType,
        isDefault: addresses.length === 0,
      },
    ]);
    setNewLabel('');
    setNewAddress('');
    setSelectedType('home');
    setShowAddModal(false);
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(addresses.filter((a) => a.id !== id));
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Saved Addresses',
          headerStyle: { backgroundColor: DARK_COLORS.background },
          headerTitleStyle: { fontWeight: '700', color: DARK_COLORS.textPrimary },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={DARK_COLORS.textPrimary} />
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
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={64} color={DARK_COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyText}>
              Add your frequently used addresses for quick booking
            </Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.iconContainer}>
                  <AddressIcon type={address.type} />
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.labelRow}>
                    <Text style={styles.addressLabel}>{address.label}</Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {address.address}
                  </Text>
                </View>
              </View>
              <View style={styles.addressActions}>
                {!address.isDefault && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Star size={18} color={DARK_COLORS.textSecondary} />
                  </Pressable>
                )}
                <Pressable style={styles.actionButton}>
                  <Edit3 size={18} color={DARK_COLORS.textSecondary} />
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleDeleteAddress(address.id)}
                >
                  <Trash2 size={18} color={DARK_COLORS.error} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          mode="contained"
          onPress={() => setShowAddModal(true)}
          icon={() => <Plus size={20} color="#FFFFFF" />}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
          buttonColor={DARK_COLORS.primary}
        >
          Add New Address
        </Button>
      </View>

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Add New Address</Text>

          <View style={styles.typeSelector}>
            {(['home', 'work', 'other'] as const).map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.typeButton,
                  selectedType === type && styles.typeButtonActive,
                ]}
                onPress={() => setSelectedType(type)}
              >
                <AddressIcon type={type} />
                <Text
                  style={[
                    styles.typeText,
                    selectedType === type && styles.typeTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder="Label (e.g., Home, Office)"
            placeholderTextColor={DARK_COLORS.textMuted}
            mode="outlined"
            style={styles.modalInput}
            outlineStyle={styles.inputOutline}
            outlineColor={DARK_COLORS.border}
            activeOutlineColor={DARK_COLORS.primary}
            textColor={DARK_COLORS.textPrimary}
          />

          <TextInput
            value={newAddress}
            onChangeText={setNewAddress}
            placeholder="Full address"
            placeholderTextColor={DARK_COLORS.textMuted}
            mode="outlined"
            style={styles.modalInput}
            outlineStyle={styles.inputOutline}
            outlineColor={DARK_COLORS.border}
            activeOutlineColor={DARK_COLORS.primary}
            textColor={DARK_COLORS.textPrimary}
            multiline
            numberOfLines={2}
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddModal(false)}
              style={styles.modalButton}
              textColor={DARK_COLORS.textSecondary}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddAddress}
              style={styles.modalButton}
              buttonColor={DARK_COLORS.primary}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
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
    color: DARK_COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: DARK_COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 240,
  },
  addressCard: {
    borderRadius: 16,
    backgroundColor: DARK_COLORS.surface,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  addressHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: DARK_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: DARK_COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressText: {
    fontSize: 14,
    color: DARK_COLORS.textSecondary,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: DARK_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: DARK_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
  },
  addButton: {
    borderRadius: 14,
  },
  addButtonContent: {
    height: 52,
  },
  modalContent: {
    backgroundColor: DARK_COLORS.surface,
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: DARK_COLORS.primaryMuted,
    borderColor: DARK_COLORS.primary,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    color: DARK_COLORS.textSecondary,
  },
  typeTextActive: {
    color: DARK_COLORS.primary,
  },
  modalInput: {
    backgroundColor: DARK_COLORS.input,
    marginBottom: 12,
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
});
