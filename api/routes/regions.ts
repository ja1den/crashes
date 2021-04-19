// Import
import { Request, Response } from 'express';

import mysql from '../lib/mysql';
import config from '../lib/config';

// Export
export default async (req: Request, res: Response) => {
	// Switch on Method
	switch (req.method) {
		case 'GET':
			try {
				// Count Records
				const count = (await mysql.query('SELECT COUNT(*) FROM regions'))[0][0]['COUNT(*)'];

				// Generate SQL
				let sql = 'SELECT * FROM regions';

				// Pagination
				if (req.query.page !== undefined) {
					if (typeof req.query.page !== 'string' || !Number.isInteger(parseFloat(req.query.page))) {
						return res.status(400).end();
					}

					const page = parseInt(req.query.page);

					// Minimum Page
					if (page <= 0) {
						return res.status(400).end();
					}

					// Maximum Page
					if (page > Math.ceil(count / config.pageSize)) {
						return res.status(404).end();
					}

					// Update SQL
					sql += ' LIMIT ' + config.pageSize + ' OFFSET ' + (page - 1) * config.pageSize;
				}

				// Execute SQL 
				const data = (await mysql.query(sql))[0];

				// Send Response
				res.send({ count, data });
			} catch (err) {
				// Log
				console.error(err);

				// Send Response
				res.status(500).end();
			}
			break;

		default:
			// Invalid Method
			res.status(405).end();
			break;
	}
}
