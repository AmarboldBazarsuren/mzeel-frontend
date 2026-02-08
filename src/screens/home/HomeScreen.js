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

// src/screens/home/HomeScreen.js

// ✅ ШИНЭЧИЛСЭН: Loan Limit Card (Зээл авах + Зээл төлөх товчтой)
const LoanLimitCard = () => {
  const [profile, setProfile] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);

  useEffect(() => {
    loadLoanData();
  }, []);

  const loadLoanData = async () => {
    try {
      const profileRes = await api.getProfile();
      if (profileRes.success) setProfile(profileRes.data.profile);

      const loansRes = await api.getMyLoans(1);
      if (loansRes.success) {
        // Идэвхтэй зээлүүд
        const active = loansRes.data.loans.filter(loan =>
          ['disbursed', 'active', 'overdue'].includes(loan.status)
        );
        setActiveLoans(active);
      }
    } catch (error) {
      console.error('Loan data load error:', error);
    }
  };

  // ✅ Зээл авах function
  const handleRequestLoan = async () => {
    if (!profile || !profile.isVerified) {
      Alert.alert('Хувийн мэдээлэл шаардлагатай', 'Эхлээд хувийн мэдээллээ бөглөнө үү', [
        { text: 'За', onPress: () => navigation.navigate('ProfileForm') }
      ]);
      return;
    }

    if (profile.availableLoanLimit <= 0) {
      Alert.alert('Зээлийн эрх байхгүй', 'Та зээл авах эрхгүй байна');
      return;
    }

   
    // Дүн оруулуулах
    Alert.prompt(
      'Зээл авах',
      `Дээд хэмжээ: ${formatCurrency(profile.availableLoanLimit)}\n\nХэдэн төгрөг авах вэ?`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Илгээх',
          onPress: async (amount) => {
            const loanAmount = parseInt(amount);
            if (!loanAmount || loanAmount < 10000) {
              Alert.alert('Алдаа', 'Хамгийн багадаа 10,000₮');
              return;
            }
            if (loanAmount > profile.availableLoanLimit) {
              Alert.alert('Алдаа', `Дээд хэмжээ: ${formatCurrency(profile.availableLoanLimit)}`);
              return;
            }

            try {
              const res = await api.requestApprovedLoan(loanAmount);
              if (res.success) {
                Alert.alert('Амжилттай', 'Хүсэлт илгээгдлээ. Админ зөвшөөрнө.', [
                  { text: 'За', onPress: () => { loadData(); loadLoanData(); } }
                ]);
              }
            } catch (error) {
              Alert.alert('Алдаа', error.message);
            }
          }
        }
      ],
      'plain-text',
      '',
      'number-pad'
    );
  };

  // ✅ Зээл төлөх function
  const handlePayLoan = () => {
    if (activeLoans.length === 0) {
      Alert.alert('Зээл байхгүй', 'Та төлөх зээлгүй байна');
      return;
    }

    // Хамгийн сүүлийн зээл
    const loan = activeLoans[0];
    navigation.navigate('LoanDetail', { loanId: loan._id });
  };

  return (
    <Card style={styles.loanLimitCard}>
      <View style={styles.loanLimitHeader}>
        <View>
          <Text style={styles.loanLimitLabel}>ЦАХИМ ЗЭЭЛ - ДЭЭД ЭРХ</Text>
          <Text style={styles.loanLimitSubtitle}>
            Таны авч болох зээлийн дээд хэмжээ
          </Text>
        </View>
        <Ionicons name="card-outline" size={32} color={colors.primary} />
      </View>

      <Text style={styles.loanLimitAmount}>
        {formatCurrency(profile?.availableLoanLimit || 0)}
      </Text>

      {/* ✅ ШИНЭ: 2 товч */}
      <View style={styles.loanButtonsRow}>
        {/* Зээл авах товч */}
        <TouchableOpacity
          style={[styles.loanActionButton, styles.loanActionButtonPrimary]}
          onPress={handleRequestLoan}
          disabled={!profile || profile.availableLoanLimit <= 0 || activeLoans.length > 0}
        >
          <Ionicons name="cash-outline" size={20} color={colors.white} />
          <Text style={styles.loanActionButtonText}>Зээл авах</Text>
        </TouchableOpacity>

        {/* Зээл төлөх товч */}
        <TouchableOpacity
          style={[styles.loanActionButton, styles.loanActionButtonSecondary]}
          onPress={handlePayLoan}
          disabled={activeLoans.length === 0}
        >
          <Ionicons name="card-outline" size={20} color={colors.white} />
          <Text style={styles.loanActionButtonText}>Зээл төлөх</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Идэвхтэй зээлийн мэдээлэл */}
      {activeLoans.length > 0 && (
        <View style={styles.activeLoanInfo}>
          <Text style={styles.activeLoanLabel}>Идэвхтэй зээл:</Text>
          <Text style={styles.activeLoanAmount}>
            {formatCurrency(activeLoans[0].remainingAmount)} үлдэгдэл
          </Text>
        </View>
      )}
    </Card>
  );
};

  // ✅ ШИНЭ: Хэтэвчийн үлдэгдэл (тэмдэггүй, зөвхөн мэдээлэл)
  const WalletBalance = () => (
    <Card style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <Text style={styles.walletLabel}>Хэтэвчийн үлдэгдэл</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Ionicons name="open-outline" size={20} color={colors.primary} />
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
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Text style={styles.seeAll}>Бүгд ›</Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="receipt-outline" size={48} color={colors.gray} />
          <Text style={styles.emptyText}>Гүйлгээ байхгүй байна</Text>
        </Card>
      ) : (
        transactions.map((transaction) => (
          <Card key={transaction._id} style={styles.transactionCard}>
            <View style={styles.transactionRow}>
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                        ? colors.green + '20'
                        : colors.primary + '20',
                  },
                ]}
              >
                <Ionicons
                  name={
                    transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                      ? 'arrow-down'
                      : 'arrow-up'
                  }
                  size={20}
                  color={
                    transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                      ? colors.green
                      : colors.primary
                  }
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDesc}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.createdAt)}
                </Text>
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
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
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

        <TouchableOpacity onPress={() => Alert.alert('Мэдэгдэл', 'Мэдэгдэл байхгүй')}>
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
          {/* ✅ ШИНЭ ДАРААЛАЛ */}
          <LoanLimitCard />
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
  
  // ✅ ШИНЭ: Loan Limit Card
  loanLimitCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  loanLimitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanLimitLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loanLimitSubtitle: {
    color: colors.lightGray,
    fontSize: 12,
    marginTop: 4,
  },
  loanLimitAmount: {
    color: colors.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  applyLoanButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  applyLoanButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  
  // ✅ ШИНЭЧИЛСЭН: Wallet Card (+ тэмдэггүй)
  walletCard: {
    marginBottom: 24,
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletLabel: {
    color: colors.lightGray,
    fontSize: 13,
    fontWeight: '500',
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
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    color: colors.lightGray,
    fontSize: 12,
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
  // HomeScreen.js styles-д нэмнэ
loanButtonsRow: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 12,
},
loanActionButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  borderRadius: 8,
  gap: 6,
},
loanActionButtonPrimary: {
  backgroundColor: colors.primary,
},
loanActionButtonSecondary: {
  backgroundColor: colors.secondary,
},
loanActionButtonText: {
  color: colors.white,
  fontSize: 14,
  fontWeight: '600',
},
activeLoanInfo: {
  marginTop: 16,
  paddingTop: 16,
  borderTopWidth: 1,
  borderTopColor: colors.primary + '30',
},
activeLoanLabel: {
  color: colors.lightGray,
  fontSize: 12,
  marginBottom: 4,
},
activeLoanAmount: {
  color: colors.primary,
  fontSize: 16,
  fontWeight: '700',
},
});