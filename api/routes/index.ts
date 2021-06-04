// Import
import { Request, Response } from 'express';

import mysql from '../lib/mysql';

// Lookup
import lookup from '../../src/lib/lookup';

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

		// Lookup Group
		if (typeof req.query.group !== 'string' || lookup.groups[req.query.group] === undefined) {
			return res.status(400).end();
		}

		let group = lookup.groups[req.query.group];

		// Filters
		if (typeof req.query.filter === 'string') {
			try {
				req.query.filter = JSON.parse(req.query.filter);
			} catch (e) {
				return res.status(400).end();
			}
		}

		let filter: { group: string, field: string } | null = null;

		if (req.query.filter !== undefined) {
			if (typeof req.query.filter === 'object' && !Array.isArray(req.query.filter)) {
				if (typeof req.query.filter.group === 'string' && typeof req.query.filter.field === 'string') {
					if (lookup.groups[req.query.filter.group] !== undefined) {
						filter = {
							group: req.query.filter.group,
							field: req.query.filter.field
						};
					} else {
						return res.status(400).end();
					}
				} else {
					return res.status(400).end();
				}
			} else {
				return res.status(400).end();
			}
		}

		// Select Columns
		let sql = 'SELECT ';

		sql += group.sql ?? (group.join ? group.join + '.name' : 'crashes.' + group.name);

		sql += ' \'group\'';

		for (const column of columns) {
			sql += ', ' + lookup.columns[column].sql + '(crashes.' + lookup.columns[column].name + ') ' + column;
		}

		// Join Tables
		sql += ' FROM crashes';

		if (group.join !== undefined) {
			sql += ' LEFT JOIN ' + group.join + ' ON crashes.' + group.name + ' = ' + group.join + '.id';
		}

		if (filter !== null && lookup.groups[filter.group].join !== undefined) {
			sql += ' LEFT JOIN ' + lookup.groups[filter.group].join + ' ON crashes.' + lookup.groups[filter.group].name + ' = ' + lookup.groups[filter.group].join + '.id';
		}

		// Filter Data
		if (filter !== null) {
			sql += ' WHERE ';

			sql += lookup.groups[filter.group].join
				? lookup.groups[filter.group].join + '.name'
				: 'crashes.' + filter.group;

			sql += filter.field !== 'null'
				? ' = \'' + filter.field + '\''
				: ' IS NULL';
		}

		// Group Data
		sql += ' GROUP BY ';

		sql += group.sql ?? (group.join ? group.join + '.name' : 'crashes.' + group.name);

		// Sort Data
		if (group.sql === undefined) {
			sql += ' ORDER BY ISNULL(';

			sql += group.sql ?? (group.join ? group.join + '.name' : 'crashes.' + group.name);

			sql += '), ';

			sql += group.sql ?? (group.join ? group.join + '.name' : 'crashes.' + group.name);

			if (group.isBoolean) sql += ' DESC';
		} else {
			sql += ' ORDER BY ' + group.sql;
		}

		// Execute SQL
		const data = (await mysql.query(sql))[0] as Record<string, string | number>[];

		// Parse Data
		const parsed: ResponseBody[] = [];

		for (const record of data) {
			const data: ResponseBody['data'] = {};

			for (const column of Object.keys(lookup.columns)) {
				if (record[column] !== undefined) data[column] = parseFloat(record[column].toString());
			}

			parsed.push({
				group: record.group !== null
					? group.isBoolean
						? record.group ? 'True' : 'False'
						: record.group.toString()
					: 'null',
				data
			});
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
