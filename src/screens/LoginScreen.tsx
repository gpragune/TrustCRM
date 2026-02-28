import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type FormValues = z.infer<typeof schema>;

export const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuthStore();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setLoading(true);
        await login(values.email, values.password);
      } catch (error) {
        Alert.alert('Login failed', error instanceof Error ? error.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  const onDemoLogin = useCallback(async () => {
    try {
      setLoading(true);
      await demoLogin();
    } catch (error) {
      Alert.alert('Demo login failed', error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, [demoLogin]);

  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <Text className="text-3xl font-bold text-slate-900 mb-2">ChatOrder</Text>
      <Text className="text-slate-600 mb-8">Messenger orders, structured in seconds.</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-2"
            value={value}
            onChangeText={onChange}
            editable={!loading}
          />
        )}
      />
      {errors.email && <Text className="text-red-500 text-xs mb-2">Valid email required</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-2"
            value={value}
            onChangeText={onChange}
            editable={!loading}
          />
        )}
      />
      {errors.password && <Text className="text-red-500 text-xs mb-4">Password must be at least 6 chars</Text>}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className={`rounded-xl py-3 items-center mb-3 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text className="text-white font-semibold">Login</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => Alert.alert('Forgot password', 'Reset flow will be connected to API soon.')}
        disabled={loading}
      >
        <Text className="text-center text-blue-600 mb-3">Forgot password</Text>
      </Pressable>

      <Pressable
        onPress={onDemoLogin}
        disabled={loading}
        className={`border rounded-xl py-3 items-center ${loading ? 'border-slate-200' : 'border-slate-300'}`}
      >
        <Text className="text-slate-700 font-semibold">Demo mode</Text>
      </Pressable>
    </View>
  );
};
