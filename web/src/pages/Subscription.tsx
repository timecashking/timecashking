import React from 'react';
import { apiGet, apiPost } from '../api';
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

export function Subscription() {
	const [plans, setPlans] = React.useState<any[]>([]);
	const [currentSubscription, setCurrentSubscription] = React.useState<any>(null);
	const [payments, setPayments] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [selectedPlan, setSelectedPlan] = React.useState<string>('');
	
	const loadData = async () => {
		setLoading(true);
		try {
			const [plansData, subscriptionData, paymentsData] = await Promise.all([
				apiGet('/subscription/plans'),
				apiGet('/subscription/current'),
				apiGet('/subscription/payments')
			]);
			setPlans(plansData);
			setCurrentSubscription(subscriptionData);
			setPayments(paymentsData);
		} catch (error) {
			console.error('Failed to load subscription data:', error);
		} finally {
			setLoading(false);
		}
	};
	
	const handleSubscribe = async (planId: string) => {
		try {
			setLoading(true);
			const response = await apiPost('/subscription/create-checkout', { planId });
			if (response.url) {
				window.location.href = response.url;
			}
		} catch (error) {
			console.error('Failed to create checkout session:', error);
		} finally {
			setLoading(false);
		}
	};
	
	const handleCancelSubscription = async () => {
		if (!confirm('Tem certeza que deseja cancelar sua assinatura? Ela será cancelada no final do período atual.')) {
			return;
		}
		
		try {
			setLoading(true);
			await apiPost('/subscription/cancel', {});
			alert('Sua assinatura será cancelada no final do período atual.');
			loadData();
		} catch (error) {
			console.error('Failed to cancel subscription:', error);
		} finally {
			setLoading(false);
		}
	};
	
	React.useEffect(() => {
		loadData();
	}, []);
	
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'ACTIVE': return '#10b981';
			case 'TRIAL': return '#f59e0b';
			case 'CANCELED': return '#ef4444';
			case 'PAST_DUE': return '#f97316';
			default: return '#6b7280';
		}
	};
	
	const getStatusText = (status: string) => {
		switch (status) {
			case 'ACTIVE': return 'Ativa';
			case 'TRIAL': return 'Período de Teste';
			case 'CANCELED': return 'Cancelada';
			case 'PAST_DUE': return 'Em Atraso';
			default: return status;
		}
	};
	
	return (
		<Section title="Assinatura e Pagamentos">
			<div style={{ marginBottom: 20 }}>
				<button onClick={loadData} disabled={loading}>
					{loading ? 'Carregando...' : 'Atualizar'}
				</button>
			</div>
			
			{/* Current Subscription Status */}
			{currentSubscription && (
				<div style={{ marginBottom: 32 }}>
					<h3>Status da Assinatura</h3>
					<div style={{ 
						background: '#f8fafc', 
						border: '1px solid #e2e8f0', 
						borderRadius: '8px', 
						padding: '16px',
						marginBottom: '16px'
					}}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
							<span style={{ fontWeight: 'bold' }}>
								{currentSubscription.plan?.name || 'Período de Teste'}
							</span>
							<span style={{ 
								padding: '4px 8px', 
								borderRadius: '4px', 
								fontSize: '12px',
								backgroundColor: getStatusColor(currentSubscription.status),
								color: 'white'
							}}>
								{getStatusText(currentSubscription.status)}
							</span>
						</div>
						
						{currentSubscription.plan && (
							<div style={{ marginBottom: '8px' }}>
								<strong>Preço:</strong> R$ {currentSubscription.plan.price.toFixed(2)}/mês
							</div>
						)}
						
						{currentSubscription.currentPeriod && (
							<div style={{ marginBottom: '8px' }}>
								<strong>Período atual:</strong> {format(new Date(currentSubscription.currentPeriod.start), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(currentSubscription.currentPeriod.end), 'dd/MM/yyyy', { locale: ptBR })}
							</div>
						)}
						
						{currentSubscription.trialEnd && (
							<div style={{ marginBottom: '8px' }}>
								<strong>Teste gratuito até:</strong> {format(new Date(currentSubscription.trialEnd), 'dd/MM/yyyy', { locale: ptBR })}
							</div>
						)}
						
						{currentSubscription.status === 'ACTIVE' && (
							<button 
								onClick={handleCancelSubscription}
								disabled={loading}
								style={{ 
									background: '#ef4444', 
									color: 'white', 
									border: 'none', 
									padding: '8px 16px', 
									borderRadius: '4px',
									cursor: 'pointer'
								}}
							>
								Cancelar Assinatura
							</button>
						)}
					</div>
				</div>
			)}
			
			{/* Available Plans */}
			<div style={{ marginBottom: 32 }}>
				<h3>Planos Disponíveis</h3>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
					{plans.map((plan) => (
						<div key={plan.id} style={{ 
							border: '1px solid #e2e8f0', 
							borderRadius: '8px', 
							padding: '20px',
							background: 'white'
						}}>
							<h4 style={{ margin: '0 0 8px 0' }}>{plan.name}</h4>
							<div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
								R$ {plan.price.toFixed(2)}/mês
							</div>
							
							<ul style={{ margin: '0 0 20px 0', paddingLeft: '20px' }}>
								{plan.features.map((feature: string, index: number) => (
									<li key={index} style={{ marginBottom: '4px' }}>{feature}</li>
								))}
							</ul>
							
							<button
								onClick={() => handleSubscribe(plan.id)}
								disabled={loading || currentSubscription?.status === 'ACTIVE'}
								style={{
									width: '100%',
									background: currentSubscription?.status === 'ACTIVE' ? '#6b7280' : '#10b981',
									color: 'white',
									border: 'none',
									padding: '12px',
									borderRadius: '4px',
									cursor: currentSubscription?.status === 'ACTIVE' ? 'not-allowed' : 'pointer',
									fontSize: '16px'
								}}
							>
								{currentSubscription?.status === 'ACTIVE' ? 'Já Assinado' : 'Assinar Agora'}
							</button>
						</div>
					))}
				</div>
			</div>
			
			{/* Payment History */}
			{payments.length > 0 && (
				<div>
					<h3>Histórico de Pagamentos</h3>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr>
								<th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data</th>
								<th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Descrição</th>
								<th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Valor</th>
								<th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
							</tr>
						</thead>
						<tbody>
							{payments.map((payment) => (
								<tr key={payment.id}>
									<td style={{ border: '1px solid #ddd', padding: '8px' }}>
										{format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
									</td>
									<td style={{ border: '1px solid #ddd', padding: '8px' }}>
										{payment.description || 'Pagamento da assinatura'}
									</td>
									<td style={{ border: '1px solid #ddd', padding: '8px' }}>
										R$ {Number(payment.amount).toFixed(2)}
									</td>
									<td style={{ border: '1px solid #ddd', padding: '8px' }}>
										<span style={{ 
											padding: '2px 6px', 
											borderRadius: '4px', 
											fontSize: '12px',
											backgroundColor: payment.status === 'SUCCEEDED' ? '#10b981' : 
															payment.status === 'PENDING' ? '#f59e0b' : '#ef4444',
											color: 'white'
										}}>
											{payment.status === 'SUCCEEDED' ? 'Pago' : 
											 payment.status === 'PENDING' ? 'Pendente' : 'Falhou'}
										</span>
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
