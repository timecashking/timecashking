import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home } from './pages/Home';
import { Companies } from './pages/Companies';
import { Accounts } from './pages/Accounts';
import { Categories } from './pages/Categories';
import { Transactions } from './pages/Transactions';
import { Bills } from './pages/Bills';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Purchases } from './pages/Purchases';
import { Schedule } from './pages/Schedule';
import { Summary } from './pages/Summary';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { Subscription } from './pages/Subscription';
import { Manager } from './pages/Manager';
import { Admin } from './pages/Admin';
import { AuthCallback } from './pages/AuthCallback';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/manager" element={<Manager />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
