// mzeel-app/src/screens/loans/LoanDetailScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import colors from '../../styles/colors';

export default function LoanDetailScreen({ route, navigation }) {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    loadLoan();
  }, []);

  const loadLoan = async () => {
    try {
      setLoading(true);
      const response = await api.getLoanDetails(loanId);

      if (response.success) {
        setLoan(response.data.loan);
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Зээлийн мэдээлэл татахад алдаа гарлаа');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // mzeel-app/src/screens/loans/LoanDetailScreen.js
// Payment Modal доторх handlePayment function

const handlePayment = async () => {
  const amount = parseInt(paymentAmount);

  if (!amount || amount <= 0) {
    Alert.alert('Алдаа', 'Төлөх дүнгээ оруулна уу');
    return;
  }

  if (amount > loan.remainingAmount) {
    Alert.alert('Алдаа', `Үлдэгдэл ${formatCurrency(loan.remainingAmount)}`);
    return;
  }

  // ✅ Хэтэвчний үлдэгдэл шалгах
  try {
    const walletRes = await api.getWallet();
    if (!walletRes.success) {
      Alert.alert('Алдаа', 'Хэтэвчний мэдээлэл татахад алдаа гарлаа');
      return;
    }

    const wallet = walletRes.data.wallet;

    if (wallet.balance < amount) {
      Alert.alert(
        'Хэтэвчний үлдэгдэл хүрэлцэхгүй',
        `Таны хэтэвчинд ${formatCurrency(wallet.balance)} байна.\n\nЭхлээд ${formatCurrency(amount - wallet.balance)} цэнэглэх хэрэгтэй.`,
        [
          { text: 'Болих', style: 'cancel' },
          {
            text: 'Цэнэглэх',
            onPress: () => {
              setPaymentModal(false);
              navigation.navigate('Wallet');
            }
          }
        ]
      );
      return;
    }

    // Төлбөр төлөх
    if (!window.confirm(`${formatCurrency(amount)} төлөх үү?`)) return;

    setPaymentLoading(true);
    const response = await api.payLoan(loanId, amount);

    if (response.success) {
      Alert.alert('Амжилттай', 'Төлбөр амжилттай төлөгдлөө', [
        {
          text: 'За',
          onPress: () => {
            setPaymentModal(false);
            setPaymentAmount('');
            loadLoan();
          },
        },
      ]);
    }
  } catch (error) {
    Alert.alert('Алдаа', error.message || 'Төлбөр төлөхөд алдаа гарлаа');
  } finally {
    setPaymentLoading(false);
  }
};

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const canPay = ['disbursed', 'active', 'overdue'].includes(loan?.status);

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
        {/* Loan Number */}
        <View style={styles.loanNumberSection}>
          <Text style={styles.loanNumberLabel}>Зээлийн дугаар</Text>
          <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
        </View>

        {/* Main Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Төлөв</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              {loan.status === 'disbursed' && 'Олгогдсон'}
              {loan.status === 'active' && 'Идэвхтэй'}
              {loan.status === 'paid' && 'Төлөгдсөн'}
              {loan.status === 'approved' && 'Зөвшөөрөгдсөн'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Зээлийн дүн</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(loan.disbursedAmount || loan.approvedAmount)}
            </Text>
          </View>

          {loan.totalRepayment > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Нийт төлөх</Text>
                <Text style={styles.infoValue}>{formatCurrency(loan.totalRepayment)}</Text>
              </View>
            </>
          )}

          {loan.paidAmount > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Төлсөн</Text>
                <Text style={[styles.infoValue, { color: colors.green }]}>
                  {formatCurrency(loan.paidAmount)}
                </Text>
              </View>
            </>
          )}

          {loan.remainingAmount > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Үлдэгдэл</Text>
                <Text style={[styles.infoValue, { color: colors.primary, fontSize: 20 }]}>
                  {formatCurrency(loan.remainingAmount)}
                </Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Хүү</Text>
            <Text style={styles.infoValue}>{loan.interestRate}%</Text>
          </View>

          {loan.dueDate && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Төлөх хугацаа</Text>
                <Text style={styles.infoValue}>{formatDate(loan.dueDate)}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Dates Card */}
        <Card style={styles.datesCard}>
          <Text style={styles.cardTitle}>Огнооны мэдээлэл</Text>

          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.lightGray} />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Үүссэн</Text>
              <Text style={styles.dateValue}>{formatDate(loan.createdAt)}</Text>
            </View>
          </View>

          {loan.approvedAt && (
            <View style={styles.dateRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.green} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Зөвшөөрөгдсөн</Text>
                <Text style={styles.dateValue}>{formatDate(loan.approvedAt)}</Text>
              </View>
            </View>
          )}

          {loan.disbursedAt && (
            <View style={styles.dateRow}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Олгогдсон</Text>
                <Text style={styles.dateValue}>{formatDate(loan.disbursedAt)}</Text>
              </View>
            </View>
          )}

          {loan.paidAt && (
            <View style={styles.dateRow}>
              <Ionicons name="checkmark-done-outline" size={20} color={colors.green} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Төлөгдсөн</Text>
                <Text style={styles.dateValue}>{formatDate(loan.paidAt)}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Pay Button */}
        {canPay && (
          <View style={styles.buttonContainer}>
            <Button title="Төлбөр төлөх" onPress={() => setPaymentModal(true)} />
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={paymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Төлбөр төлөх</Text>
              <TouchableOpacity onPress={() => setPaymentModal(false)}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalLabel}>Үлдэгдэл</Text>
              <Text style={styles.modalValue}>{formatCurrency(loan?.remainingAmount || 0)}</Text>
            </View>

            <Input
              label="Төлөх дүн (₮)"
              placeholder="Дүнгээ оруулна уу"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="number-pad"
            />

            <Button title="Төлөх" onPress={handlePayment} loading={paymentLoading} />
          </View>
        </View>
      </Modal>
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
  loanNumberSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loanNumberLabel: {
    color: colors.lightGray,
    fontSize: 14,
    marginBottom: 8,
  },
  loanNumber: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoCard: {
    margin: 20,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: colors.lightGray,
    fontSize: 14,
  },
  infoValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray + '30',
    marginVertical: 12,
  },
  datesCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateInfo: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    color: colors.lightGray,
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    color: colors.white,
    fontSize: 14,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  modalInfo: {
    backgroundColor: colors.darkGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalLabel: {
    color: colors.lightGray,
    fontSize: 12,
    marginBottom: 4,
  },
  modalValue: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});