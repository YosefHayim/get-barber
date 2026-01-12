import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput as RNTextInput,
  Image,
} from 'react-native';
import { Text, Surface, Button, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Scissors,
  Edit2,
  Check,
  X,
  Camera,
  Image as ImageIcon,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { MOCK_SERVICES } from '@/constants/mockData';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  imageUri?: string;
}

export default function ServicesPricingScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedService, setEditedService] = useState<Partial<Service>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    price: 0,
    duration: 30,
    imageUri: undefined,
  });

  const handlePickServiceImage = async (serviceId?: string) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      if (serviceId && editingId === serviceId) {
        setEditedService({ ...editedService, imageUri: uri });
      } else if (serviceId) {
        setServices(services.map((s) => 
          s.id === serviceId ? { ...s, imageUri: uri } : s
        ));
      } else {
        setNewService({ ...newService, imageUri: uri });
      }
    }
  };

  const handleRemoveServiceImage = (serviceId?: string) => {
    if (serviceId && editingId === serviceId) {
      setEditedService({ ...editedService, imageUri: undefined });
    } else if (serviceId) {
      setServices(services.map((s) => 
        s.id === serviceId ? { ...s, imageUri: undefined } : s
      ));
    } else {
      setNewService({ ...newService, imageUri: undefined });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setEditedService({ ...service });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editedService.name) return;
    setServices(
      services.map((s) =>
        s.id === editingId
          ? { ...s, ...editedService }
          : s
      )
    );
    setEditingId(null);
    setEditedService({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedService({});
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setServices(services.filter((s) => s.id !== id));
          },
        },
      ]
    );
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const newId = `svc-${Date.now()}`;
    setServices([
      ...services,
      {
        id: newId,
        name: newService.name,
        price: newService.price,
        duration: newService.duration || 30,
        imageUri: newService.imageUri,
      },
    ]);
    setNewService({ name: '', price: 0, duration: 30, imageUri: undefined });
    setIsAdding(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Services & Pricing',
          headerStyle: { backgroundColor: LIGHT_COLORS.surface },
          headerTitleStyle: { fontWeight: '700', color: LIGHT_COLORS.textPrimary },
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
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{services.length}</Text>
              <Text style={styles.summaryLabel}>Services</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.min(...services.map((s) => s.price))}-{Math.max(...services.map((s) => s.price))}
              </Text>
              <Text style={styles.summaryLabel}>Price Range</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Services</Text>

        <View style={styles.servicesCard}>
          {services.map((service, index) => (
            <View
              key={service.id}
              style={[
                styles.serviceItem,
                index !== services.length - 1 && styles.serviceItemBorder,
              ]}
            >
              {editingId === service.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    value={editedService.name}
                    onChangeText={(text) =>
                      setEditedService({ ...editedService, name: text })
                    }
                    placeholder="Service name"
                    mode="outlined"
                    style={styles.editInput}
                    outlineColor={LIGHT_COLORS.border}
                    activeOutlineColor={COLORS.gold}
                    textColor={LIGHT_COLORS.textPrimary}
                    placeholderTextColor={LIGHT_COLORS.textMuted}
                  />
                  <View style={styles.editRow}>
                    <TextInput
                      value={String(editedService.price || '')}
                      onChangeText={(text) =>
                        setEditedService({
                          ...editedService,
                          price: parseInt(text) || 0,
                        })
                      }
                      placeholder="Price"
                      mode="outlined"
                      style={[styles.editInput, styles.editInputSmall]}
                      keyboardType="numeric"
                      outlineColor={LIGHT_COLORS.border}
                      activeOutlineColor={COLORS.gold}
                      textColor={LIGHT_COLORS.textPrimary}
                      left={<TextInput.Affix text="$" textStyle={{ color: COLORS.gold }} />}
                    />
                    <TextInput
                      value={String(editedService.duration || '')}
                      onChangeText={(text) =>
                        setEditedService({
                          ...editedService,
                          duration: parseInt(text) || 0,
                        })
                      }
                      placeholder="Duration"
                      mode="outlined"
                      style={[styles.editInput, styles.editInputSmall]}
                      keyboardType="numeric"
                      outlineColor={LIGHT_COLORS.border}
                      activeOutlineColor={COLORS.gold}
                      textColor={LIGHT_COLORS.textPrimary}
                      right={<TextInput.Affix text="min" textStyle={{ color: LIGHT_COLORS.textMuted }} />}
                    />
                  </View>
                  <View style={styles.imagePickerRow}>
                    <Text style={styles.imagePickerLabel}>Service Image</Text>
                    {editedService.imageUri ? (
                      <View style={styles.editImageContainer}>
                        <Image source={{ uri: editedService.imageUri }} style={styles.editServiceImage} />
                        <Pressable
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveServiceImage(service.id)}
                        >
                          <X size={12} color={COLORS.textInverse} />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        style={styles.addImageButton}
                        onPress={() => handlePickServiceImage(service.id)}
                      >
                        <Camera size={16} color={COLORS.gold} />
                        <Text style={styles.addImageText}>Add Photo</Text>
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.editActions}>
                    <Pressable
                      style={[styles.editButton, styles.cancelButton]}
                      onPress={handleCancelEdit}
                    >
                      <X size={18} color={COLORS.error} />
                    </Pressable>
                    <Pressable
                      style={[styles.editButton, styles.saveButton]}
                      onPress={handleSaveEdit}
                    >
                      <Check size={18} color={COLORS.success} />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  {service.imageUri ? (
                    <Image source={{ uri: service.imageUri }} style={styles.serviceImage} />
                  ) : (
                    <View style={styles.serviceIcon}>
                      <Scissors size={18} color={COLORS.gold} />
                    </View>
                  )}
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.serviceDetails}>
                      <View style={styles.serviceDetail}>
                        <DollarSign size={12} color={LIGHT_COLORS.textMuted} />
                        <Text style={styles.serviceDetailText}>{service.price}</Text>
                      </View>
                      <View style={styles.serviceDetail}>
                        <Clock size={12} color={LIGHT_COLORS.textMuted} />
                        <Text style={styles.serviceDetailText}>{service.duration} min</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.serviceActions}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handlePickServiceImage(service.id)}
                    >
                      <Camera size={16} color={COLORS.gold} />
                    </Pressable>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleEdit(service)}
                    >
                      <Edit2 size={16} color={COLORS.gold} />
                    </Pressable>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleDelete(service.id)}
                    >
                      <Trash2 size={16} color={COLORS.error} />
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>

        {isAdding ? (
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>Add New Service</Text>
            <TextInput
              value={newService.name}
              onChangeText={(text) =>
                setNewService({ ...newService, name: text })
              }
              placeholder="Service name"
              mode="outlined"
              style={styles.addInput}
              outlineColor={LIGHT_COLORS.border}
              activeOutlineColor={COLORS.gold}
              textColor={LIGHT_COLORS.textPrimary}
              placeholderTextColor={LIGHT_COLORS.textMuted}
            />
            <View style={styles.addRow}>
              <TextInput
                value={newService.price ? String(newService.price) : ''}
                onChangeText={(text) =>
                  setNewService({ ...newService, price: parseInt(text) || 0 })
                }
                placeholder="Price"
                mode="outlined"
                style={[styles.addInput, styles.addInputSmall]}
                keyboardType="numeric"
                outlineColor={LIGHT_COLORS.border}
                activeOutlineColor={COLORS.gold}
                textColor={LIGHT_COLORS.textPrimary}
                left={<TextInput.Affix text="$" textStyle={{ color: COLORS.gold }} />}
              />
              <TextInput
                value={newService.duration ? String(newService.duration) : ''}
                onChangeText={(text) =>
                  setNewService({ ...newService, duration: parseInt(text) || 0 })
                }
                placeholder="Duration"
                mode="outlined"
                style={[styles.addInput, styles.addInputSmall]}
                keyboardType="numeric"
                outlineColor={LIGHT_COLORS.border}
                activeOutlineColor={COLORS.gold}
                textColor={LIGHT_COLORS.textPrimary}
                right={<TextInput.Affix text="min" textStyle={{ color: LIGHT_COLORS.textMuted }} />}
              />
            </View>
            <View style={styles.imagePickerRow}>
              <Text style={styles.imagePickerLabel}>Service Image (Optional)</Text>
              {newService.imageUri ? (
                <View style={styles.editImageContainer}>
                  <Image source={{ uri: newService.imageUri }} style={styles.editServiceImage} />
                  <Pressable
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveServiceImage()}
                  >
                    <X size={12} color={COLORS.textInverse} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.addImageButton}
                  onPress={() => handlePickServiceImage()}
                >
                  <Camera size={16} color={COLORS.gold} />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.addActions}>
              <Button
                mode="outlined"
                onPress={() => setIsAdding(false)}
                style={styles.addCancelButton}
                textColor={LIGHT_COLORS.textSecondary}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddService}
                style={styles.addSaveButton}
                buttonColor={COLORS.gold}
                textColor={COLORS.charcoal}
              >
                Add Service
              </Button>
            </View>
          </View>
        ) : (
          <Pressable style={styles.addButton} onPress={() => setIsAdding(true)}>
            <Plus size={20} color={COLORS.gold} />
            <Text style={styles.addButtonText}>Add New Service</Text>
          </Pressable>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Pricing Tips</Text>
          <Text style={styles.infoText}>
            Keep your prices competitive with the market. Include travel time in your
            duration estimates for better scheduling.
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
    padding: SPACING.lg,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
    marginBottom: SPACING.xxs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: LIGHT_COLORS.border,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicesCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  serviceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  serviceImage: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  serviceDetailText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContainer: {
    flex: 1,
    gap: SPACING.sm,
  },
  editInput: {
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
  },
  editInputSmall: {
    flex: 1,
  },
  editRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  imagePickerLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
  },
  editImageContainer: {
    position: 'relative',
  },
  editServiceImage: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.sm,
  },
  addImageText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.medium,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  saveButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  addTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
  },
  addInput: {
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
  },
  addInputSmall: {
    flex: 1,
  },
  addRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  addCancelButton: {
    flex: 1,
    borderColor: LIGHT_COLORS.border,
  },
  addSaveButton: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    lineHeight: 20,
  },
});
