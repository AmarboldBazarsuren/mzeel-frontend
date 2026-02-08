// mzeel-app/src/screens/auth/LoginScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import colors from '../../styles/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!phone || phone.length !== 8) {
      newErrors.phone = 'Утасны дугаар 8 оронтой байх ёстой';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Нууц үг 6-аас дээш тэмдэгт байх ёстой';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Алдаа', result.message || 'Нэвтрэх амжилтгүй');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoM}>M</Text>
          </View>
          <Text style={styles.logoText}>credit</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Утасны дугаар</Text>
          
          <Input
            placeholder="89549988"
            value={phone}
            onChangeText={setPhone}
            keyboardType="number-pad"
            maxLength={8}
            error={errors.phone}
            icon="call-outline"
          />

          <Input
            placeholder="Нэвтрэх нууц үг"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            icon="lock-closed-outline"
          />

          <Text style={styles.forgotPassword}>Нууц үг мартсан?</Text>

          <Button
            title="Нэвтрэх"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <Button
            title="Бүртгүүлэх"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            style={styles.registerButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoM: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.white,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: 16,
  },
  forgotPassword: {
    color: colors.white,
    textAlign: 'right',
    marginBottom: 32,
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 12,
  },
  registerButton: {
    marginTop: 12,
  },
});