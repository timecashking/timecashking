import React from 'react';
import { apiGet, apiPost } from '../api';

function Section({ title, children }: { title: string; children: any }) {
	return (
		<div style={{ padding: 24 }}>
			<h2>{title}</h2>
			{children}
		</div>
	);
}

export function Categories() {
	const [list, setList] = React.useState<any[]>([]);
	const [name, setName] = React.useState('');
	const [id, setId] = React.useState('');
	const [newName, setNewName] = React.useState('');
	
	const load = async () => setList(await apiGet('/categories'));
	const create = async () => {
		await apiPost('/categories', { name });
		setName('');
		load();
	};
	const rename = async () => {
		await apiPost('/categories/' + id, { name: newName }).catch(async () => 
			await fetch(import.meta.env.VITE_API_URL + '/categories/' + id, { method: 'PATCH' })
		);
		load();
	};
	const remove = async () => {
		await fetch(import.meta.env.VITE_API_URL + '/categories/' + id, { method: 'DELETE', credentials: 'include' });
		load();
	};
	
	React.useEffect(() => {
		load();
	}, []);
	
	return (
		<Section title="Categorias">
			<div>
				<input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" />
				<button onClick={create}>Criar</button>
				<button onClick={load}>Listar</button>
			</div>
			<div style={{ marginTop: 8 }}>
				<input value={id} onChange={e => setId(e.target.value)} placeholder="ID" />
				<input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Novo nome" />
				<button onClick={rename}>Renomear</button>
				<button onClick={remove}>Excluir</button>
			</div>
			<pre>{JSON.stringify(list, null, 2)}</pre>
		</Section>
	);
}
