// Types
export interface Lookup {
	columns: Record<string, Column>;
}

export interface Column {
	name: string;
	display: string;
	sql: string;
}

// Lookup
const lookup: Lookup = {
	columns: {
		crashes: {
			name: 'id',
			display: 'Crashes',
			sql: 'COUNT'
		},
		fatalities: {
			name: 'fatalities',
			display: 'Fatalities',
			sql: 'SUM'
		},
		injuries: {
			name: 'injuries',
			display: 'Injuries',
			sql: 'SUM'
		},
		units: {
			name: 'units',
			display: 'Units',
			sql: 'SUM'
		}
	}
};

// Export
export default lookup;
