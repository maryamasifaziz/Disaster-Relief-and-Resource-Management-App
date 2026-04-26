import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { NativeBaseProvider } from 'native-base';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/context/AuthContext';
import { theme } from '@/src/theme';
import { LoadingState } from '@/src/components/ui/Feedback';
import { useAuth } from '@/src/hooks/useAuth';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

const BootstrapBoundary = ({ children }: { children: React.ReactNode }) => {
  const { isBootstrapping } = useAuth();

  useEffect(() => {
    // This ensures the splash screen stays visible until auth state loads
  }, [isBootstrapping]);

  if (isBootstrapping) {
    return <LoadingState message="Preparing your workspace..." />;
  }

  return children;
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NativeBaseProvider theme={theme}>
          <AuthProvider>
            <BootstrapBoundary>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ presentation: 'card' }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: 'modal', title: 'Quick Action' }}
                />
              </Stack>
            </BootstrapBoundary>
          </AuthProvider>
          <StatusBar style="dark" />
          <Toast />
        </NativeBaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
