// Import
import path from 'path';
import fs from 'fs';

import { Request, Response } from 'express';

import mysql from '../lib/mysql';

// Read File
const sql = fs.readFileSync(path.resolve(__dirname, '..', 'sql', 'summary.sql')).toString();

// Export
export default async (req: Request, res: Response) => {
	// Invalid Method
	if (req.method !== 'GET') return res.status(405).end();

	// Execute SQL
	const data = (await mysql.query(sql))[0][0];

	// Numbers
	for (const key in data) {
		data[key] = parseInt(data[key]);
	}

	// Send Response
	res.send(data);
}
