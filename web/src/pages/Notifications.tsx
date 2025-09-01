import React from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function Section({ title, children }: { title: string; children: any }) {
	return (
		<div style={{ padding: 24 }}>
			<h2>{title}</h2>
			{children}
		</div>
	);
}

export function Notifications() {
	const [notifications, setNotifications] = React.useState<any[]>([]);
	const [preferences, setPreferences] = React.useState<any>(null);
	const [unreadCount, setUnreadCount] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [page, setPage] = React.useState(1);
	const [totalPages, setTotalPages] = React.useState(1);
	const [showPreferences, setShowPreferences] = React.useState(false);
	
	const loadNotifications = async (pageNum = 1) => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.append('page', pageNum.toString());
			params.append('pageSize', '20');
			const data = await apiGet(`/notifications?${params}`);
			setNotifications(data.notifications);
			setTotalPages(data.pagination.totalPages);
			setPage(data.pagination.page);
		} catch (error) {
			console.error('Failed to load notifications:', error);
		} finally {
			setLoading(false);
		}
	};
	
	const loadUnreadCount = async () => {
		try {
			const data = await apiGet('/notifications/unread');
			setUnreadCount(data.unreadCount);
		} catch (error) {
			console.error('Failed to load unread count:', error);
		}
	};
	
	const loadPreferences = async () => {
		try {
			const data = await apiGet('/notifications/preferences');
			setPreferences(data);
		} catch (error) {
			console.error('Failed to load preferences:', error);
		}
	};
	
	const markAsRead = async (id: string) => {
		try {
			await apiPatch(`/notifications/${id}/read`, {});
			loadNotifications(page);
			loadUnreadCount();
		} catch (error) {
			console.error('Failed to mark as read:', error);
		}
	};
	
	const markAllAsRead = async () => {
		try {
			await apiPatch('/notifications/read-all', {});
			loadNotifications(page);
			loadUnreadCount();
		} catch (error) {
			console.error('Failed to mark all as read:', error);
		}
	};
	
	const deleteNotification = async (id: string) => {
		if (!confirm('Tem certeza que deseja excluir esta notificação?')) {
			return;
		}
		
		try {
			await apiDelete(`/notifications/${id}`);
			loadNotifications(page);
			loadUnreadCount();
		} catch (error) {
			console.error('Failed to delete notification:', error);
		}
	};
	
	const updatePreferences = async (updates: any) => {
		try {
			const updatedPreferences = await apiPatch('/notifications/preferences', {
				...preferences,
				...updates,
			});
			setPreferences(updatedPreferences);
		} catch (error) {
			console.error('Failed to update preferences:', error);
		}
	};
	
	const sendTestNotification = async (type: string) => {
		try {
			await apiPost('/notifications/test', { type, category: 'SYSTEM' });
			alert('Notificação de teste enviada!');
			loadNotifications(page);
			loadUnreadCount();
		} catch (error) {
			console.error('Failed to send test notification:', error);
		}
	};
	
	React.useEffect(() => {
		loadNotifications();
		loadUnreadCount();
		loadPreferences();
	}, []);
	
	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'REMINDER': return '#f59e0b';
			case 'ALERT': return '#ef4444';
			case 'REPORT': return '#10b981';
			case 'PAYMENT': return '#8b5cf6';
			case 'SYSTEM': return '#6b7280';
			default: return '#6b7280';
		}
	};
	
	const getCategoryText = (category: string) => {
		switch (category) {
			case 'REMINDER': return 'Lembrete';
			case 'ALERT': return 'Alerta';
			case 'REPORT': return 'Relatório';
			case 'PAYMENT': return 'Pagamento';
			case 'SYSTEM': return 'Sistema';
			default: return category;
		}
	};
	
	const getTypeText = (type: string) => {
		switch (type) {
			case 'EMAIL': return 'Email';
			case 'PUSH': return 'Push';
			case 'BOTH': return 'Email + Push';
			default: return type;
		}
	};
	
	return (
		<Section title="Notificações">
			<div style={{ marginBottom: 20 }}>
				<div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
					<button onClick={() => loadNotifications()} disabled={loading}>
						{loading ? 'Carregando...' : 'Atualizar'}
					</button>
					<button onClick={() => setShowPreferences(!showPreferences)}>
						{showPreferences ? 'Ocultar Preferências' : 'Mostrar Preferências'}
					</button>
					{unreadCount > 0 && (
						<button onClick={markAllAsRead} style={{ background: '#10b981' }}>
							Marcar Todas como Lidas ({unreadCount})
						</button>
					)}
				</div>
				
				{/* Notification Stats */}
				<div style={{ 
					background: '#f8fafc', 
					border: '1px solid #e2e8f0', 
					borderRadius: '8px', 
					padding: '16px',
					marginBottom: '16px'
				}}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span><strong>Total de Notificações:</strong> {notifications.length}</span>
						<span><strong>Não Lidas:</strong> {unreadCount}</span>
						<span><strong>Página:</strong> {page} de {totalPages}</span>
					</div>
				</div>
			</div>
			
			{/* Preferences Panel */}
			{showPreferences && preferences && (
				<div style={{ 
					background: '#f8fafc', 
					border: '1px solid #e2e8f0', 
					borderRadius: '8px', 
					padding: '20px',
					marginBottom: '24px'
				}}>
					<h3>Preferências de Notificação</h3>
					
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
						{/* Email Settings */}
						<div>
							<h4>Configurações de Email</h4>
							<div style={{ marginBottom: '12px' }}>
								<label>
									<input
										type="checkbox"
										checked={preferences.emailEnabled}
										onChange={(e) => updatePreferences({ emailEnabled: e.target.checked })}
										style={{ marginRight: '8px' }}
									/>
									Ativar notificações por email
								</label>
							</div>
						</div>
						
						{/* Push Settings */}
						<div>
							<h4>Configurações Push</h4>
							<div style={{ marginBottom: '12px' }}>
								<label>
									<input
										type="checkbox"
										checked={preferences.pushEnabled}
										onChange={(e) => updatePreferences({ pushEnabled: e.target.checked })}
										style={{ marginRight: '8px' }}
									/>
									Ativar notificações push
								</label>
							</div>
						</div>
					</div>
					
					{/* Category Settings */}
					<div style={{ marginTop: '20px' }}>
						<h4>Tipos de Notificação</h4>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
							<label>
								<input
									type="checkbox"
									checked={preferences.reminderEnabled}
									onChange={(e) => updatePreferences({ reminderEnabled: e.target.checked })}
									style={{ marginRight: '8px' }}
								/>
								Lembretes
							</label>
							<label>
								<input
									type="checkbox"
									checked={preferences.alertEnabled}
									onChange={(e) => updatePreferences({ alertEnabled: e.target.checked })}
									style={{ marginRight: '8px' }}
								/>
								Alertas
							</label>
							<label>
								<input
									type="checkbox"
									checked={preferences.reportEnabled}
									onChange={(e) => updatePreferences({ reportEnabled: e.target.checked })}
									style={{ marginRight: '8px' }}
								/>
								Relatórios
							</label>
							<label>
								<input
									type="checkbox"
									checked={preferences.paymentEnabled}
									onChange={(e) => updatePreferences({ paymentEnabled: e.target.checked })}
									style={{ marginRight: '8px' }}
								/>
								Pagamentos
							</label>
							<label>
								<input
									type="checkbox"
									checked={preferences.systemEnabled}
									onChange={(e) => updatePreferences({ systemEnabled: e.target.checked })}
									style={{ marginRight: '8px' }}
								/>
								Sistema
							</label>
						</div>
					</div>
					
					{/* Frequency Settings */}
					<div style={{ marginTop: '20px' }}>
						<h4>Frequência</h4>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
							<div>
								<label>Frequência de Lembretes:</label>
								<select
									value={preferences.reminderFrequency}
									onChange={(e) => updatePreferences({ reminderFrequency: e.target.value })}
									style={{ marginLeft: '8px' }}
								>
									<option value="daily">Diário</option>
									<option value="weekly">Semanal</option>
									<option value="monthly">Mensal</option>
								</select>
							</div>
							<div>
								<label>Frequência de Relatórios:</label>
								<select
									value={preferences.reportFrequency}
									onChange={(e) => updatePreferences({ reportFrequency: e.target.value })}
									style={{ marginLeft: '8px' }}
								>
									<option value="weekly">Semanal</option>
									<option value="monthly">Mensal</option>
									<option value="quarterly">Trimestral</option>
								</select>
							</div>
						</div>
					</div>
					
					{/* Test Buttons */}
					<div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
						<button onClick={() => sendTestNotification('EMAIL')}>
							Testar Email
						</button>
						<button onClick={() => sendTestNotification('PUSH')}>
							Testar Push
						</button>
						<button onClick={() => sendTestNotification('BOTH')}>
							Testar Ambos
						</button>
					</div>
				</div>
			)}
			
			{/* Notifications List */}
			<div>
				<h3>Histórico de Notificações</h3>
				{notifications.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
						Nenhuma notificação encontrada.
					</div>
				) : (
					<div>
						{notifications.map((notification) => (
							<div
								key={notification.id}
								style={{
									border: '1px solid #e2e8f0',
									borderRadius: '8px',
									padding: '16px',
									marginBottom: '12px',
									background: notification.status === 'READ' ? 'white' : '#f0f9ff',
									borderLeft: `4px solid ${getCategoryColor(notification.category)}`,
								}}
							>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
									<div>
										<h4 style={{ margin: '0 0 4px 0' }}>{notification.title}</h4>
										<p style={{ margin: '0', color: '#666' }}>{notification.message}</p>
									</div>
									<div style={{ display: 'flex', gap: '4px' }}>
										<span style={{ 
											padding: '2px 6px', 
											borderRadius: '4px', 
											fontSize: '12px',
											backgroundColor: getCategoryColor(notification.category),
											color: 'white'
										}}>
											{getCategoryText(notification.category)}
										</span>
										<span style={{ 
											padding: '2px 6px', 
											borderRadius: '4px', 
											fontSize: '12px',
											backgroundColor: '#6b7280',
											color: 'white'
										}}>
											{getTypeText(notification.type)}
										</span>
									</div>
								</div>
								
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
									<div style={{ fontSize: '12px', color: '#666' }}>
										{format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
										{notification.sentAt && (
											<span style={{ marginLeft: '8px' }}>
												• Enviada: {format(new Date(notification.sentAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
											</span>
										)}
									</div>
									
									<div style={{ display: 'flex', gap: '4px' }}>
										{notification.status !== 'READ' && (
											<button
												onClick={() => markAsRead(notification.id)}
												style={{ 
													background: '#10b981', 
													color: 'white', 
													border: 'none', 
													padding: '4px 8px', 
													borderRadius: '4px',
													fontSize: '12px',
													cursor: 'pointer'
												}}
											>
												Marcar como Lida
											</button>
										)}
										<button
											onClick={() => deleteNotification(notification.id)}
											style={{ 
												background: '#ef4444', 
												color: 'white', 
												border: 'none', 
												padding: '4px 8px', 
												borderRadius: '4px',
												fontSize: '12px',
												cursor: 'pointer'
											}}
										>
											Excluir
										</button>
									</div>
								</div>
							</div>
						))}
						
						{/* Pagination */}
						{totalPages > 1 && (
							<div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
								<button
									onClick={() => loadNotifications(page - 1)}
									disabled={page <= 1}
									style={{ padding: '8px 16px' }}
								>
									Anterior
								</button>
								<span style={{ padding: '8px 16px' }}>
									Página {page} de {totalPages}
								</span>
								<button
									onClick={() => loadNotifications(page + 1)}
									disabled={page >= totalPages}
									style={{ padding: '8px 16px' }}
								>
									Próxima
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</Section>
	);
}
