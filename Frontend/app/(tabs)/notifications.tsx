import { useCallback, useState } from 'react';
import { Actionsheet, Box, Button, HStack, Icon, Input, Text, VStack, useDisclose } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { Screen } from '@/src/components/ui/Screen';
import { SectionHeading } from '@/src/components/ui/SectionHeading';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { EmptyState, LoadingState } from '@/src/components/ui/Feedback';
import { notificationService } from '@/src/api/services';
import { NotificationItem } from '@/src/types/api';
import { useAuth } from '@/src/hooks/useAuth';
import { deriveRoleFlags } from '@/src/utils/roles';

const NotificationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  message: Yup.string().required('Message is required'),
});

export default function NotificationsScreen() {
  const { user } = useAuth();
  const roleFlags = deriveRoleFlags(user?.roles ?? []);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclose();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = roleFlags.isGovernment
        ? await notificationService.all()
        : await notificationService.active();
      setNotifications(response.data.notifications ?? []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to load notifications',
        text2: error?.message || 'Please verify the backend server.',
      });
    } finally {
      setLoading(false);
    }
  }, [user, roleFlags.isGovernment]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleDelete = async (notificationId: number) => {
    try {
      await notificationService.remove(notificationId);
      Toast.show({
        type: 'success',
        text1: 'Notification deleted',
        text2: 'The notification has been deactivated.',
      });
      fetchNotifications();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to delete',
        text2: error?.message || 'Please try again.',
      });
    }
  };

  const handleToggleActive = async (notification: NotificationItem) => {
    try {
      await notificationService.update(notification.notification_id, {
        is_active: !notification.is_active,
      });
      Toast.show({
        type: 'success',
        text1: 'Notification updated',
        text2: `Notification is now ${!notification.is_active ? 'active' : 'inactive'}.`,
      });
      fetchNotifications();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Unable to update',
        text2: error?.message || 'Please try again.',
      });
    }
  };

  if (loading) {
    return <LoadingState message="Loading notifications..." />;
  }

  return (
    <Screen>
      <SectionHeading
        title={roleFlags.isGovernment ? 'Manage Notifications' : 'Active Notifications'}
        actionLabel={roleFlags.isGovernment ? 'New Notification' : undefined}
        onActionPress={roleFlags.isGovernment ? onOpen : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={
            roleFlags.isGovernment
              ? 'Tap New Notification to create the first alert.'
              : 'No active notifications at this time.'
          }
        />
      ) : (
        <VStack space={4}>
          {notifications.map((notification) => (
            <Box
              key={notification.notification_id}
              bg="card"
              px={4}
              py={4}
              borderRadius="lg"
              borderWidth={1}
              borderColor="gray.200" shadow={1}
            >
              <HStack justifyContent="space-between" alignItems="flex-start" mb={2}>
                <VStack flex={1} pr={3}>
                  <Text color="gray.900" fontWeight="700" fontSize="lg">
                    {notification.title}
                  </Text>
                  <Text color="gray.300" mt={2}>
                    {notification.message}
                  </Text>
                  <Text color="gray.500" fontSize="xs" mt={2}>
                    {new Date(notification.datetime_sent).toLocaleString()}
                    {notification.created_by_name && ` • By ${notification.created_by_name}`}
                  </Text>
                </VStack>
                <StatusBadge status={notification.is_active ? 'Active' : 'Inactive'} />
              </HStack>

              {roleFlags.isGovernment && (
                <HStack space={2} mt={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    flex={1}
                    onPress={() => handleToggleActive(notification)}
                  >
                    {notification.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    flex={1}
                    onPress={() => handleDelete(notification.notification_id)}
                  >
                    Delete
                  </Button>
                </HStack>
              )}
            </Box>
          ))}
        </VStack>
      )}

      {roleFlags.isGovernment && (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
          <Actionsheet.Content bg="white">
            <Text fontSize="lg" fontWeight="700" color="gray.900" mb={4}>
              Create New Notification
            </Text>
            <Formik
              initialValues={{
                title: '',
                message: '',
              }}
              validationSchema={NotificationSchema}
              onSubmit={async (values, { resetForm }) => {
                setSubmitting(true);
                try {
                  await notificationService.create({
                    title: values.title,
                    message: values.message,
                  });
                  Toast.show({
                    type: 'success',
                    text1: 'Notification created',
                    text2: 'All users will see this notification.',
                  });
                  resetForm();
                  onClose();
                  fetchNotifications();
                } catch (error: any) {
                  Toast.show({
                    type: 'error',
                    text1: 'Creation failed',
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
                      Title
                    </Text>
                    <Input
                      placeholder="e.g., Emergency Alert"
                      value={values.title}
                      onChangeText={handleChange('title')}
                      onBlur={handleBlur('title')}
                    />
                    {touched.title && errors.title ? (
                      <Text color="error.400" mt={1} fontSize="xs">
                        {errors.title}
                      </Text>
                    ) : null}
                  </Box>

                  <Box>
                    <Text color="gray.400" mb={1}>
                      Message
                    </Text>
                    <Input
                      placeholder="Enter notification message..."
                      value={values.message}
                      onChangeText={handleChange('message')}
                      onBlur={handleBlur('message')}
                      multiline
                      textAlignVertical="top"
                      numberOfLines={4}
                    />
                    {touched.message && errors.message ? (
                      <Text color="error.400" mt={1} fontSize="xs">
                        {errors.message}
                      </Text>
                    ) : null}
                  </Box>

                  <Button mt={2} onPress={() => handleSubmit()} isLoading={submitting}>
                    Create Notification
                  </Button>
                  <Button variant="ghost" onPress={onClose}>
                    Cancel
                  </Button>
                </VStack>
              )}
            </Formik>
          </Actionsheet.Content>
        </Actionsheet>
      )}
    </Screen>
  );
}

