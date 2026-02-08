// mzeel-app/src/screens/auth/RegisterScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import colors from '../../styles/colors';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Нэр оруулна уу';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Овог оруулна уу';
    }

    if (!formData.phone || formData.phone.length !== 8) {
      newErrors.phone = 'Утасны дугаар 8 оронтой байх ёстой';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Email хаяг буруу байна';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Нууц үг 6-аас дээш тэмдэгт байх ёстой';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Нууц үг таарахгүй байна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Алдаа', result.message || 'Бүртгэл амжилтгүй');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Бүртгүүлэх</Text>
          <Text style={styles.subtitle}>Шинэ хэрэглэгч үүсгэх</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Овог"
            placeholder="Овог оруулна уу"
            value={formData.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            error={errors.lastName}
            icon="person-outline"
          />

          <Input
            label="Нэр"
            placeholder="Нэр оруулна уу"
            value={formData.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            error={errors.firstName}
            icon="person-outline"
          />

          <Input
            label="Утасны дугаар"
            placeholder="89549988"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            keyboardType="number-pad"
            maxLength={8}
            error={errors.phone}
            icon="call-outline"
          />

          <Input
            label="Email хаяг"
            placeholder="example@email.com"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            icon="mail-outline"
          />

          <Input
            label="Нууц үг"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry
            error={errors.password}
            icon="lock-closed-outline"
          />

          <Input
            label="Нууц үг давтах"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            secureTextEntry
            error={errors.confirmPassword}
            icon="lock-closed-outline"
          />

          <Button
            title="Бүртгүүлэх"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <Button
            title="Буцах"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
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
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightGray,
  },
  form: {
    flex: 1,
  },
  registerButton: {
    marginTop: 24,
    marginBottom: 12,
  },
  backButton: {
    marginBottom: 24,
  },
});