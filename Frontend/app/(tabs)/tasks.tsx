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
import { taskService } from '@/src/api/services';
import { RescueTask } from '@/src/types/api';
import { useAuth } from '@/src/hooks/useAuth';
import { canManageTasks, canUpdateTasks, deriveRoleFlags } from '@/src/utils/roles';

const TaskSchema = Yup.object().shape({
  report_id: Yup.number().required('Provide a report ID'),
  task_description: Yup.string().required('Description is required'),
});

export default function TasksScreen() {
  const { user } = useAuth();
  const roleFlags = deriveRoleFlags(user?.roles ?? []);
  const [tasks, setTasks] = useState<RescueTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const createTaskSheet = useDisclose();

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = roleFlags.isGovernment ? await taskService.listAll() : await taskService.listMine();
      setTasks(response.data.tasks ?? []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to load tasks',
        text2: error?.message || 'Please verify API connectivity.',
      });
    } finally {
      setLoading(false);
    }
  }, [roleFlags.isGovernment, user]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const handleStatusUpdate = async (taskId: number, status: string) => {
    try {
      setUpdatingTaskId(taskId);
      await taskService.updateStatus(taskId, status);
      Toast.show({
        type: 'success',
        text1: 'Task updated',
      });
      fetchTasks();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to update task',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (!roleFlags.isGovernment && !roleFlags.isRescueWorker) {
    return <EmptyState title="Restricted" description="Only rescue teams and government staff can view tasks." />;
  }

  if (loading) {
    return <LoadingState message="Fetching assigned tasks..." />;
  }

  return (
    <Screen>
      <SectionHeading
        title="Rescue tasks"
        actionLabel={canManageTasks(user?.roles) ? 'Create task' : undefined}
        onActionPress={canManageTasks(user?.roles) ? createTaskSheet.onOpen : undefined}
      />

      {tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Tasks linked to emergency reports show up here." />
      ) : (
        <VStack space={4}>
          {tasks.map((task) => (
            <Box key={task.task_id} bg="card" px={4} py={4} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow={1}>
              <Text color="gray.900" fontWeight="700">
                {task.task_description}
              </Text>
              <Text color="gray.400">
                {task.disaster_type} — {task.location_desc}
              </Text>
              <HStack justifyContent="space-between" alignItems="center" mt={3}>
                <VStack>
                  <Text color="gray.500" fontSize="xs">
                    Assigned worker: {task.assigned_worker_name || 'Unassigned'}
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    Report status: {task.report_status}
                  </Text>
                </VStack>
                <StatusBadge status={task.task_status} />
              </HStack>

              {canUpdateTasks(user?.roles) ? (
                <Select
                  mt={3}
                  selectedValue={task.task_status}
                  onValueChange={(value) => handleStatusUpdate(task.task_id, value)}
                  isDisabled={updatingTaskId === task.task_id}
                >
                  {['Assigned', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
                    <Select.Item label={status} value={status} key={status} />
                  ))}
                </Select>
              ) : null}
            </Box>
          ))}
        </VStack>
      )}

      <Actionsheet isOpen={createTaskSheet.isOpen} onClose={createTaskSheet.onClose}>
        <Actionsheet.Content bg="white">
          <Text fontSize="lg" fontWeight="700" color="gray.900" mb={4}>
            Create rescue task
          </Text>
          <Formik
            initialValues={{
              report_id: '',
              task_description: '',
              assigned_worker_id: '',
              remarks: '',
            }}
            validationSchema={TaskSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                await taskService.create({
                  report_id: Number(values.report_id),
                  task_description: values.task_description,
                  assigned_worker_id: values.assigned_worker_id ? Number(values.assigned_worker_id) : undefined,
                  remarks: values.remarks || undefined,
                });
                Toast.show({
                  type: 'success',
                  text1: 'Task created',
                });
                resetForm();
                createTaskSheet.onClose();
                fetchTasks();
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Unable to create task',
                  text2: error?.message || 'Please try again.',
                });
              }
            }}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <VStack space={3} w="full" px={4}>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Report ID
                  </Text>
                  <Input
                    value={values.report_id}
                    onChangeText={handleChange('report_id')}
                    keyboardType="numeric"
                  />
                  {touched.report_id && errors.report_id ? (
                    <Text color="error.400" mt={1}>
                      {errors.report_id}
                    </Text>
                  ) : null}
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Task description
                  </Text>
                  <Input
                    value={values.task_description}
                    onChangeText={handleChange('task_description')}
                    multiline
                  />
                  {touched.task_description && errors.task_description ? (
                    <Text color="error.400" mt={1}>
                      {errors.task_description}
                    </Text>
                  ) : null}
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Assign to (worker ID)
                  </Text>
                  <Input
                    value={values.assigned_worker_id}
                    onChangeText={handleChange('assigned_worker_id')}
                    keyboardType="numeric"
                  />
                </Box>
                <Box>
                  <Text color="gray.400" mb={1}>
                    Remarks
                  </Text>
                  <Input value={values.remarks} onChangeText={handleChange('remarks')} />
                </Box>
                <Button mt={2} onPress={() => handleSubmit()}>
                  Save task
                </Button>
                <Button variant="ghost" onPress={createTaskSheet.onClose}>
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

