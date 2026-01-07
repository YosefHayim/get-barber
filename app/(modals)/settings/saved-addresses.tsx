import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Text, Surface, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Home,
  Briefcase,
  Plus,
  MoreVertical,
  Trash2,
  Edit3,
  Star,
} from 'lucide-react-native';

const GOLD = '#DAA520';
const DARK_GOLD = '#B8860B';
const BURGUNDY = '#722F37';

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
      return <Home size={20} color={DARK_GOLD} />;
    case 'work':
      return <Briefcase size={20} color={DARK_GOLD} />;
    default:
      return <MapPin size={20} color={DARK_GOLD} />;
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
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyText}>
              Add your frequently used addresses for quick booking
            </Text>
          </View>
        ) : (
          addresses.map((address) => (
            <Surface key={address.id} style={styles.addressCard} elevation={1}>
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
                    <Star size={18} color="#6B7280" />
                  </Pressable>
                )}
                <Pressable style={styles.actionButton}>
                  <Edit3 size={18} color="#6B7280" />
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleDeleteAddress(address.id)}
                >
                  <Trash2 size={18} color="#EF4444" />
                </Pressable>
              </View>
            </Surface>
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
          buttonColor={DARK_GOLD}
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
            mode="outlined"
            style={styles.modalInput}
            outlineStyle={styles.inputOutline}
            outlineColor="#E5E7EB"
            activeOutlineColor={DARK_GOLD}
          />

          <TextInput
            value={newAddress}
            onChangeText={setNewAddress}
            placeholder="Full address"
            mode="outlined"
            style={styles.modalInput}
            outlineStyle={styles.inputOutline}
            outlineColor="#E5E7EB"
            activeOutlineColor={DARK_GOLD}
            multiline
            numberOfLines={2}
          />

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
              onPress={handleAddAddress}
              style={styles.modalButton}
              buttonColor={DARK_GOLD}
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
  addressCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
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
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderColor: DARK_GOLD,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeTextActive: {
    color: DARK_GOLD,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
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
