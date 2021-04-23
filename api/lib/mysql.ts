// Import
import mysql from 'mysql2';

// MySQL
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT ?? ''),

	user: process.env.DB_USER,
	password: process.env.DB_PASS,

	database: 'crashes'
});

// Export
export default connection.promise();
