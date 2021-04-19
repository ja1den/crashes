// Import
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Link } from 'react-router-dom';

import toTitle from '../lib/toTitle';

// Table Names
const names = ['crashes', 'crash_types', 'curves', 'regions', 'road_types', 'slopes', 'suburbs', 'surfaces'];

// Tables Component
const TablesPage: React.FC = () => {
	const [counts, setCounts] = useState<{ [key: string]: number }>({});

	// Table Counts
	useEffect(() => {
		let mounted = true;

		names.forEach(name => {
			axios.get('/api/' + name).then(res => {
				if (mounted) setCounts(counts => ({ ...counts, [name]: res.data.count }));
			});
		});

		return () => { mounted = false };
	}, []);

	// Component HTML
	return (
		<main id='tables'>
			<hgroup>
				<h2>Tables</h2>
				<h3>Data download and access.</h3>
			</hgroup>

			<figure>
				<table role='grid'>
					<thead>
						<tr>
							<th scope='col'>Name</th>
							<th scope='col'>Records</th>
							<th scope='col'>Preview</th>
						</tr>
					</thead>

					<tbody>
						{
							names.map(name => (
								<tr key={name}>
									<td>{toTitle(name)}</td>
									<td>{counts[name] ?? <small>Loading...</small>}</td>
									<td>
										<Link to={'/table/' + name + '?page=1'}>Link</Link>
									</td>
								</tr>
							))
						}
					</tbody>
				</table>
			</figure>
		</main>
	);
}

// Export
export default TablesPage;
