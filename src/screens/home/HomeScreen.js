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
      const [walletRes, loansRes] = await Promise.all([
        api.getWallet(),
        api.getMyLoans(1),
      ]);

      if (walletRes.success) setWallet(walletRes.data.wallet);
      if (loansRes.success) setLoans(loansRes.data.loans);
    } catch (error) {
      console.error('Өгөгдөл татах алдаа:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // ✅ ШИНЭ: Loan Limit Card (Зээл авах + Зээл төлөх товчтой)
  const LoanLimitCard = () => {
    const [profile, setProfile] = useState(null);
    const [activeLoans, setActiveLoans] = useState([]);

    useEffect(() => {
      loadLoanData();
    }, []);

    // ✅ ШИНЭ: loadLoanData функц тодорхойлох
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
    const handleRequestLoan = () => {
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

      // Шинэ хуудас руу шилжүүлэх
      navigation.navigate('RequestLoan', { profile });
    };

    // ✅ Зээл төлөх function
    // ✅ Зээл төлөх function (ШИНЭЧИЛСЭН)
const handlePayLoan = () => {
  if (activeLoans.length === 0) {
    Alert.alert('Зээл байхгүй', 'Та төлөх зээлгүй байна');
    return;
  }

  // ✅ ActiveLoans хуудас руу шилжүүлэх
  navigation.navigate('ActiveLoans');
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
            disabled={!profile || profile.availableLoanLimit <= 0}
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
            <View style={styles.activeLoanRow}>
              <Text style={styles.activeLoanLabel}>
                Идэвхтэй зээл: ({activeLoans.length} ширхэг)
              </Text>
              <Text style={styles.activeLoanValue}>
                {formatCurrency(
                  activeLoans.reduce((sum, loan) => sum + (loan.disbursedAmount || 0), 0)
                )}
              </Text>
            </View>
            <View style={styles.activeLoanRow}>
              <Text style={styles.activeLoanLabel}>Үлдэгдэл төлөх:</Text>
              <Text style={styles.activeLoanAmount}>
                {formatCurrency(
                  activeLoans.reduce((sum, loan) => sum + (loan.remainingAmount || 0), 0)
                )}
              </Text>
            </View>
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

  // ✅ ШИНЭ: Зээлүүдийн жагсаалт (Идэвхтэй, Хүлээгдэж буй, Төлөгдсөн)
  const LoansList = () => {
    const [filter, setFilter] = useState('active');

    const filteredLoans = loans.filter(loan => {
      if (filter === 'active') {
        return ['disbursed', 'active', 'overdue'].includes(loan.status);
      } else if (filter === 'pending') {
        return ['pending_disbursement', 'approved'].includes(loan.status);
      } else if (filter === 'paid') {
        return loan.status === 'paid';
      }
      return false;
    });

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Миний зээлүүд</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Loans')}>
            <Text style={styles.seeAll}>Бүгд ›</Text>
          </TouchableOpacity>
        </View>

        {/* Шүүлтүүр */}
        <View style={styles.loanFilters}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'active' && styles.filterBtnActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
              Идэвхтэй
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filter === 'pending' && styles.filterBtnActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Хүлээгдэж буй
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filter === 'paid' && styles.filterBtnActive]}
            onPress={() => setFilter('paid')}
          >
            <Text style={[styles.filterText, filter === 'paid' && styles.filterTextActive]}>
              Төлөгдсөн
            </Text>
          </TouchableOpacity>
        </View>

        {filteredLoans.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={48} color={colors.gray} />
            <Text style={styles.emptyText}>Зээл байхгүй байна</Text>
          </Card>
        ) : (
          filteredLoans.map((loan) => (
            <Card
              key={loan._id}
              style={styles.loanCard}
              onPress={() => navigation.navigate('LoanDetail', { loanId: loan._id })}
            >
              <View style={styles.loanCardHeader}>
                <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
                <View style={[
                  styles.loanStatusBadge,
                  {
                    backgroundColor:
                      loan.status === 'paid' ? colors.green + '20' :
                      loan.status === 'overdue' ? colors.error + '20' :
                      loan.status === 'disbursed' || loan.status === 'active' ? colors.primary + '20' :
                      colors.warning + '20'
                  }
                ]}>
                  <Text style={[
                    styles.loanStatusText,
                    {
                      color:
                        loan.status === 'paid' ? colors.green :
                        loan.status === 'overdue' ? colors.error :
                        loan.status === 'disbursed' || loan.status === 'active' ? colors.primary :
                        colors.warning
                    }
                  ]}>
                    {loan.status === 'disbursed' ? 'Олгогдсон' :
                     loan.status === 'active' ? 'Идэвхтэй' :
                     loan.status === 'paid' ? 'Төлөгдсөн' :
                     loan.status === 'overdue' ? 'Хугацаа хэтэрсэн' :
                     loan.status === 'approved' ? 'Зөвшөөрөгдсөн' :
                     'Хүлээгдэж байна'}
                  </Text>
                </View>
              </View>

              <View style={styles.loanCardBody}>
                <View style={styles.loanRow}>
                  <Text style={styles.loanLabel}>Зээлийн дүн</Text>
                  <Text style={styles.loanValue}>
                    {formatCurrency(loan.disbursedAmount || loan.approvedAmount || 0)}
                  </Text>
                </View>

                {loan.remainingAmount > 0 && (
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Үлдэгдэл</Text>
                    <Text style={[styles.loanValue, { color: colors.primary }]}>
                      {formatCurrency(loan.remainingAmount)}
                    </Text>
                  </View>
                )}

                <View style={styles.loanRow}>
                  <Text style={styles.loanLabel}>Огноо</Text>
                  <Text style={styles.loanValue}>
                    {formatDate(loan.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.loanCardFooter}>
                <Text style={styles.loanFooterText}>Дэлгэрэнгүй харах →</Text>
              </View>
            </Card>
          ))
        )}
      </View>
    );
  };

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
            <Text style={styles.logoSmallText}>X</Text>
          </View>
          <Text style={styles.headerTitle}>ZeelX</Text>
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
          <LoansList />
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
  activeLoanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeLoanValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loanFilters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.darkGray,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.lightGray,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  loanCard: {
    marginBottom: 12,
    padding: 16,
  },
  loanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanNumber: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  loanStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loanStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loanCardBody: {
    marginBottom: 12,
  },
  loanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  loanLabel: {
    color: colors.lightGray,
    fontSize: 13,
  },
  loanValue: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  loanCardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray + '30',
  },
  loanFooterText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});