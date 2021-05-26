// Types
export interface Lookup {
	columns: Record<string, Column>;
}

export interface Column {
	name: string;
	display: string;
	sql: string;
	color: string;
}

// Lookup
const lookup: Lookup = {
	columns: {
		crashes: {
			name: 'id',
			display: 'Crashes',
			sql: 'COUNT',
			color: '338, 78%, 48%'
		},
		fatalities: {
			name: 'fatalities',
			display: 'Fatalities',
			sql: 'SUM',
			color: '287, 65%, 40%'
		},
		injuries: {
			name: 'injuries',
			display: 'Injuries',
			sql: 'SUM',
			color: '208, 79%, 51%'
		},
		units: {
			name: 'units',
			display: 'Units',
			sql: 'SUM',
			color: '123, 41%, 45%'
		}
	}
};

// Export
export default lookup;
