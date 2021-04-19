/**
 * Convert camel case to title case.
 * @param name The string to convert.
 * @returns The converted string.
 */
function toTitle(name: string) {
	return name.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ').replace(/\bID\b/ig, 'ID');
}

// Export
export default toTitle;
