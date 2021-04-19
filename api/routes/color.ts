// Import
import { Request, Response } from 'express';

// Random
function getRandom(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

// Export
export default async (_req: Request, res: Response) => {
	// List of Colors
	const colors = [
		'#FF4136',
		'#FF851B',
		'#FFDC00',
		'#2ECC40',
		'#0074D9',
		'#F012BE',
		'#B10DC9'
	];

	// Send Response
	res.send({ color: colors[getRandom(0, colors.length)] });
}
