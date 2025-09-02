import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { Transactions } from './pages/Transactions';
import { Summary } from './pages/Summary';
import { AuthCallback } from './pages/AuthCallback';
import { Admin } from './pages/Admin';
import { Manager } from './pages/Manager';
import { Reports } from './pages/Reports';
import { Subscription } from './pages/Subscription';
import { Notifications } from './pages/Notifications';
import { Companies } from './pages/Companies';
import { Accounts } from './pages/Accounts';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Purchases } from './pages/Purchases';
import { Schedule } from './pages/Schedule';
import { Bills } from './pages/Bills';
import { CreditCardInvoices } from './pages/CreditCardInvoices';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />,
	},
	{
		path: '/companies',
		element: <Companies />,
	},
	{
		path: '/accounts',
		element: <Accounts />,
	},
	{
		path: '/categories',
		element: <Categories />,
	},
	{
		path: '/transactions',
		element: <Transactions />,
	},
	{
		path: '/bills',
		element: <Bills />,
	},
	{
		path: '/credit-card-invoices',
		element: <CreditCardInvoices />,
	},
	{
		path: '/products',
		element: <Products />,
	},
	{
		path: '/inventory',
		element: <Inventory />,
	},
	{
		path: '/sales',
		element: <Sales />,
	},
	{
		path: '/purchases',
		element: <Purchases />,
	},
	{
		path: '/schedule',
		element: <Schedule />,
	},
	{
		path: '/summary',
		element: <Summary />,
	},
	{
		path: '/reports',
		element: <Reports />,
	},
	{
		path: '/subscription',
		element: <Subscription />,
	},
	{
		path: '/subscription/success',
		element: <Subscription />,
	},
	{
		path: '/subscription/cancel',
		element: <Subscription />,
	},
	{
		path: '/notifications',
		element: <Notifications />,
	},
	{
		path: '/auth/callback',
		element: <AuthCallback />,
	},
	{
		path: '/admin',
		element: <Admin />,
	},
	{
		path: '/manager',
		element: <Manager />,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')!).render(<App />);




