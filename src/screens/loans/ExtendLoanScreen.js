// frontend/src/screens/loans/ExtendLoanScreen.js

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

export default function ExtendLoanScreen({ navigation, route }) {
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

  // ✅ ШИНЭ ЛОГИК: 10% төлөлт тооцоолох
  const calculateExtension = () => {
    // Үлдэгдэл зээл дээрх 10% төлөлт
    const tenPercent = Math.round(loan.remainingAmount * 0.1);
    
    // 10% төлсний дараах үлдэгдэл
    const newRemainingAfterPayment = loan.remainingAmount - tenPercent;
    
    // Шинэ хүү тооцоолох (3.2% эсвэл loan.interestRate)
    const newInterest = Math.round(newRemainingAfterPayment * (loan.interestRate / 100));
    
    // Нийт үлдэгдэл (10% төлсний дараа + шинэ хүү)
    const totalRemainingAfterExtension = newRemainingAfterPayment + newInterest;
    
    // Сунгах хугацаа
    const extensionDays = loan.termDays || 30;
    
    // Шинэ дуусах хугацаа
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + extensionDays);

    return {
      tenPercent,
      newRemainingAfterPayment,
      newInterest,
      totalRemainingAfterExtension,
      extensionDays,
      newDueDate,
    };
  };

  const extData = calculateExtension();

  const handleExtendLoan = () => {
    if (!wallet || wallet.balance < extData.tenPercent) {
      Alert.alert(
        'Үлдэгдэл хүрэлцэхгүй',
        `10% төлбөр: ${formatCurrency(extData.tenPercent)}\n` +
        `Таны үлдэгдэл: ${formatCurrency(wallet?.balance || 0)}\n\n` +
        `Та эхлээд хэтэвчээ цэнэглэнэ үү.`,
        [{ text: 'За' }]
      );
      return;
    }

    Alert.alert(
      'Зээл сунгах',
      `Зээлийн хугацааг ${extData.extensionDays} хоногоор сунгах уу?\n\n` +
      `📌 Одоо төлөх 10%: ${formatCurrency(extData.tenPercent)}\n` +
      `📌 10% төлсний дараах үлдэгдэл: ${formatCurrency(extData.newRemainingAfterPayment)}\n` +
      `📌 Шинэ хүү (${loan.interestRate}%): ${formatCurrency(extData.newInterest)}\n` +
      `📌 Нийт үлдэгдэл: ${formatCurrency(extData.totalRemainingAfterExtension)}\n` +
      `📌 Шинэ хугацаа: ${formatDate(extData.newDueDate)}\n\n` +
      `⚠️ Таны хэтэвчнээс ${formatCurrency(extData.tenPercent)} шууд хасагдана.`,
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээл сунгах</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Loan Info */}
          <Card style={styles.loanCard}>
            <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
            <Text style={styles.loanDate}>{formatDate(loan.createdAt)}</Text>
          </Card>

          {/* Current Remaining */}
          <Card style={styles.remainingCard}>
            <Text style={styles.remainingLabel}>Одоогийн үлдэгдэл</Text>
            <Text style={styles.remainingAmount}>
              {formatCurrency(loan.remainingAmount)}
            </Text>
          </Card>

          {/* Extension Calculation */}
          <Card style={styles.calcCard}>
            <Text style={styles.calcTitle}>Сунгалтын тооцоо</Text>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>10% төлөлт (lock)</Text>
              <Text style={styles.calcValue}>
                {formatCurrency(extData.tenPercent)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>10% төлсний дараах үлдэгдэл</Text>
              <Text style={styles.calcValue}>
                {formatCurrency(extData.newRemainingAfterPayment)}
              </Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Шинэ хүү ({loan.interestRate}%)</Text>
              <Text style={styles.calcValue}>
                {formatCurrency(extData.newInterest)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.calcRow}>
              <Text style={styles.calcLabelBold}>Нийт үлдэгдэл</Text>
              <Text style={styles.calcValueBold}>
                {formatCurrency(extData.totalRemainingAfterExtension)}
              </Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Шинэ хугацаа</Text>
              <Text style={styles.calcValue}>
                {formatDate(extData.newDueDate)}
              </Text>
            </View>
          </Card>

          {/* Wallet Balance */}
          <Card style={styles.walletCard}>
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Таны хэтэвчийн үлдэгдэл</Text>
              <Text style={[
                styles.walletBalance,
                wallet && wallet.balance < extData.tenPercent && { color: colors.error }
              ]}>
                {formatCurrency(wallet?.balance || 0)}
              </Text>
            </View>

            {wallet && wallet.balance < extData.tenPercent && (
              <Text style={styles.warningText}>
                ⚠️ Үлдэгдэл хүрэлцэхгүй байна. Эхлээд цэнэглэнэ үү.
              </Text>
            )}
          </Card>

          {/* Extend Button */}
          <Button
            title="Зээл сунгах"
            onPress={handleExtendLoan}
            loading={actionLoading}
            disabled={!wallet || wallet.balance < extData.tenPercent}
          />

          {/* Info */}
          <Card style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoCardText}>
              Зээл сунгахад үлдэгдэл зээлийн 10%-ийг одоо төлнө. Үлдсэн дүн дээр шинэ хүү бодогдоно.
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
  remainingCard: {
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  remainingLabel: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: 8,
  },
  remainingAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
  },
  calcCard: {
    padding: 20,
    marginBottom: 16,
  },
  calcTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 16,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calcLabel: {
    fontSize: 14,
    color: colors.lightGray,
  },
  calcValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  calcLabelBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  calcValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray + '30',
    marginVertical: 12,
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
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.primary + '10',
    marginTop: 16,
    gap: 12,
  },
  infoCardText: {
    flex: 1,
    fontSize: 13,
    color: colors.lightGray,
    lineHeight: 18,
  },
});