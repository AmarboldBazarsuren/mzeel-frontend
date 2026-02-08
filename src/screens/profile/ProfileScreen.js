// mzeel-app/src/screens/profile/ProfileScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getProfile();

      if (response.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      // Profile байхгүй бол null хэвээр үлдээх
      console.log('Profile олдсонгүй:', error.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ProfileForm руу шилжүүлэх function
  const handleCreateProfile = () => {
    navigation.navigate('ProfileForm');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Хувийн мэдээлэл</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <View style={styles.profilePic}>
            <Ionicons name="person" size={48} color={colors.white} />
          </View>
          <Text style={styles.userName}>
            {user?.lastName} {user?.firstName}
          </Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
        </View>

        {profile ? (
          <>
            {/* Personal Info */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Хувийн мэдээлэл</Text>

              <InfoRow label="Регистрийн дугаар" value={profile.registerNumber} />
              <InfoRow
                label="Төрсөн өдөр"
                value={new Date(profile.dateOfBirth).toLocaleDateString('mn-MN')}
              />
              <InfoRow
                label="Хүйс"
                value={profile.gender === 'male' ? 'Эрэгтэй' : 'Эмэгтэй'}
              />
            </Card>

            {/* Address */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Хаяг</Text>

              <InfoRow label="Хот/Аймаг" value={profile.address.city} />
              <InfoRow label="Дүүрэг/Сум" value={profile.address.district} />
              {profile.address.khoroo && (
                <InfoRow label="Хороо" value={profile.address.khoroo} />
              )}
            </Card>

            {/* Employment */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Ажлын мэдээлэл</Text>

              <InfoRow
                label="Төлөв"
                value={
                  profile.employment.status === 'employed'
                    ? 'Ажил эрхэлдэг'
                    : profile.employment.status === 'self-employed'
                    ? 'Хувиараа'
                    : profile.employment.status === 'student'
                    ? 'Оюутан'
                    : 'Ажилгүй'
                }
              />
              {profile.employment.companyName && (
                <InfoRow label="Байгууллага" value={profile.employment.companyName} />
              )}
              {profile.employment.position && (
                <InfoRow label="Албан тушаал" value={profile.employment.position} />
              )}
            </Card>

            {/* Bank Account */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Дансны мэдээлэл</Text>

              <InfoRow label="Банк" value={profile.bankAccount.bankName} />
              <InfoRow label="Дансны дугаар" value={profile.bankAccount.accountNumber} />
              <InfoRow label="Эзэмшигч" value={profile.bankAccount.accountName} />
            </Card>

            {/* Verification Status */}
            <Card style={styles.card}>
              <View style={styles.verificationRow}>
                <Ionicons
                  name={profile.isVerified ? 'checkmark-circle' : 'alert-circle'}
                  size={24}
                  color={profile.isVerified ? colors.green : colors.warning}
                />
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationText}>
                    {profile.isVerified ? 'Баталгаажсан' : 'Баталгаажаагүй'}
                  </Text>
                  {profile.verifiedAt && (
                    <Text style={styles.verificationDate}>
                      {new Date(profile.verifiedAt).toLocaleDateString('mn-MN')}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </>
        ) : (
          <View style={styles.noProfile}>
            <Ionicons name="document-text-outline" size={64} color={colors.gray} />
            <Text style={styles.noProfileText}>Хувийн мэдээлэл бөглөөгүй байна</Text>
            <Text style={styles.noProfileHint}>
              Зээл авахын тулд хувийн мэдээллээ бөглөх шаардлагатай
            </Text>
            <Button
              title="Мэдээлэл бөглөх"
              onPress={handleCreateProfile}
              style={styles.fillButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: colors.lightGray,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: colors.lightGray,
    fontSize: 14,
  },
  infoValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationInfo: {
    marginLeft: 12,
  },
  verificationText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  verificationDate: {
    color: colors.lightGray,
    fontSize: 12,
    marginTop: 2,
  },
  noProfile: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noProfileText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noProfileHint: {
    color: colors.lightGray,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  fillButton: {
    paddingHorizontal: 40,
  },
});