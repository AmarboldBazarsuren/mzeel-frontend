// frontend/src/screens/settings/SettingsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import Card from '../../components/common/Card';
import colors from '../../styles/colors';

export default function SettingsScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await updateUser();
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    Alert.alert('Гарах', 'Та гарахдаа итгэлтэй байна уу?', [
      { text: 'Үгүй', style: 'cancel' },
      {
        text: 'Тийм',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const MenuItem = ({ icon, title, onPress, color = colors.white, showArrow = true }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.menuText, { color }]}>{title}</Text>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.lightGray} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Тохиргоо</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />
        }
      >
        {/* User Info */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.userPic}>
              <Ionicons name="person" size={32} color={colors.white} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.lastName} {user?.firstName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Хэрэглэгч</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              title="Хувийн мэдээлэл"
              onPress={() => navigation.navigate('Profile')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="lock-closed-outline"
              title="Нууц үг солих"
              onPress={() => Alert.alert('Coming soon', 'Удахгүй нэмэгдэнэ')}
            />
          </Card>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Апп</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              title="Мэдэгдэл"
              onPress={() => Alert.alert('Coming soon', 'Удахгүй нэмэгдэнэ')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="language-outline"
              title="Хэл"
              onPress={() => Alert.alert('Coming soon', 'Удахгүй нэмэгдэнэ')}
            />
          </Card>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Тусламж</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              title="Тусламж"
              onPress={() => Alert.alert('Тусламж', 'support@mcredit.mn')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="document-text-outline"
              title="Үйлчилгээний нөхцөл"
              onPress={() => Alert.alert('Coming soon', 'Удахгүй нэмэгдэнэ')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Нууцлалын бодлого"
              onPress={() => Alert.alert('Coming soon', 'Удахгүй нэмэгдэнэ')}
            />
          </Card>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="log-out-outline"
              title="Гарах"
              onPress={handleLogout}
              color={colors.error}
              showArrow={false}
            />
          </Card>
        </View>

        {/* Version */}
        <Text style={styles.version}>Хувилбар 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  userCard: {
    margin: 20,
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPic: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.lightGray,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.lightGray,
    marginLeft: 20,
    marginBottom: 8,
  },
  menuCard: {
    marginHorizontal: 20,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray + '30',
    marginHorizontal: 16,
  },
  version: {
    textAlign: 'center',
    color: colors.gray,
    fontSize: 12,
    marginBottom: 40,
  },
});