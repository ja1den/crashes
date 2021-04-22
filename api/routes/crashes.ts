// Import
import path from 'path';
import fs from 'fs';

import { Request, Response } from 'express';

import mysql from '../lib/mysql';

import { crash } from '../../src/lib/models';

// Read File
const baseSQL = fs.readFileSync(path.resolve(__dirname, '..', 'sql', 'crashes.sql')).toString();

// Export
export default async (req: Request, res: Response) => {
	// Switch on Method
	switch (req.method) {
		case 'GET':
			try {
				// Count Records
				const count = (await mysql.query('SELECT COUNT(*) FROM crashes'))[0][0]['COUNT(*)'];

				// Generate SQL
				let sql = baseSQL.trim().replace(';', '');

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

		case 'POST':
			try {
				// Joi
				if (crash.validate(req.body, { convert: false }).error !== undefined) {
					return res.status(400).end();
				}

				// Execute SQL
				await mysql.query('INSERT INTO crashes VALUES (NULL, ' + '?, '.repeat(17) + '?)', [
					req.body.region_id,
					req.body.suburb_id,
					req.body.units,
					req.body.fatalities,
					req.body.injuries,
					req.body.date,
					req.body.time,
					req.body.speed_limit,
					req.body.road_type_id,
					req.body.curve_id,
					req.body.slope_id,
					req.body.surface_id,
					req.body.dry,
					req.body.raining,
					req.body.day,
					req.body.crash_type_id,
					req.body.alcohol,
					req.body.drugs
				]);

				// Send Response
				res.status(201).end();
			} catch (err) {
				// Invalid Foreign Key
				if (err.code === 'ER_NO_REFERENCED_ROW_2') {
					return res.status(422).end();
				}

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
