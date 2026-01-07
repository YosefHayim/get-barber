import React, { useEffect, useState } from 'react';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppProviders } from '@/providers';
import { useAppStore } from '@/stores/useAppStore';
import { useAuth } from '@/features/auth/context/AuthContext';
import 'react-native-reanimated';

import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider';
import '../global.css';

SplashScreen.preventAutoHideAsync();

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { user, isLoading } = useAuth();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;
    setIsReady(true);
  }, [navigationState?.key, isLoading]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inBarberTabsGroup = segments[0] === '(barber-tabs)';

    if (!user && !inAuthGroup && !inOnboardingGroup) {
      router.replace('/(auth)/login');
    } else if (user && !hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace('/(onboarding)');
    } else if (user && hasCompletedOnboarding && (inAuthGroup || inOnboardingGroup)) {
      router.replace('/(tabs)/home');
    }
  }, [user, hasCompletedOnboarding, segments, isReady]);

  return <>{children}</>;
}

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    
    <GluestackUIProvider mode="dark">
      <AppProviders>
      <StatusBar style="dark" />
      <NavigationGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(barber-tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          
          <Stack.Screen
            name="(modals)/barber-detail/[id]"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="(modals)/chat/[requestId]"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="(modals)/search"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="(modals)/loyalty"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="(modals)/notifications"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="(modals)/advertising"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="(modals)/analytics"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="(modals)/settings/notifications"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/settings/edit-profile"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/settings/saved-addresses"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/settings/payment-methods"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/settings/help-support"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          
          {/* Barber Settings Screens */}
          <Stack.Screen
            name="(modals)/barber-settings/services-pricing"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/barber-settings/working-hours"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/barber-settings/personal-info"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/barber-settings/payout-methods"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/barber-settings/notifications"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/barber-settings/app-settings"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/barber-settings/help-support"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="(modals)/barber-settings/bookings-history"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </NavigationGuard>
    </AppProviders>
    </GluestackUIProvider>
  
  );
}
