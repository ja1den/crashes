// Import
import { Request, Response } from 'express';

import mysql from '../lib/mysql';

// Lookup
import lookup, { Column } from '../../src/lib/lookup';

// Types
interface ResponseBody {
	group: string;
	data: Record<string, number>;
}

// Export
export default async (req: Request, res: Response) => {
	// Invalid Method
	if (req.method !== 'GET') return res.status(405).end();

	// Handle Request
	try {
		// Parse Columns
		const columns: [string, Column][] = [];

		// Type Check
		switch (typeof req.query.columns) {
			case 'string':
				// Insert
				columns.push([req.query.columns, null]);
				break;

			case 'object':
				// Invalid Type
				if (!Array.isArray(req.query.columns)) return res.status(400).end();

				// Iterate Columns
				for (const column of req.query.columns) {
					if (typeof column !== 'string') return res.status(400).end();

					// Insert
					columns.push([column, null]);
				}
				break;
		}

		if (columns.length === 0) return res.status(400).end();

		// Lookup Columns
		for (const column of columns) {
			if (lookup.columns[column[0]] === undefined) {
				return res.status(400).end();
			}

			// Insert
			column[1] = lookup.columns[column[0]];
		}

		// Build SQL
		let sql = 'SELECT YEAR(crashes.date) AS \'group\', ';

		for (let i = 0; i < columns.length; i++) {
			sql += columns[i][1].sql + '(crashes.' + columns[i][1].name + ') AS ' + columns[i][0];
			sql += i !== columns.length - 1 ? ', ' : '';
		}

		sql += ' FROM crashes GROUP BY YEAR(crashes.date)';

		// Execute SQL
		const data = (await mysql.query(sql))[0];

		// Parse Data
		for (const i in data) {
			const obj: ResponseBody = { group: data[i].group, data: {} };

			for (const key in data[i]) {
				if (key !== 'group') {
					obj.data[key] = parseInt(data[i][key] ?? '0');
				}
			}

			data[i] = obj;
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
