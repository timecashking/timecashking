'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Filter,
  Search,
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Estado inicial das transações
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', description: 'Venda de Produto A', amount: 450.00, date: '15/01/2024', category: 'Vendas' },
    { id: 2, type: 'expense', description: 'Compra de Material', amount: -120.00, date: '14/01/2024', category: 'Compras' },
  ]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const balance = totalIncome - totalExpenses;

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#000000', minHeight: '100vh' }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(90deg, #FCD34D, #D97706)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0,
        marginBottom: '0.5rem'
      }}>
        Finanças
      </h1>
      <p style={{ color: '#9CA3AF', fontSize: '1rem', margin: 0 }}>
        Gerencie suas receitas e despesas
      </p>
    </div>
  );
}
