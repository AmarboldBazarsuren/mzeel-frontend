// frontend/src/screens/loans/LoanDetailScreen.js
// Зээлийн дэлгэрэнгүй + Төлбөр төлөх + Зээл сунгах

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
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import colors from '../../styles/colors';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function LoanDetailScreen({ navigation, route }) {
  const { loanId } = route.params;
  
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadLoanDetail();
  }, []);

  const loadLoanDetail = async () => {
    try {
      setLoading(true);
      const res = await api.getLoanById(loanId);
      if (res.success) {
        setLoan(res.data.loan);
      }
    } catch (error) {
      Alert.alert('Алдаа', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Төлбөр төлөх
  const handleMakePayment = () => {
    if (!loan) return;

    Alert.prompt(
      'Төлбөр төлөх',
      `Үлдэгдэл: ${formatCurrency(loan.remainingAmount)}\n\nХэдэн төгрөг төлөх вэ?`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Төлөх',
          onPress: async (amount) => {
            const paymentAmount = parseFloat(amount);
            
            if (!paymentAmount || paymentAmount <= 0) {
              Alert.alert('Алдаа', 'Зөв дүн оруулна уу');
              return;
            }

            if (paymentAmount > loan.remainingAmount) {
              Alert.alert('Алдаа', 'Төлөх дүн үлдэгдлээс их байна');
              return;
            }

            try {
              setActionLoading(true);
              const res = await api.makePayment({
                loanId: loan._id,
                amount: paymentAmount,
              });

              if (res.success) {
                Alert.alert(
                  'Амжилттай',
                  'Төлбөр амжилттай төлөгдлөө',
                  [{ text: 'За', onPress: () => loadLoanDetail() }]
                );
              }
            } catch (error) {
              Alert.alert('Алдаа', error.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'number-pad'
    );
  };

  // Зээл сунгах
  const handleExtendLoan = () => {
    if (!loan) return;

    // 14 хоногийн зээлийг сунгаж болохгүй
    if (loan.termDays === 14) {
      Alert.alert(
        'Анхааруулга',
        '14 хоногийн зээлийг сунгах боломжгүй'
      );
      return;
    }

    // Сунгалтын мэдээлэл бэлтгэх
    const extensionInterest = Math.round(
      loan.disbursedAmount * (loan.interestRate / 100)
    );
    
    const extensionDays = loan.termDays;
    
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + extensionDays);

    Alert.alert(
      'Зээл сунгах',
      `Зээлийн хугацааг ${extensionDays} хоногоор сунгах уу?\n\n` +
      `Нэмэгдэх хүү: ${formatCurrency(extensionInterest)}\n` +
      `Шинэ үлдэгдэл: ${formatCurrency(loan.remainingAmount + extensionInterest)}\n` +
      `Шинэ хугацаа: ${formatDate(newDueDate)}\n\n` +
      `⚠️ Зөвхөн хүүгийн дүн төлөгдөнө, үндсэн зээл хэвээр үлдэнэ.`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Сунгах',
          style: 'default',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await api.extendLoan(loan._id);

              if (res.success) {
                Alert.alert(
                  'Амжилттай',
                  res.message || 'Зээл амжилттай сунгагдлаа',
                  [{ text: 'За', onPress: () => loadLoanDetail() }]
                );
              }
            } catch (error) {
              Alert.alert('Алдаа', error.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return colors.green;
      case 'overdue':
        return colors.error;
      case 'disbursed':
      case 'active':
        return colors.primary;
      case 'approved':
        return colors.warning;
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Хүлээгдэж байна';
      case 'approved':
        return 'Зөвшөөрөгдсөн';
      case 'rejected':
        return 'Татгалзсан';
      case 'disbursed':
        return 'Олгогдсон';
      case 'active':
        return 'Идэвхтэй';
      case 'overdue':
        return 'Хугацаа хэтэрсэн';
      case 'paid':
        return 'Төлөгдсөн';
      case 'pending_disbursement':
        return 'Олгох хүлээгдэж байна';
      default:
        return status;
    }
  };

  const getTermText = (days) => {
    if (days === 14) return '14 хоног';
    if (days === 30) return '1 сар';
    if (days === 90) return '3 сар';
    return `${days} хоног`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Зээл олдсонгүй</Text>
      </View>
    );
  }

  // Зээл сунгах боломжтой эсэх
  const canExtend =
    loan.termDays !== 14 &&
    ['disbursed', 'active', 'overdue'].includes(loan.status);

  // Төлбөр төлөх боломжтой эсэх
  const canPay =
    ['disbursed', 'active', 'overdue'].includes(loan.status) &&
    loan.remainingAmount > 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээлийн дэлгэрэнгүй</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Status Badge */}
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

          {/* Loan Number */}
          <Text style={styles.loanNumber}>{loan.loanNumber}</Text>

          {/* Amount Card */}
          <Card style={styles.amountCard}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Зээлийн дүн</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(loan.disbursedAmount || loan.approvedAmount)}
              </Text>
            </View>

            {loan.remainingAmount > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Үлдэгдэл төлөх</Text>
                  <Text style={[styles.amountValue, { color: colors.primary }]}>
                    {formatCurrency(loan.remainingAmount)}
                  </Text>
                </View>
              </>
            )}
          </Card>

          {/* Details */}
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Хугацаа</Text>
              <Text style={styles.detailValue}>
                {getTermText(loan.termDays)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Хүү</Text>
              <Text style={styles.detailValue}>{loan.interestRate}%</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Хүүгийн дүн</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(loan.interest)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Нийт төлөх</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(loan.totalAmount)}
              </Text>
            </View>

            {loan.dueDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Төлөх хугацаа</Text>
                <Text style={styles.detailValue}>
                  {formatDate(loan.dueDate)}
                </Text>
              </View>
            )}

            {loan.extensionCount > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Сунгалтын тоо</Text>
                <Text style={styles.detailValue}>
                  {loan.extensionCount} удаа
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Огноо</Text>
              <Text style={styles.detailValue}>
                {formatDate(loan.createdAt)}
              </Text>
            </View>
          </Card>

          {/* Actions */}
          {canPay && (
            <Button
              title="Төлбөр төлөх"
              onPress={handleMakePayment}
              loading={actionLoading}
              style={styles.payButton}
            />
          )}

          {canExtend && (
            <Button
              title="Зээл сунгах"
              onPress={handleExtendLoan}
              loading={actionLoading}
              variant="outline"
              style={styles.extendButton}
            />
          )}

          {/* Info Note */}
          {canExtend && (
            <Card style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.infoText}>
                Зээл сунгах үед зөвхөн хүүгийн дүн төлөгдөнө. Үндсэн зээлийн дүн
                хэвээр үлдэнэ.
              </Text>
            </Card>
          )}

          {loan.termDays === 14 && (
            <Card style={[styles.infoCard, { backgroundColor: colors.warning + '10' }]}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.warning}
              />
              <Text style={[styles.infoText, { color: colors.warning }]}>
                14 хоногийн зээлийг сунгах боломжгүй.
              </Text>
            </Card>
          )}

          {/* Payment History */}
          {loan.payments && loan.payments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Төлбөрийн түүх</Text>
              {loan.payments.map((payment, index) => (
                <Card key={index} style={styles.paymentCard}>
                  <View style={styles.paymentRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.green}
                    />
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentAmount}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <Text style={styles.paymentDate}>
                        {formatDate(payment.date)}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loanNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 24,
  },
  amountCard: {
    padding: 20,
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: colors.lightGray,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray + '30',
    marginVertical: 16,
  },
  detailsCard: {
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.lightGray,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  payButton: {
    marginBottom: 12,
  },
  extendButton: {
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.primary + '10',
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.lightGray,
    lineHeight: 18,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 16,
  },
  paymentCard: {
    padding: 16,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 13,
    color: colors.lightGray,
  },
  errorText: {
    fontSize: 16,
    color: colors.lightGray,
  },
});