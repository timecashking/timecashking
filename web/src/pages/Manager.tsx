import React from 'react';
import { apiGet } from '../api';

function Section({ title, children }: { title: string; children: any }) {
	return (
		<div style={{ padding: 24 }}>
			<h2>{title}</h2>
			{children}
		</div>
	);
}

export function Manager() {
	const [users, setUsers] = React.useState<any[]>([]);
	const [selectedUserId, setSelectedUserId] = React.useState('');
	const [summary, setSummary] = React.useState<any>(null);
	const [startDate, setStartDate] = React.useState('');
	const [endDate, setEndDate] = React.useState('');
	
	const loadUsers = async () => setUsers(await apiGet('/admin/users'));
	const loadSummary = async () => {
		if (!selectedUserId) return;
		const params = new URLSearchParams();
		if (startDate) params.append('start', startDate);
		if (endDate) params.append('end', endDate);
		const data = await apiGet(`/manager/users/${selectedUserId}/summary?${params}`);
		setSummary(data);
	};
	
	React.useEffect(() => {
		loadUsers();
	}, []);
	
	React.useEffect(() => {
		if (selectedUserId) {
			loadSummary();
		}
	}, [selectedUserId, startDate, endDate]);
	
	return (
		<Section title="Manager - Resumos de Usuários">
			<div>
				<button onClick={loadUsers}>Atualizar Lista de Usuários</button>
			</div>
			
			<div style={{ marginTop: 16 }}>
				<h3>Selecionar Usuário</h3>
				<select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
					<option value="">Selecione um usuário</option>
					{users.map(user => (
						<option key={user.id} value={user.id}>
							{user.name} ({user.email})
						</option>
					))}
				</select>
			</div>
			
			{selectedUserId && (
				<div style={{ marginTop: 16 }}>
					<h3>Filtros de Período</h3>
					<input
						type="date"
						value={startDate}
						onChange={e => setStartDate(e.target.value)}
						placeholder="Data inicial"
					/>
					<input
						type="date"
						value={endDate}
						onChange={e => setEndDate(e.target.value)}
						placeholder="Data final"
					/>
					<button onClick={loadSummary}>Atualizar Resumo</button>
				</div>
			)}
			
			{summary && (
				<div style={{ marginTop: 16 }}>
					<h3>Resumo de {summary.user.name}</h3>
					<div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
						<div style={{ 
							background: '#10b981', 
							color: 'white', 
							padding: '12px 16px', 
							borderRadius: '8px',
							minWidth: '120px',
							textAlign: 'center'
						}}>
							Receitas: R$ {summary.totals.income.toFixed(2)}
						</div>
						<div style={{ 
							background: '#ef4444', 
							color: 'white', 
							padding: '12px 16px', 
							borderRadius: '8px',
							minWidth: '120px',
							textAlign: 'center'
						}}>
							Despesas: R$ {summary.totals.expense.toFixed(2)}
						</div>
						<div style={{ 
							background: summary.totals.balance >= 0 ? '#10b981' : '#ef4444', 
							color: 'white', 
							padding: '12px 16px', 
							borderRadius: '8px',
							minWidth: '120px',
							textAlign: 'center'
						}}>
							Saldo: R$ {summary.totals.balance.toFixed(2)}
						</div>
					</div>
					
					<h4>Por Categoria</h4>
					<table style={{ borderCollapse: 'collapse', width: '100%' }}>
						<thead>
							<tr>
								<th style={{ border: '1px solid #ddd', padding: 8 }}>Categoria</th>
								<th style={{ border: '1px solid #ddd', padding: 8 }}>Valor</th>
							</tr>
						</thead>
						<tbody>
							{summary.byCategory.map((cat: any, index: number) => (
								<tr key={index}>
									<td style={{ border: '1px solid #ddd', padding: 8 }}>{cat.category}</td>
									<td style={{ border: '1px solid #ddd', padding: 8 }}>
										R$ {cat.amount.toFixed(2)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Section>
	);
}
