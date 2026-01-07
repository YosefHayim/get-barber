import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ShabbatOverlay } from '@/features/shabbat';
import { ToastProvider } from './ToastProvider';
import { GluestackUIProvider } from '../../components/ui/gluestack-ui-provider';

interface AppProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3B82F6',
    primaryContainer: '#DBEAFE',
    secondary: '#8B5CF6',
    secondaryContainer: '#EDE9FE',
    tertiary: '#F59E0B',
    tertiaryContainer: '#FEF3C7',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1E40AF',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#5B21B6',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#92400E',
    onBackground: '#111827',
    onSurface: '#111827',
    onSurfaceVariant: '#6B7280',
    outline: '#D1D5DB',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#FFFFFF',
      level4: '#FFFFFF',
      level5: '#FFFFFF',
    },
  },
  roundness: 12,
};

export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GluestackUIProvider mode="light">
          <QueryClientProvider client={queryClient}>
            <PaperProvider theme={theme}>
              <BottomSheetModalProvider>
                <AuthProvider>
                  <ToastProvider>
                    <ShabbatOverlay>
                      {children}
                    </ShabbatOverlay>
                  </ToastProvider>
                </AuthProvider>
              </BottomSheetModalProvider>
            </PaperProvider>
          </QueryClientProvider>
        </GluestackUIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
