/**
 * Format a date string.
 * @param input The string to format.
 * @returns The formatted string.
 */
const toDateString = (input: string) => {
	if (!/\d+-\d+/.test(input)) return input;

	const match = input.toString().match(/\d+/g);

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	return months[parseInt(match![1]) - 1] + ' ' + match![0];
}

// Export
export default toDateString;
