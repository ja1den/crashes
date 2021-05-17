// Import
import { Request, Response } from 'express';

import mysql from '../lib/mysql';

// Column Lookup
const columns = { id: 'COUNT', fatalities: 'SUM', injuries: 'SUM', units: 'SUM' };

// Export
export default async (req: Request, res: Response) => {
	// Invalid Method
	if (req.method !== 'GET') return res.status(405).end();

	// Build SQL
	if (typeof req.query.column !== 'string' || !Object.keys(columns).includes(req.query.column)) return res.status(400).end()

	const sql = (
		'SELECT ' +
		'YEAR(crashes.date) AS year, ' +
		columns[req.query.column] + '(crashes.' + req.query.column + ')' + ' AS data ' +
		'FROM ' +
		'crashes ' +
		'GROUP BY YEAR(crashes.date)'
	);

	// Execute SQL
	const data = (await mysql.query(sql))[0];

	// Parse Data
	for (const key in data) {
		data[key].data = parseInt(data[key].data ?? '0');
	}

	// Send Response
	res.send(data);
}
