// mzeel-app/src/navigation/MainNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import LoanListScreen from '../screens/loans/LoanListScreen';
import LoanDetailScreen from '../screens/loans/LoanDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// Wallet Stack - ✅ ШИНЭ
function WalletStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletMain" component={WalletScreen} />
    </Stack.Navigator>
  );
}

// Loans Stack
function LoansStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoanList" component={LoanListScreen} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Wallet') {
            // ✅ Settings → Wallet болгох
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Loans') {
            iconName = focused ? 'card' : 'card-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopColor: colors.darkGray,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Нүүр',
        }}
      />
      
      {/* ✅ Settings → Wallet болгох */}
      <Tab.Screen
        name="Wallet"
        component={WalletStack}
        options={{
          tabBarLabel: 'Хэтэвч',
        }}
      />
      
      <Tab.Screen
        name="Loans"
        component={LoansStack}
        options={{
          tabBarLabel: 'Зээл',
        }}
      />
    </Tab.Navigator>
  );
}