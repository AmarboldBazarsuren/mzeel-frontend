// frontend/src/screens/loans/ActiveLoansScreen.js

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
import colors from '../../styles/colors';

export default function ActiveLoansScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveLoans();
  }, []);

  const loadActiveLoans = async () => {
    try {
      setLoading(true);
      const res = await api.getMyLoans(1);
      
      if (res.success) {
        // Зөвхөн идэвхтэй зээлүүд
        const activeLoans = res.data.loans.filter(loan =>
          ['disbursed', 'active', 'overdue'].includes(loan.status)
        );
        setLoans(activeLoans);
      }
    } catch (error) {
      Alert.alert('Алдаа', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'overdue') return colors.error;
    if (status === 'active') return colors.primary;
    return colors.green;
  };

  const getStatusText = (status) => {
    if (status === 'overdue') return 'Хугацаа хэтэрсэн';
    if (status === 'active') return 'Идэвхтэй';
    return 'Олгогдсон';
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
        <Text style={styles.headerTitle}>Идэвхтэй зээлүүд</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {loans.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="card-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyText}>Идэвхтэй зээл байхгүй</Text>
            </Card>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Төлөх эсвэл сунгах зээлээ сонгоно уу
              </Text>

              {loans.map((loan) => (
                <Card
                  key={loan._id}
                  style={styles.loanCard}
                  onPress={() => navigation.navigate('PayLoan', { loan })}
                >
                  <View style={styles.loanHeader}>
                    <View>
                      <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
                      <Text style={styles.loanDate}>
                        {formatDate(loan.createdAt)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(loan.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(loan.status) },
                        ]}
                      >
                        {getStatusText(loan.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.loanBody}>
                    <View style={styles.loanRow}>
                      <Text style={styles.label}>Үлдэгдэл төлөх</Text>
                      <Text style={styles.amountBig}>
                        {formatCurrency(loan.remainingAmount)}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Нийт дүн</Text>
                      <Text style={styles.infoValue}>
                        {formatCurrency(loan.totalAmount || loan.totalRepayment)}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Төлсөн</Text>
                      <Text style={styles.infoValue}>
                        {formatCurrency(loan.paidAmount || 0)}
                      </Text>
                    </View>

                    {loan.dueDate && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Хугацаа</Text>
                        <Text
                          style={[
                            styles.infoValue,
                            loan.status === 'overdue' && { color: colors.error },
                          ]}
                        >
                          {formatDate(loan.dueDate)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.loanFooter}>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                    <Text style={styles.footerText}>Төлөх эсвэл сунгах →</Text>
                  </View>
                </Card>
              ))}
            </>
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
  content: {
    padding: 20,
  },
  subtitle: {
    color: colors.lightGray,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyCard: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray,
    fontSize: 16,
    marginTop: 16,
  },
  loanCard: {
    marginBottom: 16,
    padding: 20,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  loanNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  loanDate: {
    fontSize: 12,
    color: colors.lightGray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loanBody: {
    marginBottom: 16,
  },
  loanRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: colors.lightGray,
    marginBottom: 8,
  },
  amountBig: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray + '30',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.lightGray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  loanFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray + '30',
    gap: 8,
  },
  footerText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});