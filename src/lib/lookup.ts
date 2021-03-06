// Types
export interface Lookup {
	columns: Record<string, Column>;
	groups: Record<string, Group>;
}

export interface Column {
	name: string;
	display: string;
	sql: string;
	color: string;
}

export interface Group {
	name: string;

	isBoolean?: boolean;

	sql?: string;
	join?: string;

	onlyFilter?: boolean;
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
	},
	groups: {
		region: {
			name: 'region_id',
			join: 'regions'
		},
		suburb: {
			name: 'suburb_id',
			join: 'suburbs',
			onlyFilter: true
		},
		date: {
			name: 'date',
			sql: 'YEAR(crashes.date)'
		},
		speed_limit: {
			name: 'speed_limit'
		},
		road_type: {
			name: 'road_type_id',
			join: 'road_types'
		},
		curve: {
			name: 'curve_id',
			join: 'curves'
		},
		slope: {
			name: 'slope_id',
			join: 'slopes'
		},
		surface: {
			name: 'surface_id',
			join: 'surfaces'
		},
		dry: {
			name: 'dry',
			isBoolean: true
		},
		raining: {
			name: 'raining',
			isBoolean: true
		},
		day: {
			name: 'day',
			isBoolean: true
		},
		crash_type: {
			name: 'crash_type_id',
			join: 'crash_types'
		},
		alcohol: {
			name: 'alcohol',
			isBoolean: true
		},
		drugs: {
			name: 'drugs',
			isBoolean: true
		}
	}
};

// Export
export default lookup;
