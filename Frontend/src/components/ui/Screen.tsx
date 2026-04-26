import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, useWindowDimensions } from 'react-native';
import { Box } from 'native-base';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  background?: string;
}

export const Screen = ({ children, scrollable = true, background = 'gray.50' }: ScreenProps) => {
  const { width } = useWindowDimensions();
  // Responsive padding: smaller on small screens
  const padding = width < 400 ? 12 : 16;
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {scrollable ? (
        <ScrollView contentContainerStyle={{ padding }} style={{ flex: 1 }}>
          {children}
        </ScrollView>
      ) : (
        <Box flex={1} bg={background} px={width < 400 ? 3 : 4} py={2}>
          {children}
        </Box>
      )}
    </SafeAreaView>
  );
};

