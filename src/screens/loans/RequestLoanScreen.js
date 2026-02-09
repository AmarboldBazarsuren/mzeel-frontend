// frontend/src/screens/loans/RequestLoanScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import colors from '../../styles/colors';
import { formatCurrency } from '../../utils/formatters';

export default function RequestLoanScreen({ navigation, route }) {
  const { profile } = route.params || {};
  
  const [amount, setAmount] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(30); // 1 сар default
  const [loading, setLoading] = useState(false);
  
  // Хүү нөхцөл
  const termOptions = [
    { days: 14, label: '14 хоног', rate: 2.8 },
    { days: 30, label: '1 сар', rate: 3.2 },
    { days: 90, label: '3 сар', rate: 3.8 },
  ];

  const selectedOption = termOptions.find(opt => opt.days === selectedTerm);
  
  // Тооцоолох
  const loanAmount = parseInt(amount) || 0;
  const interest = Math.round(loanAmount * (selectedOption.rate / 100));
  const totalRepayment = loanAmount + interest;
  
  // Хугацаа тооцоолох
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + selectedTerm);

  const handleSubmit = async () => {
    if (!loanAmount || loanAmount < 10000) {
      Alert.alert('Алдаа', 'Хамгийн багадаа 10,000₮');
      return;
    }
    
    if (loanAmount > profile?.availableLoanLimit) {
      Alert.alert('Алдаа', `Дээд хэмжээ: ${formatCurrency(profile?.availableLoanLimit)}`);
      return;
    }

    try {
      setLoading(true);
      const res = await api.requestApprovedLoan(loanAmount);
      
      if (res.success) {
        Alert.alert(
          'Амжилттай',
          'Зээлийн хүсэлт илгээгдлээ. Админ зөвшөөрнө.',
          [{ text: 'За', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('Алдаа', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээл авах</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Зээлийн эрх */}
          <View style={styles.limitCard}>
            <Text style={styles.limitLabel}>Таны зээлийн эрх</Text>
            <Text style={styles.limitAmount}>
              {formatCurrency(profile?.availableLoanLimit || 0)}
            </Text>
          </View>

          {/* Дүн оруулах */}
          <Input
            label="Зээлийн дүн (₮)"
            placeholder="100000"
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
          />

          {/* Хугацаа сонгох */}
          <Text style={styles.sectionLabel}>Хугацаа сонгох</Text>
          <View style={styles.termOptions}>
            {termOptions.map((option) => (
              <TouchableOpacity
                key={option.days}
                style={[
                  styles.termButton,
                  selectedTerm === option.days && styles.termButtonActive
                ]}
                onPress={() => setSelectedTerm(option.days)}
              >
                <Text style={[
                  styles.termLabel,
                  selectedTerm === option.days && styles.termLabelActive
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.termRate,
                  selectedTerm === option.days && styles.termRateActive
                ]}>
                  {option.rate}% хүү
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Тооцоо */}
          {loanAmount > 0 && (
            <View style={styles.calculationCard}>
              <Text style={styles.calcTitle}>Зээлийн мэдээлэл</Text>
              
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Зээлийн дүн</Text>
                <Text style={styles.calcValue}>{formatCurrency(loanAmount)}</Text>
              </View>

              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Хүү ({selectedOption.rate}%)</Text>
                <Text style={styles.calcValue}>{formatCurrency(interest)}</Text>
              </View>

              <View style={styles.calcDivider} />

              <View style={styles.calcRow}>
                <Text style={styles.calcLabelBold}>Нийт төлөх</Text>
                <Text style={styles.calcValueBold}>{formatCurrency(totalRepayment)}</Text>
              </View>

              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Төлөх хугацаа</Text>
                <Text style={styles.calcValue}>
                  {dueDate.toLocaleDateString('mn-MN')}
                </Text>
              </View>
            </View>
          )}

          {/* Submit */}
          <Button
            title="Зээл авах"
            onPress={handleSubmit}
            loading={loading}
            disabled={!loanAmount || loanAmount < 10000}
          />

          <Text style={styles.note}>
            ℹ️ Зээл авсны дараа админ баталгаажуулах шаардлагатай.
          </Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  content: {
    padding: 20,
  },
  limitCard: {
    backgroundColor: colors.primary + '15',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  limitLabel: {
    color: colors.lightGray,
    fontSize: 14,
    marginBottom: 8,
  },
  limitAmount: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  termOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  termButton: {
    flex: 1,
    backgroundColor: colors.darkGray,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  termButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  termLabel: {
    color: colors.lightGray,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  termLabelActive: {
    color: colors.white,
  },
  termRate: {
    color: colors.gray,
    fontSize: 12,
  },
  termRateActive: {
    color: colors.primary,
  },
  calculationCard: {
    backgroundColor: colors.cardBg,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  calcTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calcLabel: {
    color: colors.lightGray,
    fontSize: 14,
  },
  calcValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  calcLabelBold: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  calcValueBold: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  calcDivider: {
    height: 1,
    backgroundColor: colors.gray + '30',
    marginVertical: 12,
  },
  note: {
    color: colors.lightGray,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
});