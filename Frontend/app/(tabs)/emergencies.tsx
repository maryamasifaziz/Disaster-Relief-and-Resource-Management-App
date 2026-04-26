import { useCallback, useState } from 'react';
import { Actionsheet, Box, Button, HStack, Input, Select, Text, VStack, useDisclose } from 'native-base';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Screen } from '@/src/components/ui/Screen';
import { SectionHeading } from '@/src/components/ui/SectionHeading';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { EmptyState, LoadingState } from '@/src/components/ui/Feedback';
import { emergencyService } from '@/src/api/services';
import { EmergencyReport } from '@/src/types/api';
import { useAuth } from '@/src/hooks/useAuth';
import { canViewAllEmergencies, deriveRoleFlags } from '@/src/utils/roles';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved', 'Cancelled'];
const DISASTER_TYPES = ['Flood', 'Earthquake', 'Fire', 'Cyclone', 'Landslide', 'Other'];

const ReportSchema = Yup.object().shape({
  disaster_type: Yup.string().required('Select a disaster type'),
  location_desc: Yup.string().required('Provide a location description'),
});

export default function EmergenciesScreen() {
  const { user } = useAuth();
  const roleFlags = deriveRoleFlags(user?.roles ?? []);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclose();

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = canViewAllEmergencies(user.roles)
        ? await emergencyService.listAll()
        : await emergencyService.listMine();
      setReports(response.data.reports ?? []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to load reports',
        text2: error?.message || 'Please verify the backend server.',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const handleStatusChange = async (report: EmergencyReport, status: string) => {
    try {
      await emergencyService.updateStatus(report.report_id, status);
      Toast.show({
        type: 'success',
        text1: 'Status updated',
        text2: `${report.disaster_type} report is now ${status}`,
      });
      fetchReports();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to update status',
        text2: error?.message || 'Please try again',
      });
    }
  };

  if (loading) {
    return <LoadingState message="Loading emergency reports..." />;
  }

  return (
    <Screen>
      <SectionHeading
        title="Emergency reports"
        actionLabel={roleFlags.isCitizen ? 'New report' : undefined}
        onActionPress={roleFlags.isCitizen ? onOpen : undefined}
      />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports found"
          description={
            roleFlags.isCitizen
              ? 'Tap New report to submit the first incident.'
              : 'Reports submitted by citizens will appear here.'
          }
        />
      ) : (
        <VStack space={4}>
          {reports.map((report) => (
            <Box key={report.report_id} bg="card" px={4} py={4} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow={1}>
              <HStack justifyContent="space-between" alignItems="center" mb={2}>
                <VStack flex={1} pr={3}>
                  <Text color="gray.900" fontWeight="700">
                    {report.disaster_type}
                  </Text>
                  <Text color="gray.600">{report.location_desc}</Text>
                  {canViewAllEmergencies(user?.roles) && (
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      Reported by {report.reporter_name || 'Citizen'}
                    </Text>
                  )}
                </VStack>
                <StatusBadge status={report.status} />
              </HStack>

              {(roleFlags.isRescueWorker || roleFlags.isGovernment) ? (
              <Select
                selectedValue={report.status}
                onValueChange={(value) => handleStatusChange(report, value)}
                mt={3}
              >
                {STATUS_OPTIONS.map((status) => (
                  <Select.Item label={status} value={status} key={status} />
                ))}
              </Select>
            ) : null}
            </Box>
          ))}
        </VStack>
      )}

      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content bg="white">
          <Text fontSize="lg" fontWeight="700" color="gray.900" mb={4}>
            Submit a new emergency
          </Text>
          <Formik
            initialValues={{
              disaster_type: '',
              location_desc: '',
              latitude: '',
              longitude: '',
            }}
            validationSchema={ReportSchema}
            onSubmit={async (values, { resetForm }) => {
              setSubmitting(true);
              try {
                await emergencyService.createReport({
                  disaster_type: values.disaster_type,
                  location_desc: values.location_desc,
                  latitude: values.latitude ? Number(values.latitude) : undefined,
                  longitude: values.longitude ? Number(values.longitude) : undefined,
                });
                Toast.show({
                  type: 'success',
                  text1: 'Report submitted',
                  text2: 'Rescue teams have been notified.',
                });
                resetForm();
                onClose();
                fetchReports();
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Submission failed',
                  text2: error?.message || 'Please try again.',
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <VStack space={4} w="full" px={4}>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Disaster type
                  </Text>
                  <Select
                    selectedValue={values.disaster_type}
                    onValueChange={handleChange('disaster_type')}
                    placeholder="Select type"
                  >
                    {DISASTER_TYPES.map((type) => (
                      <Select.Item key={type} label={type} value={type} />
                    ))}
                  </Select>
                  {touched.disaster_type && errors.disaster_type ? (
                    <Text color="error.400" mt={1}>
                      {errors.disaster_type}
                    </Text>
                  ) : null}
                </Box>

                <Box>
                  <Text color="gray.400" mb={1}>
                    Location details
                  </Text>
                  <Input
                    placeholder="District, street, nearby landmark"
                    value={values.location_desc}
                    onChangeText={handleChange('location_desc')}
                    onBlur={handleBlur('location_desc')}
                    multiline
                    textAlignVertical="top"
                  />
                  {touched.location_desc && errors.location_desc ? (
                    <Text color="error.400" mt={1}>
                      {errors.location_desc}
                    </Text>
                  ) : null}
                </Box>

                <HStack space={3}>
                  <Box flex={1}>
                    <Text color="gray.400" mb={1}>
                      Latitude
                    </Text>
                    <Input
                      placeholder="24.8607"
                      keyboardType="numeric"
                      value={values.latitude}
                      onChangeText={handleChange('latitude')}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text color="gray.400" mb={1}>
                      Longitude
                    </Text>
                    <Input
                      placeholder="67.0011"
                      keyboardType="numeric"
                      value={values.longitude}
                      onChangeText={handleChange('longitude')}
                    />
                  </Box>
                </HStack>

                <Button mt={2} onPress={() => handleSubmit()} isLoading={submitting}>
                  Submit report
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

