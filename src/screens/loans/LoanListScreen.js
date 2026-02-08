// mzeel-app/src/screens/loans/LoanListScreen.js

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
import { api } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';

export default function LoanListScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const response = await api.getMyLoans(1);

       if (response.success) {
      // ✅ ШИНЭ: approved зээлийг түүхэнд ХАРУУЛАХГҮЙ
      const filteredLoans = response.data.loans.filter(loan => 
        loan.status !== 'approved'
      );
      setLoans(filteredLoans); // Өмнө: setLoans(response.data.loans)
      setStats(response.data.stats);
    }
    } catch (error) {
      Alert.alert('Алдаа', 'Зээлийн мэдээлэл татахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoan = async () => {
    Alert.alert(
      'Баталгаажуулалт',
      'Зээлийн мэдээлэл баталгаажуулахад 3,000₮ төлөх шаардлагатай. Үргэлжлүүлэх үү?',
      [
        { text: 'Үгүй', style: 'cancel' },
        {
          text: 'Тийм',
          onPress: async () => {
            try {
              setVerifying(true);
              const response = await api.verifyLoan();

              if (response.success) {
                Alert.alert('Амжилттай', response.message, [
                  { text: 'За', onPress: loadLoans },
                ]);
              }
            } catch (error) {
              Alert.alert('Алдаа', error.message || 'Баталгаажуулалт амжилтгүй');
            } finally {
              setVerifying(false);
            }
          },
        },
      ]
    );
  };

  const getLoanStatusText = (status) => {
    const statusMap = {
      pending_verification: 'Баталгаажуулалт хүлээгдэж байна',
      under_review: 'Шалгаж байна',
      approved: 'Зөвшөөрөгдсөн',
      disbursed: 'Олгогдсон',
      active: 'Идэвхтэй',
      paid: 'Төлөгдсөн',
      overdue: 'Хугацаа хэтэрсэн',
      cancelled: 'Цуцлагдсан',
    };
    return statusMap[status] || status;
  };

  const getLoanStatusColor = (status) => {
    const colorMap = {
      pending_verification: colors.warning,
      under_review: colors.warning,
      approved: colors.green,
      disbursed: colors.green,
      active: colors.primary,
      paid: colors.green,
      overdue: colors.error,
      cancelled: colors.gray,
    };
    return colorMap[status] || colors.gray;
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
        <Text style={styles.headerTitle}>Миний зээлүүд</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        {stats && (
          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Нийт</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {stats.active}
                </Text>
                <Text style={styles.statLabel}>Идэвхтэй</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.green }]}>{stats.paid}</Text>
                <Text style={styles.statLabel}>Төлөгдсөн</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.error }]}>
                  {stats.overdue}
                </Text>
                <Text style={styles.statLabel}>Хугацаа хэтэрсэн</Text>
              </View>
            </View>
          </Card>
        )}

        {/* New Loan Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Шинэ зээл авах"
            onPress={handleVerifyLoan}
            loading={verifying}
            icon="add"
          />
        </View>

        {/* Loans List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Зээлийн түүх</Text>

          {loans.length === 0 ? (
            <Text style={styles.emptyText}>Зээл байхгүй байна</Text>
          ) : (
            loans.map((loan) => (
              <Card
                key={loan._id}
                style={styles.loanCard}
                onPress={() => navigation.navigate('LoanDetail', { loanId: loan._id })}
              >
                <View style={styles.loanHeader}>
                  <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getLoanStatusColor(loan.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getLoanStatusColor(loan.status) }]}>
                      {getLoanStatusText(loan.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.loanBody}>
                  <View style={styles.loanRow}>
                    <Text style={styles.loanLabel}>Зээлийн дүн</Text>
                    <Text style={styles.loanValue}>
                      {formatCurrency(loan.disbursedAmount || loan.approvedAmount || 0)}
                    </Text>
                  </View>

                  {loan.totalRepayment > 0 && (
                    <View style={styles.loanRow}>
                      <Text style={styles.loanLabel}>Нийт төлөх</Text>
                      <Text style={styles.loanValue}>{formatCurrency(loan.totalRepayment)}</Text>
                    </View>
                  )}

                  {loan.remainingAmount > 0 && (
                    <View style={styles.loanRow}>
                      <Text style={styles.loanLabel}>Үлдэгдэл</Text>
                      <Text style={[styles.loanValue, { color: colors.primary }]}>
                        {formatCurrency(loan.remainingAmount)}
                      </Text>
                    </View>
                  )}

                  {loan.dueDate && (
                    <View style={styles.loanRow}>
                      <Text style={styles.loanLabel}>Хугацаа</Text>
                      <Text style={styles.loanValue}>{formatDate(loan.dueDate)}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.loanFooter}>
                  <Text style={styles.loanDate}>Үүссэн: {formatDate(loan.createdAt)}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.lightGray} />
                </View>
              </Card>
            ))
          )}
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
  statsCard: {
    margin: 20,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statBox: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.lightGray,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    color: colors.gray,
    textAlign: 'center',
    paddingVertical: 20,
  },
  loanCard: {
    marginBottom: 12,
    padding: 16,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  loanNumber: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loanBody: {
    marginBottom: 12,
  },
  loanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  loanLabel: {
    color: colors.lightGray,
    fontSize: 14,
  },
  loanValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray + '30',
  },
  loanDate: {
    color: colors.lightGray,
    fontSize: 12,
  },
});