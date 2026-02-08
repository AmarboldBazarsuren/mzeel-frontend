// mzeel-app/src/screens/home/HomeScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import colors from '../../styles/colors';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletRes, loansRes, transRes] = await Promise.all([
        api.getWallet(),
        api.getMyLoans(1),
        api.getTransactions(1),
      ]);

      if (walletRes.success) setWallet(walletRes.data.wallet);
      if (loansRes.success) setLoans(loansRes.data.loans.slice(0, 3));
      if (transRes.success) setTransactions(transRes.data.transactions.slice(0, 5));
    } catch (error) {
      console.error('Өгөгдөл татах алдаа:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Цахим зээл (banner)
  const CreditBanner = () => (
    <Card style={styles.banner}>
      <Image
        source={{ uri: 'https://via.placeholder.com/400x200/1E3A5F/FFFFFF?text=MCredit' }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle}>ЦАХИМ ЗЭЭЛ</Text>
        <Text style={styles.bannerAmount}>500,000-1,000,000₮</Text>
        <Text style={styles.bannerSubtitle}>КАРТЫН ХУГАЦАА</Text>
        <Text style={styles.bannerMonths}>⏱ 3 ЖИЛ</Text>
      </View>
      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => navigation.navigate('Loans')}
      >
        <Text style={styles.applyButtonText}>Хүсэлт илгээх ›</Text>
      </TouchableOpacity>
    </Card>
  );

  // Хэтэвчийн үлдэгдэл
  const WalletBalance = () => (
    <Card style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <Text style={styles.walletLabel}>Дээд эрх</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Ionicons name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.walletBalance}>
        {formatCurrency(wallet?.balance || 0)}
      </Text>
    </Card>
  );

  // Сүүлийн гүйлгээ
  const RecentTransactions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Сүүлийн 5 гүйлгээ</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
          <Text style={styles.seeAll}>Бүгд ›</Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>Гүйлгээ байхгүй байна</Text>
      ) : (
        transactions.map((transaction) => (
          <Card key={transaction._id} style={styles.transactionCard}>
            <View style={styles.transactionRow}>
              <View style={styles.transactionIcon}>
                <Ionicons name="logo-electron" size={24} color={colors.primary} />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.createdAt)}
                </Text>
                <Text style={styles.transactionDesc}>{transaction.description}</Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                    ? styles.positive
                    : styles.negative,
                ]}
              >
                {transaction.type === 'deposit' || transaction.type === 'loan_disbursement' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>
          </Card>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <View style={styles.profilePic}>
            <Ionicons name="person" size={24} color={colors.white} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.logoHeader}>
          <View style={styles.logoSmall}>
            <Text style={styles.logoSmallText}>M</Text>
          </View>
          <Text style={styles.headerTitle}>credit</Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="notifications" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.white} />
        }
      >
        <View style={styles.content}>
          <CreditBanner />
          <WalletBalance />
          <RecentTransactions />
        </View>
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
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSmall: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoSmallText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
  },
  content: {
    padding: 20,
  },
  banner: {
    padding: 0,
    height: 220,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    padding: 20,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerAmount: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bannerSubtitle: {
    color: colors.white,
    fontSize: 10,
    marginBottom: 4,
  },
  bannerMonths: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(229, 57, 53, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  applyButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  walletCard: {
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLabel: {
    color: colors.lightGray,
    fontSize: 14,
  },
  walletBalance: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  seeAll: {
    color: colors.primary,
    fontSize: 14,
  },
  emptyText: {
    color: colors.gray,
    textAlign: 'center',
    paddingVertical: 20,
  },
  transactionCard: {
    marginBottom: 8,
    padding: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    color: colors.lightGray,
    fontSize: 12,
    marginBottom: 2,
  },
  transactionDesc: {
    color: colors.white,
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: colors.green,
  },
  negative: {
    color: colors.white,
  },
});