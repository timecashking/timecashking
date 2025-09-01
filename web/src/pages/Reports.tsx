import React from 'react';
import { apiGet } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Section({ title, children }: { title: string; children: any }) {
	return (
		<div style={{ padding: 24 }}>
			<h2>{title}</h2>
			{children}
		</div>
	);
}

export function Reports() {
	const [startDate, setStartDate] = React.useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
	const [endDate, setEndDate] = React.useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
	const [groupBy, setGroupBy] = React.useState('category');
	const [reportData, setReportData] = React.useState<any>(null);
	const [loading, setLoading] = React.useState(false);
	
	const loadReport = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.append('start', startDate);
			params.append('end', endDate);
			params.append('groupBy', groupBy);
			const data = await apiGet(`/reports/advanced?${params}`);
			setReportData(data);
		} catch (error) {
			console.error('Failed to load report:', error);
		} finally {
			setLoading(false);
		}
	};
	
	const downloadPDF = async () => {
		try {
			const params = new URLSearchParams();
			params.append('start', startDate);
			params.append('end', endDate);
			const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/pdf?${params}`, {
				credentials: 'include'
			});
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `relatorio-${startDate}-${endDate}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error('Failed to download PDF:', error);
		}
	};
	
	React.useEffect(() => {
		loadReport();
	}, [startDate, endDate, groupBy]);
	
	const pieChartData = reportData?.chartData ? {
		labels: reportData.chartData.map((item: any) => item.label),
		datasets: [{
			data: reportData.chartData.map((item: any) => item.value),
			backgroundColor: [
				'#FF6384',
				'#36A2EB',
				'#FFCE56',
				'#4BC0C0',
				'#9966FF',
				'#FF9F40',
				'#FF6384',
				'#C9CBCF'
			],
			borderWidth: 2,
		}]
	} : null;
	
	const barChartData = reportData?.trendData ? {
		labels: reportData.trendData.map((item: any) => item.label),
		datasets: [{
			label: 'Valor (R$)',
			data: reportData.trendData.map((item: any) => item.value),
			backgroundColor: ['#10b981', '#ef4444'],
			borderColor: ['#059669', '#dc2626'],
			borderWidth: 1,
		}]
	} : null;
	
	return (
		<Section title="Relatórios Avançados">
			<div style={{ marginBottom: 20 }}>
				<div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
					<div>
						<label>Data Inicial:</label>
						<input
							type="date"
							value={startDate}
							onChange={e => setStartDate(e.target.value)}
							style={{ marginLeft: 8 }}
						/>
					</div>
					<div>
						<label>Data Final:</label>
						<input
							type="date"
							value={endDate}
							onChange={e => setEndDate(e.target.value)}
							style={{ marginLeft: 8 }}
						/>
					</div>
					<div>
						<label>Agrupar por:</label>
						<select
							value={groupBy}
							onChange={e => setGroupBy(e.target.value)}
							style={{ marginLeft: 8 }}
						>
							<option value="category">Categoria</option>
							<option value="month">Mês</option>
							<option value="week">Semana</option>
							<option value="day">Dia</option>
						</select>
					</div>
				</div>
				
				<div style={{ display: 'flex', gap: 8 }}>
					<button onClick={loadReport} disabled={loading}>
						{loading ? 'Carregando...' : 'Atualizar Relatório'}
					</button>
					<button onClick={downloadPDF} disabled={loading}>
						Baixar PDF
					</button>
				</div>
			</div>
			
			{reportData && (
				<div>
					{/* Summary Cards */}
					<div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
						<div style={{ 
							background: '#10b981', 
							color: 'white', 
							padding: '16px 24px', 
							borderRadius: '8px',
							minWidth: '150px',
							textAlign: 'center'
						}}>
							<h3>Receitas</h3>
							<h2>R$ {reportData.summary.totalIncome.toFixed(2)}</h2>
						</div>
						<div style={{ 
							background: '#ef4444', 
							color: 'white', 
							padding: '16px 24px', 
							borderRadius: '8px',
							minWidth: '150px',
							textAlign: 'center'
						}}>
							<h3>Despesas</h3>
							<h2>R$ {reportData.summary.totalExpense.toFixed(2)}</h2>
						</div>
						<div style={{ 
							background: (reportData.summary.totalIncome - reportData.summary.totalExpense) >= 0 ? '#10b981' : '#ef4444', 
							color: 'white', 
							padding: '16px 24px', 
							borderRadius: '8px',
							minWidth: '150px',
							textAlign: 'center'
						}}>
							<h3>Saldo</h3>
							<h2>R$ {(reportData.summary.totalIncome - reportData.summary.totalExpense).toFixed(2)}</h2>
						</div>
					</div>
					
					{/* Charts */}
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
						<div>
							<h3>Distribuição por {groupBy === 'category' ? 'Categoria' : 'Período'}</h3>
							<div style={{ height: '300px' }}>
								{pieChartData && <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />}
							</div>
						</div>
						<div>
							<h3>Receitas vs Despesas</h3>
							<div style={{ height: '300px' }}>
								{barChartData && <Bar data={barChartData} options={{ maintainAspectRatio: false }} />}
							</div>
						</div>
					</div>
					
					{/* Data Table */}
					<div>
						<h3>Dados Detalhados</h3>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead>
								<tr>
									<th style={{ border: '1px solid #ddd', padding: 8 }}>Item</th>
									<th style={{ border: '1px solid #ddd', padding: 8 }}>Tipo</th>
									<th style={{ border: '1px solid #ddd', padding: 8 }}>Valor</th>
								</tr>
							</thead>
							<tbody>
								{reportData.chartData.map((item: any, index: number) => (
									<tr key={index}>
										<td style={{ border: '1px solid #ddd', padding: 8 }}>{item.label}</td>
										<td style={{ border: '1px solid #ddd', padding: 8 }}>
											<span style={{ 
												padding: '2px 6px', 
												borderRadius: '4px', 
												fontSize: '12px',
												backgroundColor: item.type === 'INCOME' ? '#10b981' : '#ef4444',
												color: 'white'
											}}>
												{item.type === 'INCOME' ? 'Receita' : 'Despesa'}
											</span>
										</td>
										<td style={{ border: '1px solid #ddd', padding: 8 }}>
											R$ {item.value.toFixed(2)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</Section>
	);
}
