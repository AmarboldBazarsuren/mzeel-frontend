// frontend/src/screens/loans/PayLoanScreen.js

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

export default function PayLoanScreen({ navigation, route }) {
  const { loan: initialLoan } = route.params;
  
  const [loan, setLoan] = useState(initialLoan);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [loanRes, walletRes] = await Promise.all([
        api.getLoanById(loan._id),
        api.getWallet(),
      ]);

      if (loanRes.success) setLoan(loanRes.data.loan);
      if (walletRes.success) setWallet(walletRes.data.wallet);
    } catch (error) {
      Alert.alert('Алдаа', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Зээл төлөх (НИЙТ ДҮН)
  const handlePayLoan = () => {
    if (!wallet) {
      Alert.alert('Алдаа', 'Хэтэвчийн мэдээлэл олдсонгүй');
      return;
    }

    if (wallet.balance < loan.remainingAmount) {
      Alert.alert(
        'Үлдэгдэл хүрэлцэхгүй',
        `Таны хэтэвчний үлдэгдэл: ${formatCurrency(wallet.balance)}\n` +
        `Төлөх дүн: ${formatCurrency(loan.remainingAmount)}\n\n` +
        `Та эхлээд хэтэвчээ цэнэглэнэ үү.`,
        [{ text: 'За' }]
      );
      return;
    }

    Alert.alert(
      'Зээл төлөх',
      `Үлдэгдэл бүтэн төлөх уу?\n\n` +
      `Төлөх дүн: ${formatCurrency(loan.remainingAmount)}\n` +
      `Таны үлдэгдэл: ${formatCurrency(wallet.balance)}\n` +
      `Шинэ үлдэгдэл: ${formatCurrency(wallet.balance - loan.remainingAmount)}`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Төлөх',
          style: 'default',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await api.makePayment({
                loanId: loan._id,
                amount: loan.remainingAmount,
              });

              if (res.success) {
                Alert.alert(
                  'Амжилттай',
                  'Зээл бүтэн төлөгдлөө!',
                  [
                    {
                      text: 'За',
                      onPress: () => navigation.navigate('Home'),
                    },
                  ]
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

  // ✅ Зээл сунгах
  const handleExtendLoan = () => {
    if (loan.termDays === 14) {
      Alert.alert('Анхааруулга', '14 хоногийн зээлийг сунгах боломжгүй');
      return;
    }

    if ((loan.extensionCount || 0) >= 5) {
      Alert.alert('Анхааруулга', 'Зээл 5-аас илүү удаа сунгах боломжгүй');
      return;
    }

    const tenPercent = Math.round(loan.totalAmount * 0.1);
    const newRemainingAmount = loan.remainingAmount - tenPercent;
    const extensionInterest = Math.round(newRemainingAmount * (loan.interestRate / 100));
    const extensionDays = loan.termDays || 30;
    
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + extensionDays);

    if (!wallet || wallet.balance < tenPercent) {
      Alert.alert(
        'Үлдэгдэл хүрэлцэхгүй',
        `10% төлбөр: ${formatCurrency(tenPercent)}\n` +
        `Таны үлдэгдэл: ${formatCurrency(wallet?.balance || 0)}\n\n` +
        `Та эхлээд хэтэвчээ цэнэглэнэ үү.`,
        [{ text: 'За' }]
      );
      return;
    }

    Alert.alert(
      'Зээл сунгах',
      `Зээлийн хугацааг ${extensionDays} хоногоор сунгах уу?\n\n` +
      `📌 Одоо төлөх: ${formatCurrency(tenPercent)} (10%)\n` +
      `📌 Шинэ хүү: ${formatCurrency(extensionInterest)}\n` +
      `📌 Шинэ үлдэгдэл: ${formatCurrency(newRemainingAmount + extensionInterest)}\n` +
      `📌 Шинэ хугацаа: ${formatDate(newDueDate)}\n\n` +
      `⚠️ Таны хэтэвчнээс ${formatCurrency(tenPercent)} шууд хасагдана.`,
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
                  [
                    {
                      text: 'За',
                      onPress: () => navigation.navigate('Home'),
                    },
                  ]
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const canExtend =
    loan.termDays !== 14 &&
    (loan.extensionCount || 0) < 5 &&
    ['disbursed', 'active', 'overdue'].includes(loan.status);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээл төлөх</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Loan Info */}
          <Card style={styles.loanCard}>
            <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
            <Text style={styles.loanDate}>{formatDate(loan.createdAt)}</Text>
          </Card>

          {/* Amount Card (LOCKED) */}
          <Card style={styles.amountCard}>
            <View style={styles.lockHeader}>
              <Ionicons name="lock-closed" size={20} color={colors.primary} />
              <Text style={styles.lockText}>Төлөх дүн (lock)</Text>
            </View>

            <Text style={styles.amountBig}>
              {formatCurrency(loan.remainingAmount)}
            </Text>

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
                <Text style={styles.infoValue}>
                  {formatDate(loan.dueDate)}
                </Text>
              </View>
            )}
          </Card>

          {/* Wallet Balance */}
          <Card style={styles.walletCard}>
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Таны хэтэвчийн үлдэгдэл</Text>
              <Text style={[
                styles.walletBalance,
                wallet && wallet.balance < loan.remainingAmount && { color: colors.error }
              ]}>
                {formatCurrency(wallet?.balance || 0)}
              </Text>
            </View>

            {wallet && wallet.balance < loan.remainingAmount && (
              <Text style={styles.warningText}>
                ⚠️ Үлдэгдэл хүрэлцэхгүй байна. Эхлээд цэнэглэнэ үү.
              </Text>
            )}
          </Card>

          {/* Зээл төлөх товч */}
          <Button
            title="Зээл төлөх"
            onPress={handlePayLoan}
            loading={actionLoading}
            disabled={!wallet || wallet.balance < loan.remainingAmount}
            style={styles.payButton}
          />

          {/* Зээл сунгах товч */}
          {canExtend && (
            <Button
              title="Зээл сунгах (10% төлбөртэй)"
              onPress={handleExtendLoan}
              loading={actionLoading}
              variant="outline"
              style={styles.extendButton}
            />
          )}

          {/* Info */}
          <Card style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoCardText}>
              {canExtend
                ? `Зээл сунгахад нийт дүнгийн 10%-ийг одоо төлнө. Үлдэгдэл дээр шинэ хүү бодогдоно.`
                : `Зээл бүрэн төлөх шаардлагатай. Хэтэвчний үлдэгдэл хүрэлцэхгүй бол эхлээд цэнэглэнэ үү.`}
            </Text>
          </Card>
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
  loanCard: {
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  loanNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  loanDate: {
    fontSize: 13,
    color: colors.lightGray,
  },
  amountCard: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  lockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  lockText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  amountBig: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray + '30',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  walletCard: {
    padding: 20,
    marginBottom: 24,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 14,
    color: colors.lightGray,
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.green,
  },
  warningText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 12,
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
    gap: 12,
  },
  infoCardText: {
    flex: 1,
    fontSize: 13,
    color: colors.lightGray,
    lineHeight: 18,
  },
});