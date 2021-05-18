// Types
interface Lookup {
	columns: {
		[key: string]: {
			name: string;
			sql: string;
			alias: string;
		}
	}
}

// Lookup
const lookup: Lookup = {
	columns: {
		id: {
			name: 'Total Crashes',
			sql: 'COUNT',
			alias: 'total'
		},
		fatalities: {
			name: 'Fatalities',
			sql: 'SUM',
			alias: 'fatalities'
		},
		injuries: {
			name: 'Injuries',
			sql: 'SUM',
			alias: 'injuries'
		},
		units: {
			name: 'Units',
			sql: 'SUM',
			alias: 'units'
		}
	}
};

// Export
export default lookup;
