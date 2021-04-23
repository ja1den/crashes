// Import
import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';

import { Redirect, useHistory, useLocation } from 'react-router-dom';

import toDateString from 'lib/toDateString';
import toTitle from 'lib/toTitle';

// Table Component
const TablePage: React.FC = () => {
	const [records, setRecords] = useState<{ id: number, [key: string]: any }[]>();
	const [count, setCount] = useState(NaN);

	// URL Parameters
	const location = useLocation();
	const history = useHistory();

	const name = location.pathname.match(/\/([^/]+)$/)?.[1];
	const page = parseInt(new URLSearchParams(location.search).get('page') ?? '1');

	// Read Records
	useEffect(() => {
		let mounted = true;

		// Request Data
		axios.get('/api/' + name + '?page=' + page).then(res => {
			if (!mounted) return;

			setRecords(res.data.data);
			setCount(res.data.count);
		}).catch(err => {
			if (err.response.status === 404) return history.push('/table');
		});

		return () => { mounted = false };
	}, [name, page, history, location.pathname]);

	// Buttons
	const loadPage = (page: number) => history.push(location.pathname + '?page=' + page);

	// Component HTML
	return (
		<main id='table'>
			<hgroup>
				<h2>{typeof name === 'string' && toTitle(name)}</h2>
				<h3>Preview table data.</h3>
			</hgroup>

			{records !== undefined && (
				<Fragment>
					<div className='pagination'>
						<button className='outline' onClick={loadPage.bind(null, page - 1)} disabled={page === 1}>&#60;</button>
						<p>{page} / {Math.ceil(count / 25)}</p>
						<button className='outline' onClick={loadPage.bind(null, page + 1)} disabled={page === Math.ceil(count / 25)}>&#62;</button>
					</div>

					<figure>
						<table role='grid'>
							<thead>
								<tr>
									{Object.keys(records[0]).map(key => (
										<th scope='col' key={key}>{toTitle(key)}</th>
									))}
								</tr>
							</thead>

							<tbody>
								{records.map(record => (
									<tr key={record.id}>
										{Object.keys(record).map(key => {
											let str = record[key];

											if (/dry|raining|day|alcohol|drugs/.test(key)) str = record[key]?.toString().slice(0, 1).toUpperCase();

											if (key === 'date') {
												str = toDateString(record[key]);
											}

											if (key === 'time') {
												str = record[key].toString().match(/\d+:\d+/)[0];
											}

											if (record[key] === null) str = '.';

											return (
												<td key={key}>{str}</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</figure>
				</Fragment>
			)}

			{page > Math.ceil(count / 25) && <Redirect to={location.pathname + '?page=1'} />}
		</main>
	);
}

// Export
export default TablePage;
