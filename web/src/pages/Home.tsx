import React from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';

export const API = (import.meta.env.VITE_API_URL as string) || 'https://timecashking-api.onrender.com';

export function Home() {
	const login = () => (location.href = API.replace(/\/$/, '') + '/integrations/google/auth');
	const [me, setMe] = React.useState<any>(null);
	
	React.useEffect(() => {
		// Try to load user info on mount
		apiGet('/me').then(setMe).catch(() => {});
	}, []);

	return (
		<div style={{ padding: 24 }}>
			<nav style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
				<Link to="/">Home</Link>
				<Link to="/categories">Categorias</Link>
				<Link to="/transactions">Transações</Link>
				<Link to="/summary">Resumo</Link>
				{me?.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
				{(me?.role === 'ADMIN' || me?.role === 'MANAGER') && <Link to="/manager">Manager</Link>}
			</nav>
			
			<h1>TimeCash King</h1>
			<p>API: {API}</p>
			
			{!me ? (
				<button onClick={login}>Login com Google</button>
			) : (
				<div>
					<p>Bem-vindo, {me.name} ({me.role})</p>
					<button onClick={async () => setMe(await apiGet('/me'))}>Atualizar</button>
					<button 
						onClick={async () => {
							await fetch(API + '/auth/logout', { method: 'POST', credentials: 'include' });
							setMe(null);
						}}
						style={{ marginLeft: 8 }}
					>
						Logout
					</button>
				</div>
			)}
			
			<pre>{JSON.stringify(me, null, 2)}</pre>
		</div>
	);
}
