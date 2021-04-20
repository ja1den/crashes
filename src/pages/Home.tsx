// Import
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import toTitle from 'lib/toTitle';

// Type
interface Summary {
	total: number;
	fatalities: number;
	injuries: number;
	units: number;
}

// Home Component
const HomePage: React.FC = () => {
	const [summary, setSummary] = useState<Summary>();

	// Get Summary
	useEffect(() => {
		let mounted = true;

		axios.get('/api/summary').then(res => {
			if (mounted) setSummary(res.data);
		});

		return () => { mounted = false };
	}, []);

	// Component HTML
	return (
		<main id='home'>
			<hgroup>
				<h2>Home</h2>
				<h3>Data summary.</h3>
			</hgroup>

			{summary !== undefined && (
				<figure>
					<table role='grid'>
						<thead>
							<tr>
								{Object.keys(summary).map(key => (
									<th scope='col' key={key}>{toTitle(key)}</th>
								))}
							</tr>
						</thead>

						<tbody>
							<tr>
								{Object.entries(summary).map(([key, value]) => (
									<td key={key}>{value}</td>
								))}
							</tr>
						</tbody>
					</table>
				</figure>
			)}
		</main>
	);
}

// Export
export default HomePage;
