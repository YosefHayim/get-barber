import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
        headerStyle: {
          backgroundColor: '#f6f6f8',
        },
        headerTintColor: '#0d181b',
        contentStyle: {
          backgroundColor: '#f6f6f8',
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="user-type" />
      <Stack.Screen name="customer/profile" />
      <Stack.Screen name="customer/location" />
      <Stack.Screen name="customer/preferences" />
      <Stack.Screen name="customer/notifications" />
      <Stack.Screen name="customer/complete" />
      <Stack.Screen name="barber/profile" />
      <Stack.Screen name="barber/background" />
      <Stack.Screen name="barber/services" />
      <Stack.Screen name="barber/schedule" />
      <Stack.Screen name="barber/portfolio" />
      <Stack.Screen name="barber/verification" />
      <Stack.Screen name="barber/complete" />
    </Stack>
  );
}
