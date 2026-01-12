import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Star,
  Crown,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  ChevronRight,
  X,
  Plus,
  StickyNote,
  History,
  Tag,
  Filter,
  SortAsc,
  User,
} from 'lucide-react-native';
import { COLORS, SHADOWS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

import {
  MOCK_CLIENTS,
  CLIENT_TAG_CONFIG,
  type MockClient,
  type ClientTag,
  type ClientNote,
} from '@/constants/mockData';

type SortOption = 'name' | 'lastVisit' | 'totalSpent' | 'bookings';
type FilterOption = 'all' | 'vip' | 'regular' | 'new' | 'preferred' | 'difficult';

export default function ClientsScreen(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('lastVisit');
  const [selectedClient, setSelectedClient] = useState<MockClient | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'history'>('info');

  const filteredAndSortedClients = useMemo(() => {
    let result = [...MOCK_CLIENTS];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.displayName.toLowerCase().includes(query) ||
          client.phone.includes(query) ||
          (client.email?.toLowerCase().includes(query) ?? false)
      );
    }

    if (selectedFilter !== 'all') {
      result = result.filter((client) => client.tags.includes(selectedFilter as ClientTag));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'lastVisit':
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'bookings':
          return b.totalBookings - a.totalBookings;
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, selectedFilter, sortBy]);

  const stats = useMemo(() => {
    const total = MOCK_CLIENTS.length;
    const vipCount = MOCK_CLIENTS.filter((c) => c.isVip).length;
    const totalRevenue = MOCK_CLIENTS.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgRating =
      MOCK_CLIENTS.reduce((sum, c) => sum + c.averageRating, 0) / MOCK_CLIENTS.length;
    return { total, vipCount, totalRevenue, avgRating };
  }, []);

  const openClientDetail = useCallback((client: MockClient) => {
    setSelectedClient(client);
    setActiveTab('info');
    setShowClientModal(true);
  }, []);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleEmail = useCallback((email: string) => {
    Linking.openURL(`mailto:${email}`);
  }, []);

  const handleAddNote = useCallback(() => {
    if (!newNoteContent.trim() || !selectedClient) return;
    Alert.alert('Note Added', 'Your note has been saved.', [{ text: 'OK' }]);
    setNewNoteContent('');
    setShowAddNoteModal(false);
  }, [newNoteContent, selectedClient]);

  const toggleVip = useCallback(() => {
    if (!selectedClient) return;
    const action = selectedClient.isVip ? 'remove from' : 'add to';
    Alert.alert(
      `${selectedClient.isVip ? 'Remove' : 'Add'} VIP Status`,
      `Are you sure you want to ${action} VIP status for ${selectedClient.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => Alert.alert('Success', 'VIP status updated.') },
      ]
    );
  }, [selectedClient]);

  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  }, []);

  const renderClientCard = useCallback(
    ({ item }: { item: MockClient }) => (
      <TouchableOpacity
        style={{
          backgroundColor: LIGHT_COLORS.surface,
          borderRadius: RADIUS.lg,
          padding: SPACING.lg,
          marginBottom: SPACING.md,
          ...SHADOWS.md,
        }}
        onPress={() => openClientDetail(item)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.avatarUrl ? (
            <Image
              source={{ uri: item.avatarUrl }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: item.isVip ? 2 : 0,
                borderColor: item.isVip ? COLORS.gold : 'transparent',
              }}
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: LIGHT_COLORS.surfaceHighlight,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: item.isVip ? 2 : 0,
                borderColor: item.isVip ? COLORS.gold : 'transparent',
              }}
            >
              <User size={24} color={LIGHT_COLORS.textMuted} />
            </View>
          )}

          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.md,
                  fontWeight: TYPOGRAPHY.semibold,
                  color: LIGHT_COLORS.textPrimary,
                }}
              >
                {item.displayName}
              </Text>
              {item.isVip && (
                <Crown size={16} color={COLORS.gold} style={{ marginLeft: 6 }} />
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
              <Text
                style={{
                  fontSize: TYPOGRAPHY.sm,
                  color: COLORS.gold,
                  marginLeft: 4,
                  fontWeight: TYPOGRAPHY.medium,
                }}
              >
                {item.averageRating.toFixed(1)}
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted, marginLeft: 12 }}>
                {item.totalBookings} visits
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted, marginLeft: 12 }}>
                ₪{item.totalSpent.toLocaleString()}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {item.tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: CLIENT_TAG_CONFIG[tag].bgColor,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: RADIUS.xs,
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.xs,
                      color: CLIENT_TAG_CONFIG[tag].color,
                      fontWeight: TYPOGRAPHY.medium,
                    }}
                  >
                    {CLIENT_TAG_CONFIG[tag].label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted, marginBottom: 4 }}>
              Last visit
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textSecondary }}>
              {formatDate(item.lastVisit)}
            </Text>
            <ChevronRight size={20} color={LIGHT_COLORS.textMuted} style={{ marginTop: 8 }} />
          </View>
        </View>
      </TouchableOpacity>
    ),
    [openClientDetail, formatDate]
  );

  const renderNoteItem = useCallback(
    (note: ClientNote) => (
      <View
        key={note.id}
        style={{
          backgroundColor: LIGHT_COLORS.surfaceHighlight,
          borderRadius: RADIUS.md,
          padding: SPACING.md,
          marginBottom: SPACING.sm,
        }}
      >
        <Text style={{ fontSize: TYPOGRAPHY.base, color: LIGHT_COLORS.textPrimary, lineHeight: 22 }}>
          {note.content}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted, marginTop: SPACING.sm }}>
          {new Date(note.createdAt).toLocaleDateString()}
        </Text>
      </View>
    ),
    []
  );

  const renderBookingItem = useCallback(
    (booking: MockClient['bookingHistory'][0]) => (
      <View
        key={booking.id}
        style={{
          backgroundColor: LIGHT_COLORS.surfaceHighlight,
          borderRadius: RADIUS.md,
          padding: SPACING.md,
          marginBottom: SPACING.sm,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textSecondary }}>
            {new Date(booking.date).toLocaleDateString()}
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.md, color: COLORS.gold, fontWeight: TYPOGRAPHY.semibold }}>
            ₪{booking.totalPrice}
          </Text>
        </View>
        <Text style={{ fontSize: TYPOGRAPHY.base, color: LIGHT_COLORS.textPrimary, marginBottom: 4 }}>
          {booking.services.join(', ')}
        </Text>
        {booking.rating && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
            <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.gold, marginLeft: 4 }}>
              {booking.rating}
            </Text>
            {booking.review && (
              <Text
                style={{
                  fontSize: TYPOGRAPHY.sm,
                  color: LIGHT_COLORS.textMuted,
                  marginLeft: 8,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                "{booking.review}"
              </Text>
            )}
          </View>
        )}
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LIGHT_COLORS.background }}>
      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.md }}>
        <Text
          style={{
            fontSize: TYPOGRAPHY['2xl'],
            fontWeight: TYPOGRAPHY.bold,
            color: LIGHT_COLORS.textPrimary,
            marginBottom: SPACING.lg,
          }}
        >
          Clients
        </Text>

        <View style={{ flexDirection: 'row', marginBottom: SPACING.lg, gap: SPACING.sm }}>
          <View
            style={{
              flex: 1,
              backgroundColor: LIGHT_COLORS.surface,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: TYPOGRAPHY['xl'], fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
              {stats.total}
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>Total</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.goldMuted,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: TYPOGRAPHY['xl'], fontWeight: TYPOGRAPHY.bold, color: COLORS.gold }}>
              {stats.vipCount}
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.gold }}>VIP</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: LIGHT_COLORS.surface,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
              ₪{(stats.totalRevenue / 1000).toFixed(1)}k
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>Revenue</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: LIGHT_COLORS.surface,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: TYPOGRAPHY['xl'], fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
              {stats.avgRating.toFixed(1)}
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>Avg Rating</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: LIGHT_COLORS.surface,
            borderRadius: RADIUS.lg,
            paddingHorizontal: SPACING.md,
            marginBottom: SPACING.md,
          }}
        >
          <Search size={20} color={LIGHT_COLORS.textMuted} />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.sm,
              fontSize: TYPOGRAPHY.base,
              color: LIGHT_COLORS.textPrimary,
            }}
            placeholder="Search by name, phone, or email..."
            placeholderTextColor={LIGHT_COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={LIGHT_COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: SPACING.sm }}
          >
            {(['all', 'vip', 'regular', 'new', 'preferred', 'difficult'] as FilterOption[]).map(
              (filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={{
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    borderRadius: RADIUS.full,
                    backgroundColor:
                      selectedFilter === filter ? COLORS.gold : LIGHT_COLORS.surface,
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.sm,
                      fontWeight: TYPOGRAPHY.medium,
                      color: selectedFilter === filter ? COLORS.charcoal : LIGHT_COLORS.textSecondary,
                    }}
                  >
                    {filter === 'all'
                      ? 'All'
                      : CLIENT_TAG_CONFIG[filter as ClientTag]?.label || filter}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={() => {
              const options: SortOption[] = ['lastVisit', 'name', 'totalSpent', 'bookings'];
              const currentIndex = options.indexOf(sortBy);
              setSortBy(options[(currentIndex + 1) % options.length]);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: RADIUS.full,
              backgroundColor: LIGHT_COLORS.surface,
            }}
          >
            <SortAsc size={16} color={LIGHT_COLORS.textSecondary} />
            <Text
              style={{
                fontSize: TYPOGRAPHY.sm,
                color: LIGHT_COLORS.textSecondary,
                marginLeft: 4,
                textTransform: 'capitalize',
              }}
            >
              {sortBy === 'lastVisit' ? 'Recent' : sortBy === 'totalSpent' ? 'Spent' : sortBy}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredAndSortedClients}
        renderItem={renderClientCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: SPACING['4xl'] }}>
            <User size={48} color={LIGHT_COLORS.textMuted} />
            <Text
              style={{
                fontSize: TYPOGRAPHY.lg,
                color: LIGHT_COLORS.textMuted,
                marginTop: SPACING.md,
              }}
            >
              No clients found
            </Text>
          </View>
        }
      />

      <Modal
        visible={showClientModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowClientModal(false)}
      >
        {selectedClient && (
          <View style={{ flex: 1, backgroundColor: LIGHT_COLORS.background }}>
            <SafeAreaView style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: SPACING.xl,
                  paddingVertical: SPACING.lg,
                  borderBottomWidth: 1,
                  borderBottomColor: LIGHT_COLORS.border,
                }}
              >
                <TouchableOpacity onPress={() => setShowClientModal(false)}>
                  <X size={24} color={LIGHT_COLORS.textPrimary} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.lg,
                    fontWeight: TYPOGRAPHY.semibold,
                    color: LIGHT_COLORS.textPrimary,
                  }}
                >
                  Client Details
                </Text>
                <TouchableOpacity onPress={toggleVip}>
                  <Crown
                    size={24}
                    color={selectedClient.isVip ? COLORS.gold : LIGHT_COLORS.textMuted}
                    fill={selectedClient.isVip ? COLORS.gold : 'transparent'}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }}>
                <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
                  {selectedClient.avatarUrl ? (
                    <Image
                      source={{ uri: selectedClient.avatarUrl }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        borderWidth: selectedClient.isVip ? 3 : 0,
                        borderColor: COLORS.gold,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: LIGHT_COLORS.surfaceHighlight,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: selectedClient.isVip ? 3 : 0,
                        borderColor: COLORS.gold,
                      }}
                    >
                      <User size={40} color={LIGHT_COLORS.textMuted} />
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY['xl'],
                        fontWeight: TYPOGRAPHY.bold,
                        color: LIGHT_COLORS.textPrimary,
                      }}
                    >
                      {selectedClient.displayName}
                    </Text>
                    {selectedClient.isVip && (
                      <Crown size={20} color={COLORS.gold} style={{ marginLeft: 8 }} />
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm }}>
                    <Star size={16} color={COLORS.gold} fill={COLORS.gold} />
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.md,
                        color: COLORS.gold,
                        marginLeft: 4,
                        fontWeight: TYPOGRAPHY.semibold,
                      }}
                    >
                      {selectedClient.averageRating.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.md, color: LIGHT_COLORS.textMuted, marginLeft: 16 }}>
                      {selectedClient.totalBookings} visits
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.md, color: LIGHT_COLORS.textMuted, marginLeft: 16 }}>
                      ₪{selectedClient.totalSpent.toLocaleString()} spent
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
                    {selectedClient.tags.map((tag) => (
                      <View
                        key={tag}
                        style={{
                          backgroundColor: CLIENT_TAG_CONFIG[tag].bgColor,
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                          borderRadius: RADIUS.sm,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.sm,
                            color: CLIENT_TAG_CONFIG[tag].color,
                            fontWeight: TYPOGRAPHY.medium,
                          }}
                        >
                          {CLIENT_TAG_CONFIG[tag].label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl }}>
                    <TouchableOpacity
                      onPress={() => handleCall(selectedClient.phone)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: COLORS.success,
                        paddingHorizontal: SPACING.lg,
                        paddingVertical: SPACING.md,
                        borderRadius: RADIUS.lg,
                      }}
                    >
                      <Phone size={18} color="#ffffff" />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.sm,
                          color: '#ffffff',
                          fontWeight: TYPOGRAPHY.semibold,
                          marginLeft: 8,
                        }}
                      >
                        Call
                      </Text>
                    </TouchableOpacity>

                    {selectedClient.email && (
                      <TouchableOpacity
                        onPress={() => handleEmail(selectedClient.email!)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: COLORS.info,
                          paddingHorizontal: SPACING.lg,
                          paddingVertical: SPACING.md,
                          borderRadius: RADIUS.lg,
                        }}
                      >
                        <Mail size={18} color="#ffffff" />
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.sm,
                            color: '#ffffff',
                            fontWeight: TYPOGRAPHY.semibold,
                            marginLeft: 8,
                          }}
                        >
                          Email
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: LIGHT_COLORS.surfaceHighlight,
                        paddingHorizontal: SPACING.lg,
                        paddingVertical: SPACING.md,
                        borderRadius: RADIUS.lg,
                      }}
                    >
                      <MessageSquare size={18} color={LIGHT_COLORS.textPrimary} />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.sm,
                          color: LIGHT_COLORS.textPrimary,
                          fontWeight: TYPOGRAPHY.semibold,
                          marginLeft: 8,
                        }}
                      >
                        Message
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderBottomColor: LIGHT_COLORS.border,
                    marginHorizontal: SPACING.xl,
                  }}
                >
                  {[
                    { id: 'info', label: 'Info', icon: User },
                    { id: 'notes', label: 'Notes', icon: StickyNote },
                    { id: 'history', label: 'History', icon: History },
                  ].map((tab) => (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id as 'info' | 'notes' | 'history')}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: SPACING.md,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === tab.id ? COLORS.gold : 'transparent',
                      }}
                    >
                      <tab.icon
                        size={18}
                        color={activeTab === tab.id ? COLORS.gold : LIGHT_COLORS.textMuted}
                      />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.sm,
                          fontWeight: TYPOGRAPHY.medium,
                          color: activeTab === tab.id ? COLORS.gold : LIGHT_COLORS.textMuted,
                          marginLeft: 6,
                        }}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ padding: SPACING.xl }}>
                  {activeTab === 'info' && (
                    <View>
                      <View style={{ marginBottom: SPACING.lg }}>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.sm,
                            color: LIGHT_COLORS.textMuted,
                            marginBottom: 4,
                          }}
                        >
                          Phone
                        </Text>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.md,
                            color: LIGHT_COLORS.textPrimary,
                          }}
                        >
                          {selectedClient.phone}
                        </Text>
                      </View>

                      {selectedClient.email && (
                        <View style={{ marginBottom: SPACING.lg }}>
                          <Text
                            style={{
                              fontSize: TYPOGRAPHY.sm,
                              color: LIGHT_COLORS.textMuted,
                              marginBottom: 4,
                            }}
                          >
                            Email
                          </Text>
                          <Text
                            style={{
                              fontSize: TYPOGRAPHY.md,
                              color: LIGHT_COLORS.textPrimary,
                            }}
                          >
                            {selectedClient.email}
                          </Text>
                        </View>
                      )}

                      <View style={{ marginBottom: SPACING.lg }}>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.sm,
                            color: LIGHT_COLORS.textMuted,
                            marginBottom: 4,
                          }}
                        >
                          First Visit
                        </Text>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.md,
                            color: LIGHT_COLORS.textPrimary,
                          }}
                        >
                          {new Date(selectedClient.firstVisit).toLocaleDateString()}
                        </Text>
                      </View>

                      <View style={{ marginBottom: SPACING.lg }}>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.sm,
                            color: LIGHT_COLORS.textMuted,
                            marginBottom: 4,
                          }}
                        >
                          Last Visit
                        </Text>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.md,
                            color: LIGHT_COLORS.textPrimary,
                          }}
                        >
                          {formatDate(selectedClient.lastVisit)}
                        </Text>
                      </View>

                      <View>
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.sm,
                            color: LIGHT_COLORS.textMuted,
                            marginBottom: SPACING.sm,
                          }}
                        >
                          Preferred Services
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                          {selectedClient.preferredServices.map((service) => (
                            <View
                              key={service}
                              style={{
                                backgroundColor: LIGHT_COLORS.surfaceHighlight,
                                paddingHorizontal: SPACING.md,
                                paddingVertical: SPACING.sm,
                                borderRadius: RADIUS.sm,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: TYPOGRAPHY.sm,
                                  color: LIGHT_COLORS.textSecondary,
                                }}
                              >
                                {service}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}

                  {activeTab === 'notes' && (
                    <View>
                      <TouchableOpacity
                        onPress={() => setShowAddNoteModal(true)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: COLORS.gold,
                          paddingVertical: SPACING.md,
                          borderRadius: RADIUS.lg,
                          marginBottom: SPACING.lg,
                        }}
                      >
                        <Plus size={18} color={COLORS.charcoal} />
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.md,
                            fontWeight: TYPOGRAPHY.semibold,
                            color: COLORS.charcoal,
                            marginLeft: 8,
                          }}
                        >
                          Add Note
                        </Text>
                      </TouchableOpacity>

                      {selectedClient.notes.length > 0 ? (
                        selectedClient.notes.map(renderNoteItem)
                      ) : (
                        <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
                          <StickyNote size={40} color={LIGHT_COLORS.textMuted} />
                          <Text
                            style={{
                              fontSize: TYPOGRAPHY.md,
                              color: LIGHT_COLORS.textMuted,
                              marginTop: SPACING.md,
                            }}
                          >
                            No notes yet
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {activeTab === 'history' && (
                    <View>
                      {selectedClient.bookingHistory.length > 0 ? (
                        selectedClient.bookingHistory.map(renderBookingItem)
                      ) : (
                        <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
                          <History size={40} color={LIGHT_COLORS.textMuted} />
                          <Text
                            style={{
                              fontSize: TYPOGRAPHY.md,
                              color: LIGHT_COLORS.textMuted,
                              marginTop: SPACING.md,
                            }}
                          >
                            No booking history
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        )}
      </Modal>

      <Modal
        visible={showAddNoteModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddNoteModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: SPACING.xl,
          }}
        >
          <View
            style={{
              backgroundColor: LIGHT_COLORS.surface,
              borderRadius: RADIUS.xl,
              padding: SPACING.xl,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.lg,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.lg,
                  fontWeight: TYPOGRAPHY.semibold,
                  color: LIGHT_COLORS.textPrimary,
                }}
              >
                Add Note
              </Text>
              <TouchableOpacity onPress={() => setShowAddNoteModal(false)}>
                <X size={24} color={LIGHT_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={{
                backgroundColor: LIGHT_COLORS.surfaceHighlight,
                borderRadius: RADIUS.md,
                padding: SPACING.md,
                fontSize: TYPOGRAPHY.base,
                color: LIGHT_COLORS.textPrimary,
                minHeight: 120,
                textAlignVertical: 'top',
              }}
              placeholder="Write a note about this client..."
              placeholderTextColor={LIGHT_COLORS.textMuted}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
            />

            <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg }}>
              <TouchableOpacity
                onPress={() => setShowAddNoteModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: SPACING.md,
                  borderRadius: RADIUS.lg,
                  backgroundColor: LIGHT_COLORS.surfaceHighlight,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.md,
                    fontWeight: TYPOGRAPHY.semibold,
                    color: LIGHT_COLORS.textSecondary,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddNote}
                style={{
                  flex: 1,
                  paddingVertical: SPACING.md,
                  borderRadius: RADIUS.lg,
                  backgroundColor: COLORS.gold,
                  alignItems: 'center',
                  opacity: newNoteContent.trim() ? 1 : 0.5,
                }}
                disabled={!newNoteContent.trim()}
              >
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.md,
                    fontWeight: TYPOGRAPHY.semibold,
                    color: COLORS.charcoal,
                  }}
                >
                  Save Note
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
