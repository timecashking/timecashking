import React from 'react';
import { apiGet, apiPost, normAmount } from '../api';

function Section({ title, children }: { title: string; children: any }) {
	return (
		<div style={{ padding: 24 }}>
			<h2>{title}</h2>
			{children}
		</div>
	);
}

export function Transactions() {
	const [type, setType] = React.useState('INCOME');
	const [amount, setAmount] = React.useState('');
	const [desc, setDesc] = React.useState('');
	const [items, setItems] = React.useState<any[]>([]);
	
	const create = async () => {
		await apiPost('/transactions', { type, amount: normAmount(amount), description: desc });
		setAmount('');
		setDesc('');
		load();
	};
	const load = async () => setItems(await apiGet('/transactions'));
	
	React.useEffect(() => {
		load();
	}, []);
	
	return (
		<Section title="Transações">
			<div>
				<select value={type} onChange={e => setType(e.target.value)}>
					<option value="INCOME">Receita</option>
					<option value="EXPENSE">Despesa</option>
				</select>
				<input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Valor" />
				<input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição" />
				<button onClick={create}>Criar</button>
				<button onClick={load}>Listar</button>
			</div>
			<pre>{JSON.stringify(items, null, 2)}</pre>
		</Section>
	);
}
