import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Chip, Surface } from 'react-native-paper';
import { Check, Clock, Sparkles } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInDown,
} from 'react-native-reanimated';
import type { Tables } from '@/services/supabase/database.types';
import { useBookingStore } from '@/stores/useBookingStore';

const GOLD = '#DAA520';
const DARK_GOLD = '#B8860B';
const BURGUNDY = '#722F37';

type Service = Tables<'services'>;
type ServiceCategory = 'haircut' | 'beard' | 'shave' | 'combo' | 'styling' | 'coloring';

interface ServiceSelectorProps {
  services: Service[];
  isLoading?: boolean;
}

interface ServiceItemProps {
  service: Service;
  isSelected: boolean;
  onToggle: (service: Service) => void;
}

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  haircut: 'Haircuts',
  beard: 'Beard',
  shave: 'Shave',
  combo: 'Combos',
  styling: 'Styling',
  coloring: 'Coloring',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ServiceItem({ service, isSelected, onToggle }: ServiceItemProps): React.JSX.Element {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const handlePress = useCallback(() => {
    onToggle(service);
  }, [service, onToggle]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <Surface
        style={[
          styles.serviceItem,
          isSelected && styles.serviceItemSelected,
        ]}
        elevation={isSelected ? 2 : 1}
      >
        <View style={styles.serviceContent}>
          <View style={styles.serviceInfo}>
            <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
              {service.name}
            </Text>
            {service.description && (
              <Text style={styles.serviceDescription} numberOfLines={1}>
                {service.description}
              </Text>
            )}
            <View style={styles.serviceMeta}>
              <Clock size={12} color="#9CA3AF" />
              <Text style={styles.duration}>{service.estimated_duration} min</Text>
            </View>
          </View>

          <View style={styles.serviceRight}>
            <Text style={[styles.price, isSelected && styles.priceSelected]}>
              {service.base_price} ILS
            </Text>
            {isSelected && (
              <View style={styles.checkmark}>
                <Check size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>
      </Surface>
    </AnimatedPressable>
  );
}

export function ServiceSelector({
  services,
  isLoading = false,
}: ServiceSelectorProps): React.JSX.Element {
  const selectedServices = useBookingStore((s) => s.selectedServices);
  const addService = useBookingStore((s) => s.addService);
  const removeService = useBookingStore((s) => s.removeService);

  const selectedIds = useMemo(
    () => new Set(selectedServices.map((s) => s.id)),
    [selectedServices]
  );

  const groupedServices = useMemo(() => {
    const groups = new Map<ServiceCategory, Service[]>();
    
    for (const service of services) {
      const category = service.category as ServiceCategory;
      const existing = groups.get(category) ?? [];
      groups.set(category, [...existing, service]);
    }
    
    return groups;
  }, [services]);

  const handleToggle = useCallback((service: Service) => {
    if (selectedIds.has(service.id)) {
      removeService(service.id);
    } else {
      addService(service);
    }
  }, [selectedIds, addService, removeService]);

  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.base_price, 0),
    [selectedServices]
  );

  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.estimated_duration, 0),
    [selectedServices]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Array.from(groupedServices.entries()).map(([category, categoryServices]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {CATEGORY_LABELS[category]}
            </Text>
            {categoryServices.map((service) => (
              <ServiceItem
                key={service.id}
                service={service}
                isSelected={selectedIds.has(service.id)}
                onToggle={handleToggle}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {selectedServices.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
            </Text>
            <View style={styles.chips}>
              <Chip icon="clock-outline" compact>
                {totalDuration} min
              </Chip>
              <Chip icon="currency-ils" compact mode="flat">
                {totalPrice} ILS
              </Chip>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#757575',
    fontSize: 15,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  categorySection: {
    marginBottom: 28,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BURGUNDY,
    marginBottom: 14,
    paddingLeft: 4,
    letterSpacing: 0.3,
  },
  serviceItem: {
    marginBottom: 10,
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  serviceItemSelected: {
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: 'rgba(218, 165, 32, 0.06)',
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 14,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  serviceNameSelected: {
    color: DARK_GOLD,
    fontWeight: '700',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 6,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  duration: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  serviceRight: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  priceSelected: {
    color: DARK_GOLD,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  summary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  chips: {
    flexDirection: 'row',
    gap: 10,
  },
});
