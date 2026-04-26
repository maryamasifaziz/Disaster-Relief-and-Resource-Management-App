import { useCallback, useState } from 'react';
import {
  Actionsheet,
  Box,
  Button,
  HStack,
  Input,
  Progress,
  Text,
  VStack,
  useDisclose,
} from 'native-base';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Screen } from '@/src/components/ui/Screen';
import { SectionHeading } from '@/src/components/ui/SectionHeading';
import { EmptyState, LoadingState } from '@/src/components/ui/Feedback';
import { shelterService } from '@/src/api/services';
import { Shelter } from '@/src/types/api';
import { useAuth } from '@/src/hooks/useAuth';
import { canManageShelters } from '@/src/utils/roles';

const ShelterSchema = Yup.object().shape({
  shelter_name: Yup.string().required('Name is required'),
  capacity: Yup.number().min(1).required('Capacity is required'),
});

export default function SheltersScreen() {
  const { user } = useAuth();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingShelterId, setUpdatingShelterId] = useState<number | null>(null);
  const [occupancyInputs, setOccupancyInputs] = useState<{[key: number]: string}>({});
  const { isOpen, onOpen, onClose } = useDisclose();

  const loadShelters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await shelterService.list();
      setShelters(response.data.shelters ?? []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to load shelters',
        text2: error?.message || 'Check backend connectivity.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadShelters();
    }, [loadShelters])
  );

  const handleUpdateOccupancy = async (shelterId: number, current_occupancy: number) => {
    try {
      setUpdatingShelterId(shelterId);
      await shelterService.updateOccupancy(shelterId, current_occupancy);
      Toast.show({
        type: 'success',
        text1: 'Occupancy updated',
      });
      loadShelters();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update failed',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setUpdatingShelterId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading shelter data..." />;
  }

  return (
    <Screen>
      <SectionHeading
        title="Shelter network"
        actionLabel={canManageShelters(user?.roles) ? 'Add shelter' : undefined}
        onActionPress={canManageShelters(user?.roles) ? onOpen : undefined}
      />

      {shelters.length === 0 ? (
        <EmptyState title="No shelters configured" description="Registered shelters will show up here." />
      ) : (
        <VStack space={4}>
          {shelters.map((shelter) => {
            const utilization = Math.round((shelter.current_occupancy / shelter.capacity) * 100);
            return (
              <Box key={shelter.shelter_id} bg="card" px={4} py={4} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow={1}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1} pr={3}>
                    <Text color="gray.900" fontWeight="700">
                      {shelter.shelter_name}
                    </Text>
                    <Text color="gray.600">
                      {shelter.current_occupancy}/{shelter.capacity} occupants
                    </Text>
                    {shelter.street_name ? (
                      <Text color="gray.500" fontSize="xs" mt={1}>
                        {shelter.street_name}
                      </Text>
                    ) : null}
                  </VStack>
                  <Text color={utilization >= 90 ? 'error.500' : 'emerald.600'} fontWeight="600">
                    {utilization}%
                  </Text>
                </HStack>
                <Progress value={utilization} mt={4} colorScheme="primary" />

                {canManageShelters(user?.roles) ? (
                <HStack space={3} mt={4}>
                  <Input
                    flex={1}
                    keyboardType="numeric"
                    placeholder="Update occupancy"
                    value={occupancyInputs[shelter.shelter_id] || ''}
                    onChangeText={(text) => setOccupancyInputs(prev => ({ ...prev, [shelter.shelter_id]: text }))}
                  />
                  <Button
                    isLoading={updatingShelterId === shelter.shelter_id}
                    onPress={() => {
                      const value = Number(occupancyInputs[shelter.shelter_id]);
                      if (!Number.isNaN(value)) {
                        handleUpdateOccupancy(shelter.shelter_id, value);
                      }
                    }}
                    variant="outline"
                  >
                    Update
                  </Button>
                </HStack>
              ) : null}
              </Box>
            );
          })}
        </VStack>
      )}

      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content bg="white">
          <Text fontSize="lg" fontWeight="700" color="gray.900" mb={4}>
            Add new shelter
          </Text>
          <Formik
            initialValues={{
              shelter_name: '',
              managed_by: '',
              capacity: '',
              street_no: '',
              street_name: '',
              shelter_contact: '',
            }}
            validationSchema={ShelterSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                await shelterService.create({
                  shelter_name: values.shelter_name,
                  managed_by: values.managed_by || undefined,
                  capacity: Number(values.capacity),
                  street_no: values.street_no || undefined,
                  street_name: values.street_name || undefined,
                  shelter_contact: values.shelter_contact || undefined,
                });
                Toast.show({
                  type: 'success',
                  text1: 'Shelter added',
                });
                resetForm();
                onClose();
                loadShelters();
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Unable to create shelter',
                  text2: error?.message || 'Please try again.',
                });
              }
            }}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <VStack space={3} w="full" px={4}>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Shelter name
                  </Text>
                  <Input value={values.shelter_name} onChangeText={handleChange('shelter_name')} />
                  {touched.shelter_name && errors.shelter_name ? (
                    <Text color="error.400" mt={1}>
                      {errors.shelter_name}
                    </Text>
                  ) : null}
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Capacity
                  </Text>
                  <Input
                    value={values.capacity}
                    onChangeText={handleChange('capacity')}
                    keyboardType="numeric"
                  />
                  {touched.capacity && errors.capacity ? (
                    <Text color="error.400" mt={1}>
                      {errors.capacity}
                    </Text>
                  ) : null}
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Managed by
                  </Text>
                  <Input value={values.managed_by} onChangeText={handleChange('managed_by')} />
                </Box>
                <HStack space={3}>
                  <Box flex={1}>
                    <Text color="gray.400" mb={1}>
                      Street #
                    </Text>
                    <Input value={values.street_no} onChangeText={handleChange('street_no')} />
                  </Box>
                  <Box flex={2}>
                    <Text color="gray.400" mb={1}>
                      Street name
                    </Text>
                    <Input value={values.street_name} onChangeText={handleChange('street_name')} />
                  </Box>
                </HStack>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Contact
                  </Text>
                  <Input
                    keyboardType="phone-pad"
                    value={values.shelter_contact}
                    onChangeText={handleChange('shelter_contact')}
                  />
                </Box>
                <Button mt={2} onPress={() => handleSubmit()}>
                  Save shelter
                </Button>
                <Button variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
              </VStack>
            )}
          </Formik>
        </Actionsheet.Content>
      </Actionsheet>
    </Screen>
  );
}

