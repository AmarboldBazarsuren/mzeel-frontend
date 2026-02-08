// mzeel-app/src/screens/profile/ProfileFormScreen.js

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
import { api } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import colors from '../../styles/colors';

export default function ProfileFormScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registerNumber: '',
    dateOfBirth: '',
    gender: 'male',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    city: '',
    district: '',
    khoroo: '',
    educationLevel: 'high',
    employmentStatus: 'employed',
    companyName: '',
    position: '',
    monthlyIncome: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.registerNumber || !formData.dateOfBirth) {
      Alert.alert('Алдаа', 'Регистрийн дугаар болон төрсөн өдрөө оруулна уу');
      return;
    }

    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      Alert.alert('Алдаа', 'Банкны мэдээллээ бүрэн бөглөнө үү');
      return;
    }

    try {
      setLoading(true);

      // Backend-д илгээх өгөгдөл бэлдэх
      const profileData = {
        registerNumber: formData.registerNumber,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone,
        },
        address: {
          city: formData.city,
          district: formData.district,
          khoroo: formData.khoroo || '',
        },
        education: {
          level: formData.educationLevel,
        },
        employment: {
          status: formData.employmentStatus,
          companyName: formData.companyName || '',
          position: formData.position || '',
          monthlyIncome: parseInt(formData.monthlyIncome) || 0,
        },
        bankAccount: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        },
      };

      const response = await api.createProfile(profileData);

      if (response.success) {
        Alert.alert('Амжилттай', 'Хувийн мэдээлэл хадгалагдлаа', [
          {
            text: 'За',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Алдаа', error.message || 'Хувийн мэдээлэл хадгалахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Хувийн мэдээлэл бөглөх</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Хувийн мэдээлэл */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Хувийн мэдээлэл</Text>

          <Input
            label="Регистрийн дугаар (УБ12345678)"
            placeholder="УБ12345678"
            value={formData.registerNumber}
            onChangeText={(value) => updateField('registerNumber', value.toUpperCase())}
            maxLength={10}
          />

          <Input
            label="Төрсөн өдөр (YYYY-MM-DD)"
            placeholder="1990-01-01"
            value={formData.dateOfBirth}
            onChangeText={(value) => updateField('dateOfBirth', value)}
          />

          <Text style={styles.label}>Хүйс</Text>
          <View style={styles.radioGroup}>
            <Button
              title="Эрэгтэй"
              variant={formData.gender === 'male' ? 'primary' : 'outline'}
              onPress={() => updateField('gender', 'male')}
              style={styles.radioButton}
            />
            <Button
              title="Эмэгтэй"
              variant={formData.gender === 'female' ? 'primary' : 'outline'}
              onPress={() => updateField('gender', 'female')}
              style={styles.radioButton}
            />
          </View>
        </View>

        {/* Яаралтай холбоо барих */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Яаралтай холбоо барих</Text>

          <Input
            label="Нэр"
            placeholder="Бат"
            value={formData.emergencyContactName}
            onChangeText={(value) => updateField('emergencyContactName', value)}
          />

          <Input
            label="Хамаарал"
            placeholder="Эцэг, ээж, ах, эгч гэх мэт"
            value={formData.emergencyContactRelationship}
            onChangeText={(value) => updateField('emergencyContactRelationship', value)}
          />

          <Input
            label="Утас"
            placeholder="99123456"
            value={formData.emergencyContactPhone}
            onChangeText={(value) => updateField('emergencyContactPhone', value)}
            keyboardType="number-pad"
            maxLength={8}
          />
        </View>

        {/* Хаяг */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Хаяг</Text>

          <Input
            label="Хот/Аймаг"
            placeholder="Улаанбаатар"
            value={formData.city}
            onChangeText={(value) => updateField('city', value)}
          />

          <Input
            label="Дүүрэг/Сум"
            placeholder="Сүхбаатар"
            value={formData.district}
            onChangeText={(value) => updateField('district', value)}
          />

          <Input
            label="Хороо (заавал биш)"
            placeholder="1"
            value={formData.khoroo}
            onChangeText={(value) => updateField('khoroo', value)}
          />
        </View>

        {/* Ажлын мэдээлэл */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ажлын мэдээлэл</Text>

          <Text style={styles.label}>Төлөв</Text>
          <View style={styles.radioGroup}>
            <Button
              title="Ажилтай"
              variant={formData.employmentStatus === 'employed' ? 'primary' : 'outline'}
              onPress={() => updateField('employmentStatus', 'employed')}
              style={styles.radioButton}
            />
            <Button
              title="Оюутан"
              variant={formData.employmentStatus === 'student' ? 'primary' : 'outline'}
              onPress={() => updateField('employmentStatus', 'student')}
              style={styles.radioButton}
            />
          </View>

          {formData.employmentStatus === 'employed' && (
            <>
              <Input
                label="Байгууллага"
                placeholder="Компани нэр"
                value={formData.companyName}
                onChangeText={(value) => updateField('companyName', value)}
              />

              <Input
                label="Албан тушаал"
                placeholder="Менежер"
                value={formData.position}
                onChangeText={(value) => updateField('position', value)}
              />

              <Input
                label="Сарын орлого (₮)"
                placeholder="1000000"
                value={formData.monthlyIncome}
                onChangeText={(value) => updateField('monthlyIncome', value)}
                keyboardType="number-pad"
              />
            </>
          )}
        </View>

        {/* Банкны мэдээлэл */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Банкны мэдээлэл</Text>

          <Input
            label="Банкны нэр"
            placeholder="Хаан банк"
            value={formData.bankName}
            onChangeText={(value) => updateField('bankName', value)}
          />

          <Input
            label="Дансны дугаар"
            placeholder="1234567890"
            value={formData.accountNumber}
            onChangeText={(value) => updateField('accountNumber', value)}
            keyboardType="number-pad"
          />

          <Input
            label="Дансны эзэмшигч"
            placeholder="Овог Нэр"
            value={formData.accountName}
            onChangeText={(value) => updateField('accountName', value)}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Хадгалах"
            onPress={handleSubmit}
            loading={loading}
          />
          
          <Button
            title="Буцах"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 16,
  },
  label: {
    color: colors.lightGray,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  radioButton: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
});