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

export function Summary() {
	const [data, setData] = React.useState<any>(null);
	const load = async () => setData(await apiGet('/summary'));
	
	React.useEffect(() => {
		load();
	}, []);
	
	return (
		<Section title="Resumo">
			<button onClick={load}>Atualizar</button>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</Section>
	);
}
