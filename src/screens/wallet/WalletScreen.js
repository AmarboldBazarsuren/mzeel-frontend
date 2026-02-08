// mzeel-app/src/screens/wallet/WalletScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import colors from '../../styles/colors';

export default function WalletScreen({ navigation }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Deposit modal
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  
  // ✅ Withdrawal modal
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const [walletRes, historyRes] = await Promise.all([
        api.getWallet(),
        api.getWalletHistory(1),
      ]);

      if (walletRes.success) {
        setWallet(walletRes.data.wallet);
      }

      if (historyRes.success) {
        setTransactions(historyRes.data.transactions);
      }
    } catch (error) {
      Alert.alert('Алдаа', 'Өгөгдөл татахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);

    if (!amount || amount < 1000) {
      Alert.alert('Алдаа', 'Хамгийн багадаа 1,000₮ цэнэглэх боломжтой');
      return;
    }

    try {
      setDepositLoading(true);
      const response = await api.createDeposit(amount);

      if (response.success) {
        Alert.alert(
          'Амжилттай',
          'QPay invoice үүсгэгдлээ. QPay апп ашиглан төлөөрэй.',
          [
            {
              text: 'За',
              onPress: () => {
                setDepositModal(false);
                setDepositAmount('');
                loadWallet();
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Алдаа', error.message || 'Invoice үүсгэхэд алдаа гарлаа');
    } finally {
      setDepositLoading(false);
    }
  };

  // ✅ Мөнгө татах function
  const handleWithdrawal = async () => {
    const amount = parseInt(withdrawalData.amount);

    // Validation
    if (!amount || amount < 1000) {
      Alert.alert('Алдаа', 'Хамгийн багадаа 1,000₮ татах боломжтой');
      return;
    }

    if (amount > wallet.balance) {
      Alert.alert('Алдаа', `Хэтэвчний үлдэгдэл хүрэлцэхгүй байна. Үлдэгдэл: ${formatCurrency(wallet.balance)}`);
      return;
    }

    if (!withdrawalData.bankName || !withdrawalData.accountNumber || !withdrawalData.accountName) {
      Alert.alert('Алдаа', 'Бүх талбарыг бөглөнө үү');
      return;
    }

    try {
      setWithdrawalLoading(true);
      const response = await api.createWithdrawal(withdrawalData);

      if (response.success) {
        Alert.alert(
          'Амжилттай',
          'Таны хүсэлтийг хүлээн авлаа. Удахгүй боловсруулагдана.',
          [
            {
              text: 'За',
              onPress: () => {
                setWithdrawalModal(false);
                setWithdrawalData({
                  amount: '',
                  bankName: '',
                  accountNumber: '',
                  accountName: '',
                });
                loadWallet();
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Алдаа', error.message || 'Хүсэлт илгээхэд алдаа гарлаа');
    } finally {
      setWithdrawalLoading(false);
    }
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
        <Text style={styles.headerTitle}>Хэтэвч</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Нийт үлдэгдэл</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(wallet?.balance || 0)}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Нийт цэнэглэлт</Text>
              <Text style={styles.statValue}>{formatCurrency(wallet?.totalDeposit || 0)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Нийт зарцуулалт</Text>
              <Text style={styles.statValue}>{formatCurrency(wallet?.totalWithdrawal || 0)}</Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setDepositModal(true)}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="add" size={24} color={colors.white} />
            </View>
            <Text style={styles.actionText}>Цэнэглэх</Text>
          </TouchableOpacity>

          {/* ✅ Татах button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setWithdrawalModal(true)}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="arrow-down" size={24} color={colors.white} />
            </View>
            <Text style={styles.actionText}>Татах</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Гүйлгээний түүх</Text>

          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>Гүйлгээ байхгүй байна</Text>
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
                    <Text
                      style={[
                        styles.transactionStatus,
                        { color: transaction.status === 'completed' ? colors.green : colors.warning },
                      ]}
                    >
                      {transaction.status === 'completed'
                        ? 'Амжилттай'
                        : transaction.status === 'pending'
                        ? 'Хүлээгдэж байна'
                        : 'Цуцлагдсан'}
                    </Text>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                              ? colors.green
                              : colors.white,
                        },
                      ]}
                    >
                      {transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                        ? '+'
                        : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* ✅ Deposit Modal - KeyboardAvoidingView нэмэх */}
      <Modal
        visible={depositModal}
        transparent
        animationType="slide"
        onRequestClose={() => setDepositModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Хэтэвч цэнэглэх</Text>
              <TouchableOpacity onPress={() => setDepositModal(false)}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.infoText}>
                💳 QPay ашиглан цэнэглэх дүнгээ оруулна уу
              </Text>
            </View>

            <Input
              label="Дүн (₮)"
              placeholder="50000"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="number-pad"
            />

            <Text style={styles.modalNote}>
              ℹ️ Хамгийн багадаа 1,000₮ цэнэглэх боломжтой
            </Text>

            <Button
              title="Үргэлжлүүлэх"
              onPress={handleDeposit}
              loading={depositLoading}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ✅ ШИНЭ: Withdrawal Modal */}
      <Modal
        visible={withdrawalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setWithdrawalModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Мөнгө татах</Text>
                <TouchableOpacity onPress={() => setWithdrawalModal(false)}>
                  <Ionicons name="close" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalInfo}>
                <Text style={styles.infoText}>
                  💰 Үлдэгдэл: {formatCurrency(wallet?.balance || 0)}
                </Text>
              </View>

              <Input
                label="Татах дүн (₮)"
                placeholder="50000"
                value={withdrawalData.amount}
                onChangeText={(text) => setWithdrawalData({ ...withdrawalData, amount: text })}
                keyboardType="number-pad"
              />

              <Input
                label="Банкны нэр"
                placeholder="Жишээ: Хаан банк"
                value={withdrawalData.bankName}
                onChangeText={(text) => setWithdrawalData({ ...withdrawalData, bankName: text })}
              />

              <Input
                label="Дансны дугаар"
                placeholder="1234567890"
                value={withdrawalData.accountNumber}
                onChangeText={(text) => setWithdrawalData({ ...withdrawalData, accountNumber: text })}
                keyboardType="number-pad"
              />

              <Input
                label="Дансны эзэмшигч"
                placeholder="Овог Нэр"
                value={withdrawalData.accountName}
                onChangeText={(text) => setWithdrawalData({ ...withdrawalData, accountName: text })}
              />

              <Text style={styles.modalNote}>
                ℹ️ Таны хүсэлтийг 1-2 хоногт боловсруулна
              </Text>

              <Button
                title="Хүсэлт илгээх"
                onPress={handleWithdrawal}
                loading={withdrawalLoading}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  balanceCard: {
    margin: 20,
    padding: 24,
  },
  balanceLabel: {
    color: colors.lightGray,
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: colors.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.gray,
    marginHorizontal: 16,
  },
  statLabel: {
    color: colors.lightGray,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: colors.white,
    fontSize: 14,
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
    marginBottom: 4,
  },
  transactionDate: {
    color: colors.lightGray,
    fontSize: 12,
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 11,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalScrollContent: {
    flexGrow: 1,
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
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  modalInfo: {
    backgroundColor: colors.darkGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    color: colors.lightGray,
    fontSize: 13,
    lineHeight: 18,
  },
  modalNote: {
    color: colors.lightGray,
    fontSize: 12,
    marginBottom: 16,
    marginTop: -8,
  },
});