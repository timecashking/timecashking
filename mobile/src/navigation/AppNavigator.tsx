import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { IconButton } from 'react-native-paper';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens for other tabs
const TransactionsScreen = () => null;
const ReportsScreen = () => null;
const NotificationsScreen = () => null;
const ProfileScreen = () => null;

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard';
              break;
            case 'Transações':
              iconName = 'swap-horizontal';
              break;
            case 'Relatórios':
              iconName = 'chart-line';
              break;
            case 'Notificações':
              iconName = 'bell';
              break;
            case 'Perfil':
              iconName = 'account';
              break;
            default:
              iconName = 'circle';
          }

          return <IconButton icon={iconName} size={size} iconColor={color} />;
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#10b981',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: 'TimeCash King',
        }}
      />
      <Tab.Screen
        name="Transações"
        component={TransactionsScreen}
        options={{
          title: 'Transações',
        }}
      />
      <Tab.Screen
        name="Relatórios"
        component={ReportsScreen}
        options={{
          title: 'Relatórios',
        }}
      />
      <Tab.Screen
        name="Notificações"
        component={NotificationsScreen}
        options={{
          title: 'Notificações',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { state } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {state.isAuthenticated ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
