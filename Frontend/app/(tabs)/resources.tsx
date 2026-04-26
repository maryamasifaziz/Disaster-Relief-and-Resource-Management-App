import { useCallback, useState } from 'react';
import {
  Actionsheet,
  Box,
  Button,
  HStack,
  Input,
  Select,
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
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { EmptyState, LoadingState } from '@/src/components/ui/Feedback';
import { resourceService, shelterService } from '@/src/api/services';
import { Resource, ResourceDistribution, Shelter } from '@/src/types/api';
import { useAuth } from '@/src/hooks/useAuth';
import { canManageResources } from '@/src/utils/roles';

const ResourceSchema = Yup.object().shape({
  resource_type: Yup.string().required('Resource type is required'),
  resource_quantity: Yup.number().min(1).required('Quantity is required'),
});

const DistributionSchema = Yup.object().shape({
  resource_id: Yup.number().required('Select a resource'),
  shelter_id: Yup.number().required('Select a shelter'),
  quantity_distributed: Yup.number().min(1).required('Quantity is required'),
});

export default function ResourcesScreen() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [distributions, setDistributions] = useState<ResourceDistribution[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const createResourceSheet = useDisclose();
  const distributeSheet = useDisclose();

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const [resourcesRes, distRes, sheltersRes] = await Promise.all([
        resourceService.list(),
        resourceService.distributions(),
        shelterService.available(),
      ]);
      setResources(resourcesRes.data.resources ?? []);
      setDistributions(distRes.data.distributions ?? []);
      setShelters(sheltersRes.data.shelters ?? []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to load resources',
        text2: error?.message || 'Please check the API server.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadResources();
    }, [loadResources])
  );

  if (loading) {
    return <LoadingState message="Fetching resource inventory..." />;
  }

  return (
    <Screen>
      <SectionHeading
        title="Resource inventory"
        actionLabel={canManageResources(user?.roles) ? 'Add resource' : undefined}
        onActionPress={canManageResources(user?.roles) ? createResourceSheet.onOpen : undefined}
      />

      {resources.length === 0 ? (
        <EmptyState title="No resources yet" description="NGO donations will appear here." />
      ) : (
        <VStack space={4}>
          {resources.map((resource) => (
            <Box key={resource.resource_id} bg="card" px={4} py={4} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow={1}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1} pr={3}>
                  <Text color="gray.900" fontWeight="700">
                    {resource.resource_type}
                  </Text>
                  <Text color="gray.600">{resource.resource_desc || 'No description provided'}</Text>
                  <Text color="gray.500" fontSize="xs" mt={1}>
                    Qty: {resource.resource_quantity}
                  </Text>
                </VStack>
                <StatusBadge status={resource.resource_availability_status} />
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      <SectionHeading
        title="Distribution queue"
        actionLabel={canManageResources(user?.roles) ? 'Distribute' : undefined}
        onActionPress={canManageResources(user?.roles) ? distributeSheet.onOpen : undefined}
      />

      {distributions.length === 0 ? (
        <EmptyState title="No distributions" description="Assign resources to shelters to see logs." />
      ) : (
        <VStack space={4}>
          {distributions.slice(0, 6).map((distribution) => (
            <Box key={distribution.distribution_id} bg="card" px={4} py={4} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow={1}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1} pr={3}>
                  <Text color="gray.900" fontWeight="700">
                    {distribution.resource_type}
                  </Text>
                  <Text color="gray.400">
                    {distribution.quantity_distributed} units → {distribution.shelter_name}
                  </Text>
                  <Text color="gray.500" fontSize="xs" mt={1}>
                    Requested {new Date(distribution.requested_at || distribution.date_distributed).toLocaleString()}
                  </Text>
                </VStack>
                <StatusBadge status={distribution.status} />
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      <Actionsheet isOpen={createResourceSheet.isOpen} onClose={createResourceSheet.onClose}>
        <Actionsheet.Content bg="white">
          <Text fontSize="lg" fontWeight="700" color="gray.900" mb={4}>
            Register new resource
          </Text>
          <Formik
            initialValues={{
              resource_type: '',
              resource_quantity: '',
              resource_desc: '',
              distribution_location_address: '',
              resource_expiry_date: '',
            }}
            validationSchema={ResourceSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                await resourceService.create({
                  resource_type: values.resource_type,
                  resource_quantity: Number(values.resource_quantity),
                  resource_desc: values.resource_desc || undefined,
                  resource_expiry_date: values.resource_expiry_date || undefined,
                  distribution_location_address: values.distribution_location_address || undefined,
                });
                Toast.show({
                  type: 'success',
                  text1: 'Resource added',
                });
                resetForm();
                createResourceSheet.onClose();
                loadResources();
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Unable to save resource',
                  text2: error?.message || 'Please try again.',
                });
              }
            }}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <VStack space={3} w="full" px={4}>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Resource type
                  </Text>
                  <Input value={values.resource_type} onChangeText={handleChange('resource_type')} />
                  {touched.resource_type && errors.resource_type ? (
                    <Text color="error.400" mt={1}>
                      {errors.resource_type}
                    </Text>
                  ) : null}
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Quantity
                  </Text>
                  <Input
                    value={values.resource_quantity}
                    onChangeText={handleChange('resource_quantity')}
                    keyboardType="numeric"
                  />
                  {touched.resource_quantity && errors.resource_quantity ? (
                    <Text color="error.400" mt={1}>
                      {errors.resource_quantity}
                    </Text>
                  ) : null}
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Description
                  </Text>
                  <Input value={values.resource_desc} onChangeText={handleChange('resource_desc')} />
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Distribution address
                  </Text>
                  <Input
                    value={values.distribution_location_address}
                    onChangeText={handleChange('distribution_location_address')}
                  />
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Expiry (optional)
                  </Text>
                  <Input
                    value={values.resource_expiry_date}
                    onChangeText={handleChange('resource_expiry_date')}
                    placeholder="2025-12-31"
                  />
                </Box>
                <Button mt={2} onPress={() => handleSubmit()}>
                  Save resource
                </Button>
                <Button variant="ghost" onPress={createResourceSheet.onClose}>
                  Cancel
                </Button>
              </VStack>
            )}
          </Formik>
        </Actionsheet.Content>
      </Actionsheet>

      <Actionsheet isOpen={distributeSheet.isOpen} onClose={distributeSheet.onClose}>
        <Actionsheet.Content bg="white">
          <Text fontSize="lg" fontWeight="700" color="gray.900" mb={4}>
            Distribute resources
          </Text>
          <Formik
            initialValues={{
              resource_id: '',
              shelter_id: '',
              quantity_distributed: '',
              assigned_to: '',
              remarks: '',
            }}
            validationSchema={DistributionSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                await resourceService.createDistribution({
                  resource_id: Number(values.resource_id),
                  shelter_id: Number(values.shelter_id),
                  quantity_distributed: Number(values.quantity_distributed),
                  assigned_to: values.assigned_to ? Number(values.assigned_to) : undefined,
                  remarks: values.remarks || undefined,
                });
                Toast.show({
                  type: 'success',
                  text1: 'Distribution created',
                });
                resetForm();
                distributeSheet.onClose();
                loadResources();
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Unable to distribute',
                  text2: error?.message || 'Please try again.',
                });
              }
            }}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <VStack space={3} w="full" px={4}>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Resource
                  </Text>
                  <Select
                    selectedValue={values.resource_id}
                    onValueChange={handleChange('resource_id')}
                    placeholder="Select resource"
                  >
                    {resources.map((resource) => (
                      <Select.Item
                        key={resource.resource_id}
                        label={`${resource.resource_type} (${resource.resource_quantity})`}
                        value={String(resource.resource_id)}
                      />
                    ))}
                  </Select>
                  {touched.resource_id && errors.resource_id ? (
                    <Text color="error.400" mt={1}>
                      {errors.resource_id}
                    </Text>
                  ) : null}
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Shelter
                  </Text>
                  <Select
                    selectedValue={values.shelter_id}
                    onValueChange={handleChange('shelter_id')}
                    placeholder="Select shelter"
                  >
                    {shelters.map((shelter) => (
                      <Select.Item
                        key={shelter.shelter_id}
                        label={`${shelter.shelter_name} (${shelter.capacity - shelter.current_occupancy} slots)`}
                        value={String(shelter.shelter_id)}
                      />
                    ))}
                  </Select>
                  {touched.shelter_id && errors.shelter_id ? (
                    <Text color="error.400" mt={1}>
                      {errors.shelter_id}
                    </Text>
                  ) : null}
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Quantity
                  </Text>
                  <Input
                    value={values.quantity_distributed}
                    onChangeText={handleChange('quantity_distributed')}
                    keyboardType="numeric"
                  />
                  {touched.quantity_distributed && errors.quantity_distributed ? (
                    <Text color="error.400" mt={1}>
                      {errors.quantity_distributed}
                    </Text>
                  ) : null}
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Assign to (optional user ID)
                  </Text>
                  <Input value={values.assigned_to} onChangeText={handleChange('assigned_to')} keyboardType="numeric" />
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Remarks
                  </Text>
                  <Input value={values.remarks} onChangeText={handleChange('remarks')} />
                </Box>
                <Button mt={2} onPress={() => handleSubmit()}>
                  Dispatch
                </Button>
                <Button variant="ghost" onPress={distributeSheet.onClose}>
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

