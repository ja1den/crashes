// Import
import path from 'path';
import fs from 'fs';

/**
 * Recursively scan a directory.
 * @param dir The directory to scan.
 * @returns The paths in the directory.
 */
const getFiles = (dir: string): string[] => {
	const dirents = fs.readdirSync(dir, { withFileTypes: true });

	const files = dirents.map(dirent => {
		return dirent.isDirectory() ? getFiles(path.resolve(dir, dirent.name)) : path.resolve(dir, dirent.name)
	});

	return files.flat();
}

// Export
export default getFiles;
