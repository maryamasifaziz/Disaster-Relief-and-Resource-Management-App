import { HStack, Pressable, Text } from 'native-base';
import { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  rightElement?: ReactNode;
}

export const SectionHeading = ({
  title,
  actionLabel,
  onActionPress,
  rightElement,
}: SectionHeadingProps) => (
  <HStack justifyContent="space-between" alignItems="center" mb={2} mt={6}>
    <Text fontSize="lg" fontWeight="700" color="gray.900">
      {title}
    </Text>
    {rightElement
      ? rightElement
      : actionLabel && onActionPress
        ? (
        <Pressable onPress={onActionPress}>
          <Text color="primary.600" fontWeight="600">
            {actionLabel}
          </Text>
        </Pressable>
          )
        : null}
  </HStack>
);

