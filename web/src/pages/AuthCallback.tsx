import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function AuthCallback() {
	const [sp] = useSearchParams();
	const nav = useNavigate();
	
	React.useEffect(() => {
		const t = sp.get('token');
		if (t) localStorage.setItem('tck_jwt', t);
		nav('/');
	}, [sp, nav]);
	
	return <div style={{ padding: 24 }}>Autenticando...</div>;
}
