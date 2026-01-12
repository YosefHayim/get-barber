import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text, Surface, Switch, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Sun,
  Moon,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

interface DaySchedule {
  day: string;
  shortName: string;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 'Sunday', shortName: 'Sun', isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Monday', shortName: 'Mon', isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Tuesday', shortName: 'Tue', isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Wednesday', shortName: 'Wed', isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Thursday', shortName: 'Thu', isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'Friday', shortName: 'Fri', isEnabled: true, startTime: '09:00', endTime: '14:00' },
  { day: 'Saturday', shortName: 'Sat', isEnabled: false, startTime: '00:00', endTime: '00:00' },
];

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
];

export default function WorkingHoursScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleToggleDay = (day: string) => {
    setSchedule(
      schedule.map((s) =>
        s.day === day ? { ...s, isEnabled: !s.isEnabled } : s
      )
    );
  };

  const handleTimeChange = (
    day: string,
    type: 'startTime' | 'endTime',
    value: string
  ) => {
    setSchedule(
      schedule.map((s) =>
        s.day === day ? { ...s, [type]: value } : s
      )
    );
  };

  const enabledDays = schedule.filter((s) => s.isEnabled);
  const totalHours = enabledDays.reduce((acc, day) => {
    const start = parseInt(day.startTime.split(':')[0]);
    const end = parseInt(day.endTime.split(':')[0]);
    return acc + (end - start);
  }, 0);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Working Hours',
          headerStyle: { backgroundColor: LIGHT_COLORS.background },
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
          <View style={styles.summaryIcon}>
            <Calendar size={28} color={COLORS.gold} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Weekly Schedule</Text>
            <Text style={styles.summaryText}>
              {enabledDays.length} days, ~{totalHours} hours per week
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Set Your Availability</Text>

        <View style={styles.scheduleCard}>
          {schedule.map((day, index) => (
            <View
              key={day.day}
              style={[
                styles.dayItem,
                index !== schedule.length - 1 && styles.dayItemBorder,
              ]}
            >
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <View
                    style={[
                      styles.dayBadge,
                      day.isEnabled && styles.dayBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayBadgeText,
                        day.isEnabled && styles.dayBadgeTextActive,
                      ]}
                    >
                      {day.shortName}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.dayName}>{day.day}</Text>
                    {day.isEnabled && (
                      <Text style={styles.dayHours}>
                        {day.startTime} - {day.endTime}
                      </Text>
                    )}
                    {!day.isEnabled && (
                      <Text style={styles.dayOff}>Day off</Text>
                    )}
                  </View>
                </View>
                <Switch
                  value={day.isEnabled}
                  onValueChange={() => handleToggleDay(day.day)}
                  color={COLORS.gold}
                />
              </View>

              {day.isEnabled && selectedDay === day.day && (
                <View style={styles.timeSelector}>
                  <View style={styles.timeGroup}>
                    <View style={styles.timeLabelRow}>
                      <Sun size={14} color={COLORS.gold} />
                      <Text style={styles.timeLabel}>Start Time</Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.timeOptions}
                    >
                      {TIME_OPTIONS.map((time) => (
                        <Pressable
                          key={`start-${time}`}
                          style={[
                            styles.timeOption,
                            day.startTime === time && styles.timeOptionActive,
                          ]}
                          onPress={() => handleTimeChange(day.day, 'startTime', time)}
                        >
                          <Text
                            style={[
                              styles.timeOptionText,
                              day.startTime === time && styles.timeOptionTextActive,
                            ]}
                          >
                            {time}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.timeGroup}>
                    <View style={styles.timeLabelRow}>
                      <Moon size={14} color={COLORS.gold} />
                      <Text style={styles.timeLabel}>End Time</Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.timeOptions}
                    >
                      {TIME_OPTIONS.map((time) => (
                        <Pressable
                          key={`end-${time}`}
                          style={[
                            styles.timeOption,
                            day.endTime === time && styles.timeOptionActive,
                          ]}
                          onPress={() => handleTimeChange(day.day, 'endTime', time)}
                        >
                          <Text
                            style={[
                              styles.timeOptionText,
                              day.endTime === time && styles.timeOptionTextActive,
                            ]}
                          >
                            {time}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}

              {day.isEnabled && (
                <Pressable
                  style={styles.editTimeButton}
                  onPress={() =>
                    setSelectedDay(selectedDay === day.day ? null : day.day)
                  }
                >
                  <Clock size={14} color={COLORS.gold} />
                  <Text style={styles.editTimeText}>
                    {selectedDay === day.day ? 'Hide Times' : 'Edit Times'}
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Shabbat Notice</Text>
          <Text style={styles.infoText}>
            Saturday (Shabbat) is disabled by default. You can enable it if you
            work on weekends.
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          buttonColor={COLORS.gold}
          textColor={COLORS.charcoal}
        >
          Save Schedule
        </Button>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
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
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textMuted,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  dayItem: {
    padding: SPACING.lg,
  },
  dayItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dayBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeActive: {
    backgroundColor: COLORS.goldMuted,
  },
  dayBadgeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textMuted,
  },
  dayBadgeTextActive: {
    color: COLORS.gold,
  },
  dayName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
  },
  dayHours: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gold,
    marginTop: SPACING.xxs,
  },
  dayOff: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: SPACING.xxs,
  },
  editTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  editTimeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.medium,
  },
  timeSelector: {
    marginTop: SPACING.lg,
    gap: SPACING.lg,
  },
  timeGroup: {
    gap: SPACING.sm,
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  timeOptions: {
    flexDirection: 'row',
  },
  timeOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  timeOptionActive: {
    backgroundColor: COLORS.gold,
  },
  timeOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
    fontWeight: TYPOGRAPHY.medium,
  },
  timeOptionTextActive: {
    color: COLORS.charcoal,
  },
  infoBox: {
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
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
  saveButton: {
    borderRadius: RADIUS.lg,
  },
  saveButtonContent: {
    height: 52,
  },
});
