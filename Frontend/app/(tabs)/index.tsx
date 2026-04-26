import { useCallback, useMemo, useState } from 'react';
import { Box, FlatList, HStack, Icon, Text, VStack } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';

import { Screen } from '@/src/components/ui/Screen';
import { StatCard } from '@/src/components/ui/StatCard';
import { SectionHeading } from '@/src/components/ui/SectionHeading';
import { EmptyState, LoadingState } from '@/src/components/ui/Feedback';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { useAuth } from '@/src/hooks/useAuth';
import { deriveRoleFlags } from '@/src/utils/roles';
import {
  emergencyService,
  notificationService,
  resourceService,
  shelterService,
  taskService,
} from '@/src/api/services';
import {
  EmergencyReport,
  NotificationItem,
  Resource,
  Shelter,
  RescueTask,
} from '@/src/types/api';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const roleFlags = deriveRoleFlags(user?.roles ?? []);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [tasks, setTasks] = useState<RescueTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Responsive columns: 1 for small screens, 2 for larger
  const numColumns = width < 400 ? 1 : 2;

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const taskRequest = roleFlags.isGovernment
        ? taskService.listAll()
        : roleFlags.isRescueWorker
          ? taskService.listMine()
          : null;

      const [notificationsRes, sheltersRes, resourcesRes, emergencyRes] = await Promise.all([
        notificationService.active(),
        shelterService.available(),
        resourceService.list(),
        roleFlags.isCitizen ? emergencyService.listMine() : emergencyService.listAll(),
      ]);

      const tasksRes = taskRequest ? await taskRequest : null;

      setNotifications(notificationsRes.data.notifications ?? []);
      setShelters(sheltersRes.data.shelters ?? []);
      setResources(resourcesRes.data.resources ?? []);
      setReports(emergencyRes.data.reports ?? []);
      setTasks(tasksRes?.data?.tasks ?? []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to fetch data',
        text2: error?.message || 'Check your backend connection.',
      });
    } finally {
      setLoading(false);
    }
  }, [roleFlags.isCitizen, roleFlags.isGovernment, roleFlags.isRescueWorker, user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const stats = useMemo(() => {
    const pending = reports.filter((r) => r.status === 'Pending').length;
    const resolved = reports.filter((r) => r.status === 'Resolved').length;
    const availableShelters = shelters.filter((s) => s.current_occupancy < s.capacity).length;
    const availableResources = resources.filter(
      (r) => r.resource_availability_status === 'Available'
    ).length;

    return [
      {
        label: roleFlags.isCitizen ? 'My reports' : 'Active reports',
        value: reports.length,
        sublabel: `${pending} pending`,
        icon: <Icon as={Ionicons} name="warning" color="yellow.400" size="md" />,
      },
      {
        label: 'Shelters w/ space',
        value: availableShelters,
        sublabel: `${shelters.length} total`,
        icon: <Icon as={Ionicons} name="home" color="emerald.400" size="md" />,
      },
      {
        label: 'Available resources',
        value: availableResources,
        sublabel: `${resources.reduce((sum, r) => sum + (r.resource_quantity || 0), 0)} items`,
        icon: <Icon as={Ionicons} name="cube" color="cyan.400" size="md" />,
      },
      {
        label: roleFlags.isRescueWorker || roleFlags.isGovernment ? 'Rescue tasks' : 'Resolved',
        value:
          roleFlags.isRescueWorker || roleFlags.isGovernment
            ? tasks.length
            : resolved,
        sublabel:
          roleFlags.isRescueWorker || roleFlags.isGovernment
            ? `${tasks.filter((t) => t.task_status === 'In Progress').length} in progress`
            : `${resolved} resolved`,
        icon: <Icon as={Ionicons} name="briefcase" color="orange.400" size="md" />,
      },
    ];
  }, [reports, shelters, resources, tasks, roleFlags]);

  if (loading) {
    return <LoadingState message="Syncing disaster data..." />;
  }

  return (
    <Screen>
      <VStack space={4}>
        <Text color="gray.600" fontSize="sm">
          Welcome back,
        </Text>
        <Text color="gray.900" fontSize="2xl" fontWeight="700">
          {user?.name}
        </Text>
        <Text color="gray.500">
          Roles: {user?.roles?.join(', ') || 'Citizen'}
        </Text>
      </VStack>

      <SectionHeading title="Operations snapshot" />
      <FlatList
        data={stats}
        numColumns={numColumns}
        columnWrapperStyle={numColumns === 2 ? { gap: 12 } : undefined}
        contentContainerStyle={{ gap: 12 }}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <Box flex={1} minW={numColumns === 1 ? '100%' : '48%'}>
            <StatCard {...item} />
          </Box>
        )}
        scrollEnabled={false}
      />

      <SectionHeading title="Active notifications" />
      {notifications.length === 0 ? (
        <EmptyState title="No alerts right now" description="System alerts from government teams appear here." />
      ) : (
        <VStack space={4}>
          {notifications.slice(0, 3).map((notification) => (
            <Box key={notification.notification_id} bg="card" px={4} py={3} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow={1}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text color="gray.900" fontWeight="600">
                  {notification.title}
                </Text>
                <StatusBadge status="Active" />
              </HStack>
              <Text color="gray.700" mt={2}>
                {notification.message}
              </Text>
              <Text color="gray.500" fontSize="xs" mt={2}>
                {new Date(notification.datetime_sent).toLocaleString()}
              </Text>
            </Box>
          ))}
        </VStack>
      )}

      <SectionHeading
        title="Recent reports"
        actionLabel="View all"
        onActionPress={() => router.push('/(tabs)/emergencies')}
      />
      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description={
            roleFlags.isCitizen
              ? 'Submit the first emergency report from the Emergencies tab.'
              : 'Reports from citizens will appear here.'
          }
        />
      ) : (
        <VStack space={4}>
          {reports.slice(0, 4).map((report) => (
            <Box
              key={report.report_id}
              bg="card"
              px={4}
              py={3}
              borderRadius="lg"
              borderWidth={1}
              borderColor="gray.200"
              shadow={1}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1} pr={3}>
                  <Text color="gray.900" fontWeight="600">
                    {report.disaster_type}
                  </Text>
                  <Text color="gray.600">{report.location_desc}</Text>
                </VStack>
                <StatusBadge status={report.status} />
              </HStack>
              <Text color="gray.500" fontSize="xs" mt={2}>
                Reported {new Date(report.date_time).toLocaleString()}
              </Text>
            </Box>
          ))}
        </VStack>
      )}
    </Screen>
  );
}
