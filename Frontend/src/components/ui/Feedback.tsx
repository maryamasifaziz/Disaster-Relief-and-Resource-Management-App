import { Center, Spinner, Text, VStack } from 'native-base';
import { ReactNode } from 'react';

export const LoadingState = ({ message = 'Loading...' }: { message?: string }) => (
  <Center py={12}>
    <Spinner size="lg" color="primary.500" />
    <Text mt={3} color="gray.600">
      {message}
    </Text>
  </Center>
);

export const EmptyState = ({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) => (
  <Center py={10} px={4}>
    <VStack alignItems="center" space={2}>
      {icon}
      <Text fontSize="md" color="gray.700" fontWeight="600">
        {title}
      </Text>
      {description ? (
        <Text textAlign="center" color="gray.500">
          {description}
        </Text>
      ) : null}
    </VStack>
  </Center>
);

