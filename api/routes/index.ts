// Import
import { Request, Response } from 'express';

import mysql from '../lib/mysql';

// Lookup
import lookup from '../sql/lookup';

// Export
export default async (req: Request, res: Response) => {
	// Invalid Method
	if (req.method !== 'GET') return res.status(405).end();

	// Handle Request
	try {
		// Parse Columns
		const columns: string[] = [];

		switch (typeof req.query.columns) {
			case 'string':
				// Invalid Column
				if (!Object.keys(lookup.columns).includes(req.query.columns)) {
					return res.status(400).end();
				}

				// Insert
				columns.push(req.query.columns);
				break;

			case 'object':
				// Invalid Type
				if (!Array.isArray(req.query.columns)) return res.status(400).end();

				// Iterate Columns
				for (const column of req.query.columns) {
					if (typeof column !== 'string') return res.status(400).end();

					// Invalid Column
					if (!Object.keys(lookup.columns).includes(column)) {
						return res.status(400).end();
					}

					// Insert
					columns.push(column);
				}
				break;
		}

		if (columns.length === 0) return res.status(400).end();

		// Build SQL
		let sql = 'SELECT YEAR(crashes.date) AS \'group\', ';

		sql += columns.map(column => lookup.columns[column].sql + '(crashes.' + column + ') AS ' + lookup.columns[column].alias).join(', ')

		sql += ' FROM crashes GROUP BY YEAR(crashes.date)';

		// Execute SQL
		const data = (await mysql.query(sql))[0];

		// Parse Data
		for (const i in data) for (const key in data[i]) {
			data[i][key] = parseInt(data[i][key] ?? '0');
		}

		// Send Response
		res.send(data);
	} catch (err) {
		// Log
		console.error(err);

		// Send Response
		res.status(500).end();
	}
}
