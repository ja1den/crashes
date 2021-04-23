// Import
import path from 'path';
import fs from 'fs';

import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';

import mysql from '../lib/mysql';

import models from '../../src/lib/models';

// Export
export default async (req: Request, res: Response, next: NextFunction) => {
	// Find Model
	const model = Object.entries(models).find(entry => entry[1].name === req.params.table)?.[1];

	// Handle 404
	if (model === undefined) return next();

	// Switch on Method
	switch (req.method) {
		case 'GET':
			try {
				// Count Records
				const count = (await mysql.query('SELECT COUNT(*) FROM ' + model.name))[0][0]['COUNT(*)'];

				// Read File
				const sqlPath = path.resolve(__dirname, '..', 'sql', model.name + '.sql');
				const sqlExists = fs.existsSync(sqlPath);

				// Base SQL
				let sql = 'SELECT * FROM ' + model.name + ' ORDER BY id';

				if (sqlExists) {
					sql = fs.readFileSync(sqlPath).toString().trim().replace(';', '');
				}

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

					// Invalid Pages
					if (page <= 0) {
						return res.status(400).end();
					}

					// Update SQL
					sql += ' LIMIT ' + size + ' OFFSET ' + (page - 1) * size;
				}

				// Execute SQL 
				const data = (await mysql.query(sql))[0] as RowDataPacket[];

				// Parse Data
				const parsed = data.map(record => {
					const parsed: Record<string, string | number | boolean> = { ...record };

					for (const key of Object.keys(record)) {
						if (key === 'date') parsed[key] = new Date(record.date.getTime() - (record.date.getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];
						if (/dry|raining|day|alcohol|drugs/.test(key)) parsed[key] = record[key] !== null ? !!record[key] : null;
					}

					return parsed;
				});

				// Send Response
				res.send({ count, data: parsed });
			} catch (err) {
				// Log
				console.error(err);

				// Send Response
				res.status(500).end();
			}
			break;

		case 'POST':
			try {
				// List Records
				const records: Record<string, string | number | boolean>[] = Array.isArray(req.body) ? req.body : [req.body];

				// Begin Transaction
				await mysql.query('BEGIN');

				// Truncate Table
				if (req.query.truncate !== undefined) {
					await mysql.query('TRUNCATE TABLE ' + model.name);
				}

				// Iterate Records
				for (const record of records) {
					// Joi
					if (model.schema.validate(record, { convert: false }).error !== undefined) {
						// Rollback Transaction
						await mysql.query('ROLLBACK');

						// Send Response
						return res.status(400).end();
					}

					// Sort Keys
					const sorted: (string | number | boolean)[] = [];

					for (const property of model.properties) {
						sorted.push(record[property]);
					}

					// Base SQL
					let sql = 'INSERT INTO ' + model.name + ' VALUES (' + '?, '.repeat(model.properties.length - 1) + '?)';

					// Ignore ID
					if (req.query.append !== undefined || record.id === undefined) {
						sql = sql.replace('?', 'NULL');
						sorted.shift();
					}

					// Execute SQL
					await mysql.query(sql, sorted);
				}

				// Commit Transaction
				await mysql.query('COMMIT');

				// Send Response
				res.status(201).end();
			} catch (err) {
				// Rollback Transaction
				await mysql.query('ROLLBACK');

				// Invalid Foreign Key
				if (err.code === 'ER_NO_REFERENCED_ROW_2') {
					return res.status(422).end();
				}

				// Duplicate Entry
				if (err.code === 'ER_DUP_ENTRY') {
					return res.status(409).end();
				}

				// Illegal Truncate
				if (err.code === 'ER_TRUNCATE_ILLEGAL_FK') {
					return res.status(403).end();
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
