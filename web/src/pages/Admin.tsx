import React from 'react';
import { apiGet, apiPatch } from '../api';

function Section({ title, children }: { title: string; children: any }) {
	return (
		<div style={{ padding: 24 }}>
			<h2>{title}</h2>
			{children}
		</div>
	);
}

export function Admin() {
	const [users, setUsers] = React.useState<any[]>([]);
	const [selectedUserId, setSelectedUserId] = React.useState('');
	const [newRole, setNewRole] = React.useState('USER');
	
	const loadUsers = async () => setUsers(await apiGet('/admin/users'));
	const updateRole = async () => {
		await apiPatch(`/admin/users/${selectedUserId}/role`, { role: newRole });
		loadUsers();
		setSelectedUserId('');
		setNewRole('USER');
	};
	
	React.useEffect(() => {
		loadUsers();
	}, []);
	
	return (
		<Section title="Admin - Gerenciamento de Usuários">
			<div>
				<button onClick={loadUsers}>Atualizar Lista</button>
			</div>
			
			<div style={{ marginTop: 16 }}>
				<h3>Alterar Role</h3>
				<select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
					<option value="">Selecione um usuário</option>
					{users.map(user => (
						<option key={user.id} value={user.id}>
							{user.name} ({user.email}) - {user.role}
						</option>
					))}
				</select>
				<select value={newRole} onChange={e => setNewRole(e.target.value)}>
					<option value="USER">USER</option>
					<option value="MANAGER">MANAGER</option>
					<option value="ADMIN">ADMIN</option>
				</select>
				<button onClick={updateRole} disabled={!selectedUserId}>
					Alterar Role
				</button>
			</div>
			
			<div style={{ marginTop: 16 }}>
				<h3>Lista de Usuários</h3>
				<table style={{ borderCollapse: 'collapse', width: '100%' }}>
					<thead>
						<tr>
							<th style={{ border: '1px solid #ddd', padding: 8 }}>Nome</th>
							<th style={{ border: '1px solid #ddd', padding: 8 }}>Email</th>
							<th style={{ border: '1px solid #ddd', padding: 8 }}>Role</th>
							<th style={{ border: '1px solid #ddd', padding: 8 }}>Categorias</th>
							<th style={{ border: '1px solid #ddd', padding: 8 }}>Transações</th>
							<th style={{ border: '1px solid #ddd', padding: 8 }}>Criado em</th>
						</tr>
					</thead>
					<tbody>
						{users.map(user => (
							<tr key={user.id}>
								<td style={{ border: '1px solid #ddd', padding: 8 }}>{user.name}</td>
								<td style={{ border: '1px solid #ddd', padding: 8 }}>{user.email}</td>
								<td style={{ border: '1px solid #ddd', padding: 8 }}>
									<span style={{ 
										padding: '2px 6px', 
										borderRadius: '4px', 
										fontSize: '12px',
										backgroundColor: user.role === 'ADMIN' ? '#ef4444' : 
														user.role === 'MANAGER' ? '#f59e0b' : '#10b981'
									}}>
										{user.role}
									</span>
								</td>
								<td style={{ border: '1px solid #ddd', padding: 8 }}>{user._count.categories}</td>
								<td style={{ border: '1px solid #ddd', padding: 8 }}>{user._count.transactions}</td>
								<td style={{ border: '1px solid #ddd', padding: 8 }}>
									{new Date(user.createdAt).toLocaleDateString('pt-BR')}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Section>
	);
}
