// Import
import { Request, Response } from 'express';

import mysql from '../lib/mysql';

// Export
export default async (req: Request, res: Response) => {
	// Switch on Method
	switch (req.method) {
		case 'GET':
			try {
				// Count Records
				const count = (await mysql.query('SELECT COUNT(*) FROM suburbs'))[0][0]['COUNT(*)'];

				// Generate SQL
				let sql = 'SELECT * FROM suburbs';

				// Pagination
				if (req.query.page !== undefined) {
					// Page Number
					if (typeof req.query.page !== 'string' || !Number.isInteger(parseFloat(req.query.page))) {
						return res.status(400).end();
					}

					const page = parseInt(req.query.page);

					// Page Size
					let size = 25;

					if (req.query.size !== undefined) {
						if (typeof req.query.size !== 'string' || !Number.isInteger(parseFloat(req.query.size))) {
							return res.status(400).end();
						} else {
							size = parseInt(req.query.size);
						}
					}

					// Minimum Page
					if (page <= 0) {
						return res.status(400).end();
					}

					// Maximum Page
					if (page > Math.ceil(count / size)) {
						return res.status(404).end();
					}

					// Update SQL
					sql += ' LIMIT ' + size + ' OFFSET ' + (page - 1) * size;
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
