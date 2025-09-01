import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { Transactions } from './pages/Transactions';
import { Summary } from './pages/Summary';
import { AuthCallback } from './pages/AuthCallback';
import { Admin } from './pages/Admin';
import { Manager } from './pages/Manager';
import { Reports } from './pages/Reports';
import { Subscription } from './pages/Subscription';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />,
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


