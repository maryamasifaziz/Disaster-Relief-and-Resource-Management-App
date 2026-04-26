import { Box, Button, HStack, Icon, Text, VStack } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { Screen } from '@/src/components/ui/Screen';
import { useAuth } from '@/src/hooks/useAuth';
import { buildUserInitials } from '@/src/utils/roles';

export default function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <VStack space={6}>
        <HStack space={4} alignItems="center">
          <Box
            bg="primary.500"
            width={16}
            height={16}
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="gray.900" fontSize="xl" fontWeight="700">
              {buildUserInitials(user)}
            </Text>
          </Box>
          <VStack>
            <Text color="gray.900" fontSize="2xl" fontWeight="700">
              {user.name}
            </Text>
            <Text color="gray.400">{user.email}</Text>
          </VStack>
        </HStack>

        <Box bg="card" px={4} py={4} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow={1}>
          <Text color="gray.400" mb={2}>
            Contact
          </Text>
          <Text color="gray.900">{user.phone_number || 'N/A'}</Text>
          <Text color="gray.400" mt={4} mb={2}>
            Address
          </Text>
          <Text color="gray.900">{user.address || 'N/A'}</Text>
        </Box>

        <Box bg="card" px={4} py={4} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow={1}>
          <Text color="gray.400" mb={2}>
            Roles
          </Text>
          {user.roles?.length ? (
            <HStack flexWrap="wrap" space={2}>
              {user.roles.map((role) => (
                <Box
                  key={role}
                  borderRadius="full"
                  px={3}
                  py={1}
                  bg="primary.900"
                  borderWidth={1}
                  borderColor="primary.700"
                  mr={2}
                  mb={2}
                >
                  <Text color="primary.100">{role}</Text>
                </Box>
              ))}
            </HStack>
          ) : (
            <Text color="gray.500">Citizen</Text>
          )}
        </Box>

        <VStack space={3}>
          <Button
            leftIcon={<Icon as={Ionicons} name="refresh" color="gray.900" />}
            onPress={async () => {
              try {
                await refreshProfile();
                Toast.show({
                  type: 'success',
                  text1: 'Profile refreshed',
                });
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Unable to refresh',
                  text2: error?.message || 'Please try again.',
                });
              }
            }}
          >
            Sync profile
          </Button>
          <Button
            variant="outline"
            colorScheme="error"
            leftIcon={<Icon as={Ionicons} name="exit-outline" color="gray.900" />}
            onPress={logout}
          >
            Sign out
          </Button>
        </VStack>
      </VStack>
    </Screen>
  );
}

