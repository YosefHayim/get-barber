import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Button, Surface, Chip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  X,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Heart,
  Share2,
} from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Rating } from '@/components/ui/Rating';

export default function BarberDetailScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#111827" />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Heart size={22} color="#6B7280" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Share2 size={22} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Avatar
            uri={null}
            name="Demo Barber"
            size={100}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>Demo Barber</Text>
            <View style={styles.verifiedBadge}>
              <CheckCircle size={14} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <Rating value={4.8} totalReviews={124} size="medium" />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>500+</Text>
              <Text style={styles.statLabel}>Haircuts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2.5 km</Text>
              <Text style={styles.statLabel}>Away</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15 min</Text>
              <Text style={styles.statLabel}>ETA</Text>
            </View>
          </View>
        </View>

        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>
            Professional barber with 10+ years of experience. Specializing in modern cuts, 
            fades, and beard grooming. I bring my mobile setup to your location for maximum 
            convenience.
          </Text>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Services & Prices</Text>
          <View style={styles.serviceList}>
            {[
              { name: 'Classic Haircut', price: 80 },
              { name: 'Fade', price: 90 },
              { name: 'Beard Trim', price: 50 },
              { name: 'Full Service', price: 150 },
            ].map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>{service.price} ILS</Text>
              </View>
            ))}
          </View>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.chipRow}>
            <Chip icon={() => <Clock size={14} color="#3B82F6" />}>
              Available Now
            </Chip>
            <Chip>Sun-Thu 9:00-20:00</Chip>
          </View>
        </Surface>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.priceRange}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>50 ILS</Text>
        </View>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.requestButton}
          contentStyle={styles.buttonContent}
        >
          Request This Barber
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  serviceList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 15,
    color: '#374151',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  priceRange: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  requestButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    height: 48,
  },
});
