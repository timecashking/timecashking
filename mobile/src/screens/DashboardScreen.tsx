import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Surface,
  Chip,
  Avatar,
} from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Transaction } from '../types';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const { state } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, transactionsData] = await Promise.all([
        apiService.getSummary(selectedPeriod),
        apiService.getTransactions(1, 5),
      ]);
      
      setSummary(summaryData);
      setRecentTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTransactionIcon = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME' ? '💰' : '💸';
  };

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const pieData = [
    {
      name: 'Receitas',
      population: summary?.totalIncome || 0,
      color: '#10b981',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Despesas',
      population: summary?.totalExpense || 0,
      color: '#ef4444',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Text size={40} label={state.user?.name?.charAt(0) || 'U'} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Olá, {state.user?.name}</Text>
            <Text style={styles.userEmail}>{state.user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.periodSelector}>
        <Chip
          selected={selectedPeriod === 'week'}
          onPress={() => setSelectedPeriod('week')}
          style={styles.periodChip}
        >
          Semana
        </Chip>
        <Chip
          selected={selectedPeriod === 'month'}
          onPress={() => setSelectedPeriod('month')}
          style={styles.periodChip}
        >
          Mês
        </Chip>
        <Chip
          selected={selectedPeriod === 'year'}
          onPress={() => setSelectedPeriod('year')}
          style={styles.periodChip}
        >
          Ano
        </Chip>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Resumo Financeiro</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={styles.summaryValueIncome}>
                {formatCurrency(summary?.totalIncome || 0)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={styles.summaryValueExpense}>
                {formatCurrency(summary?.totalExpense || 0)}
              </Text>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Saldo</Text>
            <Text style={[
              styles.balanceValue,
              { color: (summary?.balance || 0) >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {formatCurrency(summary?.balance || 0)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Evolução Financeira</Text>
          <LineChart
            data={chartData}
            width={width - 80}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#10b981',
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.pieChartCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Distribuição</Text>
          <PieChart
            data={pieData}
            width={width - 80}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card.Content>
      </Card>

      <Card style={styles.transactionsCard}>
        <Card.Content>
          <View style={styles.transactionsHeader}>
            <Text style={styles.cardTitle}>Transações Recentes</Text>
            <Button mode="text" onPress={() => {}}>
              Ver todas
            </Button>
          </View>
          
          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          ) : (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Text style={styles.transactionEmoji}>
                    {getTransactionIcon(transaction.type)}
                  </Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description || 'Transação'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'INCOME' ? '#10b981' : '#ef4444' }
                ]}>
                  {transaction.type === 'EXPENSE' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {}}
          style={styles.quickActionButton}
        >
          Nova Transação
        </Button>
        <Button
          mode="outlined"
          icon="chart-line"
          onPress={() => {}}
          style={styles.quickActionButton}
        >
          Relatórios
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
  },
  periodChip: {
    marginRight: 8,
  },
  summaryCard: {
    margin: 20,
    marginTop: 0,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValueIncome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  summaryValueExpense: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  balanceContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartCard: {
    margin: 20,
    marginTop: 0,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieChartCard: {
    margin: 20,
    marginTop: 0,
    elevation: 2,
  },
  transactionsCard: {
    margin: 20,
    marginTop: 0,
    elevation: 2,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
});
