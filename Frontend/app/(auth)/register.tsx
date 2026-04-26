import { Link } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Input,
  KeyboardAvoidingView,
  Select,
  Text,
  VStack,
} from 'native-base';
import { Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/src/hooks/useAuth';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
  role_id: Yup.number().required('Select a role'),
});

const ROLE_OPTIONS = [
  { label: 'Citizen', value: 1 },
  { label: 'Rescue Worker', value: 2 },
  { label: 'NGO', value: 3 },
  { label: 'Government', value: 4 },
];

export default function RegisterScreen() {
  const { register, isSubmitting } = useAuth();
  const { width } = useWindowDimensions();
  const paddingX = width < 400 ? 4 : 6;
  const paddingY = width < 400 ? 8 : 12;

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      px={paddingX}
      py={paddingY}
      bg="gray.50"
    >
      <VStack flex={1} justifyContent="center" space={8}>
        <VStack space={3}>
          <Heading color="Gray.900" size="xl">
            Create an operations account
          </Heading>
          <Text color="gray.400">
            Citizens can submit reports, while emergency staff can coordinate shelters, tasks, and
            resources in one workspace.
          </Text>
        </VStack>

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            address: '',
            phone_number: '',
            role_id: ROLE_OPTIONS[0].value,
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await register(values);
              Toast.show({
                type: 'success',
                text1: 'Account ready',
                text2: "You're now signed in.",
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Registration failed',
                text2: error?.message || 'Please verify the details',
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <VStack space={4}>
              <Box>
                <Text color="gray.600" mb={2}>
                  Full name
                </Text>
                <Input
                  placeholder="Jane Doe"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  InputLeftElement={
                    <Icon as={Ionicons} name="person-outline" color="gray.400" ml={3} />
                  }
                />
                {touched.name && errors.name ? (
                  <Text color="error.600" mt={1}>
                    {errors.name}
                  </Text>
                ) : null}
              </Box>

              <Box>
                <Text color="gray.600" mb={2}>
                  Email
                </Text>
                <Input
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  InputLeftElement={
                    <Icon as={Ionicons} name="mail-outline" color="gray.400" ml={3} />
                  }
                />
                {touched.email && errors.email ? (
                  <Text color="error.500" mt={1}>
                    {errors.email}
                  </Text>
                ) : null}
              </Box>

              <Box>
                <Text color="gray.600" mb={2}>
                  Password
                </Text>
                <Input
                  placeholder="••••••••"
                  secureTextEntry
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  InputLeftElement={
                    <Icon as={Ionicons} name="lock-closed-outline" color="gray.400" ml={3} />
                  }
                />
                {touched.password && errors.password ? (
                  <Text color="error.500" mt={1}>
                    {errors.password}
                  </Text>
                ) : null}
              </Box>

              <Box>
                <Text color="gray.600" mb={2}>
                  Phone (optional)
                </Text>
                <Input
                  placeholder="+92 300 0000000"
                  keyboardType="phone-pad"
                  value={values.phone_number}
                  onChangeText={handleChange('phone_number')}
                />
              </Box>

              <Box>
                <Text color="gray.600" mb={2}>
                  Address (optional)
                </Text>
                <Input
                  placeholder="House #, Street, City"
                  value={values.address}
                  onChangeText={handleChange('address')}
                />
              </Box>

              <Box>
                <Text color="gray.600" mb={2}>
                  Role
                </Text>
                <Select
                  selectedValue={String(values.role_id)}
                  onValueChange={(value) => setFieldValue('role_id', Number(value))}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <Select.Item label={role.label} value={String(role.value)} key={role.value} />
                  ))}
                </Select>
                {touched.role_id && errors.role_id ? (
                  <Text color="error.500" mt={1}>
                    {errors.role_id}
                  </Text>
                ) : null}
              </Box>

              <Button mt={4} onPress={() => handleSubmit()} isLoading={isSubmitting}>
                Create account
              </Button>
            </VStack>
          )}
        </Formik>

        <HStack justifyContent="center">
          <Text color="gray.400">Already have access?</Text>
          <Link href="/(auth)/login">
            <Text color="primary.600" ml={2} fontWeight="600">
              Sign in
            </Text>
          </Link>
        </HStack>
      </VStack>
    </KeyboardAvoidingView>
  );
}

