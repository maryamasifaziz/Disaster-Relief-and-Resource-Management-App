import { Link, Redirect } from 'expo-router';
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
  Text,
  VStack,
} from 'native-base';
import { Platform, useWindowDimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/hooks/useAuth';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

export default function LoginScreen() {
  const { login, isSubmitting, user } = useAuth();
  const { width } = useWindowDimensions();
  const paddingX = width < 400 ? 4 : 6;
  const paddingY = width < 400 ? 8 : 12;

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

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
          <Heading color="gray.900" size="xl">
            Disaster Management Hub
          </Heading>
          <Text color="gray.600">
            Connect with the national disaster relief command center, submit emergency reports,
            monitor shelters, resources, and rescue tasks in real time.
          </Text>
        </VStack>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await login(values);
              Toast.show({
                type: 'success',
                text1: 'Welcome back',
                text2: "You're now connected to the backend.",
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Login failed',
                text2: error?.message || 'Please verify your credentials',
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <VStack space={5}>
              <Box>
                <Text color="gray.700" mb={2}>
                  Email
                </Text>
                <Input
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  InputLeftElement={
                    <Icon as={Ionicons} name="mail-outline" color="gray.500" ml={3} />
                  }
                />
                {touched.email && errors.email ? (
                  <Text color="error.500" mt={1}>
                    {errors.email}
                  </Text>
                ) : null}
              </Box>

              <Box>
                <Text color="gray.700" mb={2}>
                  Password
                </Text>
                <Input
                  placeholder="••••••••"
                  secureTextEntry
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  InputLeftElement={
                    <Icon as={Ionicons} name="lock-closed-outline" color="gray.500" ml={3} />
                  }
                />
                {touched.password && errors.password ? (
                  <Text color="error.500" mt={1}>
                    {errors.password}
                  </Text>
                ) : null}
              </Box>

              <Button mt={4} onPress={() => handleSubmit()} isLoading={isSubmitting}>
                Sign in
              </Button>
            </VStack>
          )}
        </Formik>

        <HStack justifyContent="center">
          <Text color="gray.600">Need a new account?</Text>
          <Link href="/(auth)/register">
            <Text color="primary.600" ml={2} fontWeight="600">
              Register
            </Text>
          </Link>
        </HStack>
      </VStack>
    </KeyboardAvoidingView>
  );
}

