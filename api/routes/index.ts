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
		const columns = new Set<string>();

		// Type Check
		switch (typeof req.query.columns) {
			case 'string':
				// Insert
				columns.add(req.query.columns);
				break;

			case 'object':
				// Invalid Type
				if (!Array.isArray(req.query.columns)) return res.status(400).end();

				// Iterate Columns
				for (const column of req.query.columns) {
					if (typeof column !== 'string') return res.status(400).end();

					// Insert
					columns.add(column);
				}
				break;
		}

		// Columns Exist
		for (const column of columns) {
			if (lookup.columns[column] === undefined) return res.status(400).end();
		}

		// Group Exists
		if (typeof req.query.group !== 'string' || lookup.groups[req.query.group] === undefined) {
			return res.status(400).end();
		}

		// Lookup Group
		let group = lookup.groups[req.query.group];

		// Group SQL
		let groupSQL = group.join ? group.join + '.name' : 'crashes.' + group.name;

		groupSQL = group.sql ? group.sql + '(' + groupSQL + ')' : groupSQL;

		// Build SQL
		let sql = 'SELECT ' + groupSQL + ' AS \'group\'';

		for (const column of columns) {
			sql += ', ' + lookup.columns[column].sql + '(crashes.' + lookup.columns[column].name + ') AS ' + column;
		}

		sql += ' FROM crashes';

		if (group.join !== undefined) {
			sql += ' LEFT JOIN ' + group.join + ' ON crashes.' + group.name + ' = ' + group.join + '.id';
		}

		sql += ' GROUP BY ' + groupSQL;

		// Execute SQL
		const data = (await mysql.query(sql))[0] as Record<string, string | number>[];

		// Parse Data
		const parsed: ResponseBody[] = [];

		for (const record of data) {
			const data: ResponseBody['data'] = {};

			for (const column of Object.keys(lookup.columns)) {
				if (record[column] !== undefined) data[column] = parseFloat(record[column].toString());
			}

			parsed.push({ group: record.group.toString(), data });
		}

		// Send Response
		res.send(parsed);
	} catch (err) {
		// Log
		console.error(err);

		// Send Response
		res.status(500).end();
	}
}
