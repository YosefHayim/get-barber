import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
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
  Heart,
  MapPinOff,
  MoreVertical,
  Navigation,
} from 'lucide-react-native';

const LIGHT_COLORS = {
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#111618',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  primary: '#11a4d4',
  primaryLight: 'rgba(17, 164, 212, 0.1)',
  primaryDark: '#0d8ab3',
  homeBlue: '#3b82f6',
  homeBlueBg: 'rgba(59, 130, 246, 0.1)',
  workPurple: '#8b5cf6',
  workPurpleBg: 'rgba(139, 92, 246, 0.1)',
  favoriteRed: '#ef4444',
  favoriteRedBg: 'rgba(239, 68, 68, 0.1)',
  otherGray: '#64748b',
  otherGrayBg: 'rgba(100, 116, 139, 0.1)',
  editGray: '#6b7280',
  deleteRed: '#ef4444',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.15)',
};

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  type: 'home' | 'work' | 'favorite' | 'other';
  isDefault: boolean;
  isUnavailable?: boolean;
}

const MOCK_ADDRESSES: SavedAddress[] = [
  {
    id: '1',
    label: 'Home',
    address: '123 Main St, Apt 4B',
    type: 'home',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    address: '456 Tech Park Blvd, Suite 300',
    type: 'work',
    isDefault: false,
  },
  {
    id: '3',
    label: "Partner's House",
    address: '789 Pine Ave, West Wing',
    type: 'favorite',
    isDefault: false,
  },
  {
    id: '4',
    label: 'Summer House',
    address: 'Service unavailable in this area',
    type: 'other',
    isDefault: false,
    isUnavailable: true,
  },
];

function AddressIcon({ type, isUnavailable, isSelected }: { type: SavedAddress['type']; isUnavailable?: boolean; isSelected?: boolean }) {
  if (isUnavailable) {
    return (
      <View style={[styles.addressIconContainer, { backgroundColor: LIGHT_COLORS.errorBg }]}>
        <MapPinOff size={24} color={LIGHT_COLORS.error} />
      </View>
    );
  }

  switch (type) {
    case 'home':
      return (
        <View style={[
          styles.addressIconContainer,
          { backgroundColor: isSelected ? LIGHT_COLORS.primaryLight : LIGHT_COLORS.homeBlueBg }
        ]}>
          <Home size={24} color={isSelected ? LIGHT_COLORS.primary : LIGHT_COLORS.homeBlue} />
        </View>
      );
    case 'work':
      return (
        <View style={[
          styles.addressIconContainer,
          { backgroundColor: isSelected ? LIGHT_COLORS.primaryLight : LIGHT_COLORS.workPurpleBg }
        ]}>
          <Briefcase size={24} color={isSelected ? LIGHT_COLORS.primary : LIGHT_COLORS.workPurple} />
        </View>
      );
    case 'favorite':
      return (
        <View style={[
          styles.addressIconContainer,
          { backgroundColor: isSelected ? LIGHT_COLORS.primaryLight : LIGHT_COLORS.favoriteRedBg }
        ]}>
          <Heart size={24} color={isSelected ? LIGHT_COLORS.primary : LIGHT_COLORS.favoriteRed} />
        </View>
      );
    default:
      return (
        <View style={[
          styles.addressIconContainer,
          { backgroundColor: isSelected ? LIGHT_COLORS.primaryLight : LIGHT_COLORS.otherGrayBg }
        ]}>
          <MapPin size={24} color={isSelected ? LIGHT_COLORS.primary : LIGHT_COLORS.otherGray} />
        </View>
      );
  }
}

export default function SavedAddressesScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState<SavedAddress[]>(MOCK_ADDRESSES);
  const [selectedId, setSelectedId] = useState<string>(
    MOCK_ADDRESSES.find(a => a.isDefault)?.id || ''
  );
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

  const handleSelectAddress = (id: string) => {
    const address = addresses.find(a => a.id === id);
    if (address?.isUnavailable) return;

    setSelectedId(id);
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
          title: 'My Locations',
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
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Helper Text */}
        <Text style={styles.helperText}>
          Select a delivery address or swipe left to manage.
        </Text>

        {/* Address List */}
        <View style={styles.addressList}>
          {addresses.map((address) => {
            const isSelected = address.id === selectedId && !address.isUnavailable;
            return (
              <Pressable
                key={address.id}
                style={[
                  styles.addressCard,
                  isSelected && styles.addressCardSelected,
                  address.isUnavailable && styles.addressCardUnavailable,
                ]}
                onPress={() => handleSelectAddress(address.id)}
              >
                <AddressIcon
                  type={address.type}
                  isUnavailable={address.isUnavailable}
                  isSelected={isSelected}
                />
                <View style={styles.addressInfo}>
                  <View style={styles.labelRow}>
                    <Text style={styles.addressLabel}>{address.label}</Text>
                    {address.isDefault && !address.isUnavailable && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.addressText,
                      address.isUnavailable && styles.addressTextError,
                    ]}
                    numberOfLines={1}
                  >
                    {address.isUnavailable
                      ? 'Service unavailable in this area'
                      : address.address}
                  </Text>
                </View>
                {address.isUnavailable ? (
                  <Pressable style={styles.menuButton}>
                    <MoreVertical size={20} color={LIGHT_COLORS.textMuted} />
                  </Pressable>
                ) : (
                  <View style={styles.radioButton}>
                    {isSelected ? (
                      <View style={styles.radioSelected}>
                        <View style={styles.radioInner} />
                      </View>
                    ) : (
                      <View style={styles.radioUnselected} />
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Map Preview Section */}
        <View style={styles.mapSection}>
          <Text style={styles.mapSectionTitle}>CURRENT LOCATION</Text>
          <View style={styles.mapContainer}>
            <Image
              source={{
                uri: 'https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-73.99,40.73,12,0/400x200@2x?access_token=pk.placeholder',
              }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay} />
            <View style={styles.mapPinContainer}>
              <Navigation size={18} color={LIGHT_COLORS.primary} />
              <View style={styles.mapLabel}>
                <Text style={styles.mapLabelText}>Finding nearby barbers...</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Button
          mode="contained"
          onPress={() => setShowAddModal(true)}
          icon={() => <Plus size={20} color="#FFFFFF" />}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
          buttonColor={LIGHT_COLORS.primary}
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
            {(['home', 'work', 'favorite', 'other'] as const).map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.typeButton,
                  selectedType === type && styles.typeButtonActive,
                ]}
                onPress={() => setSelectedType(type)}
              >
                <AddressIcon type={type} isSelected={selectedType === type} />
                <Text
                  style={[
                    styles.typeText,
                    selectedType === type && styles.typeTextActive,
                  ]}
                >
                  {type === 'favorite' ? 'Favorite' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder="Label (e.g., Home, Office)"
            placeholderTextColor={LIGHT_COLORS.textMuted}
            mode="outlined"
            style={styles.modalInput}
            outlineStyle={styles.inputOutline}
            outlineColor={LIGHT_COLORS.border}
            activeOutlineColor={LIGHT_COLORS.primary}
            textColor={LIGHT_COLORS.textPrimary}
          />

          <TextInput
            value={newAddress}
            onChangeText={setNewAddress}
            placeholder="Full address"
            placeholderTextColor={LIGHT_COLORS.textMuted}
            mode="outlined"
            style={styles.modalInput}
            outlineStyle={styles.inputOutline}
            outlineColor={LIGHT_COLORS.border}
            activeOutlineColor={LIGHT_COLORS.primary}
            textColor={LIGHT_COLORS.textPrimary}
            multiline
            numberOfLines={2}
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddModal(false)}
              style={styles.modalButton}
              textColor={LIGHT_COLORS.textSecondary}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddAddress}
              style={styles.modalButton}
              buttonColor={LIGHT_COLORS.primary}
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
    backgroundColor: LIGHT_COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerButton: {
    padding: 8,
  },
  helperText: {
    fontSize: 14,
    fontWeight: '500',
    color: LIGHT_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  addressList: {
    gap: 16,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 12,
    backgroundColor: LIGHT_COLORS.surface,
    padding: 16,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  addressCardSelected: {
    borderColor: LIGHT_COLORS.primary,
  },
  addressCardUnavailable: {
    opacity: 0.75,
  },
  addressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressIconDefault: {
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
  },
  addressIconSelected: {
    backgroundColor: LIGHT_COLORS.primaryLight,
  },
  addressIconUnavailable: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  addressInfo: {
    flex: 1,
    minWidth: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
  },
  defaultBadge: {
    backgroundColor: LIGHT_COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: LIGHT_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    color: LIGHT_COLORS.textMuted,
  },
  addressTextError: {
    color: LIGHT_COLORS.error,
    fontWeight: '500',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton: {
    marginLeft: 4,
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: LIGHT_COLORS.primary,
    backgroundColor: LIGHT_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: LIGHT_COLORS.textMuted,
  },
  // Map Section
  mapSection: {
    marginTop: 32,
  },
  mapSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  mapContainer: {
    height: 128,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  mapPinContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mapLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  // Footer
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
  addButton: {
    borderRadius: 12,
  },
  addButtonContent: {
    height: 52,
  },
  // Modal
  modalContent: {
    backgroundColor: LIGHT_COLORS.surface,
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    minWidth: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: LIGHT_COLORS.primaryLight,
    borderColor: LIGHT_COLORS.primary,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    color: LIGHT_COLORS.textSecondary,
  },
  typeTextActive: {
    color: LIGHT_COLORS.primary,
  },
  modalInput: {
    backgroundColor: LIGHT_COLORS.surface,
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
