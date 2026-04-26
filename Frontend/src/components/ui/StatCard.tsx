import { Box, HStack, Text, VStack } from 'native-base';
import { ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accentColor?: string;
  sublabel?: string;
}

export const StatCard = ({
  label,
  value,
  icon,
  accentColor = 'primary.500',
  sublabel,
}: StatCardProps) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const paddingX = isSmallScreen ? 3 : 4;
  const paddingY = isSmallScreen ? 2.5 : 3;
  const iconPadding = isSmallScreen ? 2 : 3;
  const fontSize = isSmallScreen ? 'xl' : '2xl';
  
  return (
    <Box
      borderRadius="lg"
      bg="card"
      px={paddingX}
      py={paddingY}
      borderWidth={1}
      borderColor="gray.200"
      shadow={2}
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack flex={1}>
          <Text color="gray.600" fontSize="xs" textTransform="uppercase">
            {label}
          </Text>
          <Text color="gray.900" fontSize={fontSize} fontWeight="700" mt={1}>
            {value}
          </Text>
          {sublabel ? (
            <Text mt={1} color="gray.500" fontSize="xs">
              {sublabel}
            </Text>
          ) : null}
        </VStack>
        {icon ? (
          <Box
            bg={`${accentColor}:alpha.20`}
            borderRadius="full"
            p={iconPadding}
            alignItems="center"
            justifyContent="center"
          >
            {icon}
          </Box>
        ) : null}
      </HStack>
    </Box>
  );
};

