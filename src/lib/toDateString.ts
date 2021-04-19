/**
 * Format a date object.
 * @param input The date object to format.
 * @returns The formatted date string.
 */
const toDateString = (input: Date) => {
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

	return months[input.getMonth()] + ' ' + input.getFullYear();
}

// Export
export default toDateString;
