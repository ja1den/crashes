// Import
import React from 'react';
import axios from 'axios';

import { crash, Crash } from 'lib/models';
import {
	CrashType,
	Curve,
	Region,
	RoadType,
	Slope,
	Suburb,
	Surface
} from 'lib/models';

import Form from 'components/Form';

// Types
declare namespace CrashForm {
	export interface State {
		status: [number | null, string];
		data: Omit<Crash, 'id'>;
		records: {
			crashTypes: CrashType[];
			curves: Curve[];
			regions: Region[];
			roadTypes: RoadType[];
			slopes: Slope[];
			suburbs: Suburb[];
			surfaces: Surface[];
		}
	}
}

// Form Component
class CrashForm extends React.Component<object, CrashForm.State> {
	_mounted = true;

	constructor(props: object) {
		super(props);

		this.state = {
			status: [null, ''],
			data: {
				region_id: NaN,
				suburb_id: NaN,
				units: NaN,
				fatalities: NaN,
				injuries: NaN,
				date: '',
				time: '',
				speed_limit: NaN,
				road_type_id: NaN,
				curve_id: NaN,
				slope_id: NaN,
				surface_id: NaN,
				dry: true,
				raining: false,
				day: true,
				crash_type_id: NaN,
				alcohol: false,
				drugs: false
			},
			records: {
				crashTypes: [],
				curves: [],
				regions: [],
				roadTypes: [],
				slopes: [],
				suburbs: [],
				surfaces: []
			}
		};
	}

	// Read Records
	async componentDidMount() {
		Object.keys(this.state.records).forEach(name => {
			const pName = name.split(/(?=[A-Z])/).map(x => x.toLowerCase()).join('_');
			axios.get('/api/' + pName).then(res => {
				this._mounted && this.setState(state => ({
					data: {
						...state.data,
						[pName.slice(0, -1) + '_id']: res.data.data[0].id
					},
					records: {
						...state.records,
						[name]: res.data.data
					}
				}))
			});
		});
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render() {
		const { status, data, records } = this.state;

		// Component HTML 
		return (
			<article>
				<form onSubmit={this.onSubmit}>
					<h4>Create a Crash</h4>

					<div className='grid'>
						<Form.SelectInput name={['region_id', 'Region']} options={records.regions.reduce((arr: [number, string][], region: Region) => (
							[...arr, [region.id, region.name]] as [number, string][]
						), [])} onChange={this.onChange} />

						<Form.SelectInput name={['suburb_id', 'Suburb']} options={records.suburbs.reduce((arr: [number, string][], suburb: Suburb) => (
							[...arr, [suburb.id, suburb.name]] as [number, string][]
						), [])} onChange={this.onChange} />
					</div>

					<Form.NumberInput name={['units', 'No. Units']} onChange={this.onChange} />

					<div className='grid'>
						<Form.NumberInput name={['fatalities', 'No. Fatalities']} onChange={this.onChange} />
						<Form.NumberInput name={['injuries', 'No. Injuries']} onChange={this.onChange} />
					</div>

					<div className='grid'>
						<Form.DateInput name={['date', 'Date']} onChange={this.onChange} />
						<Form.TimeInput name={['time', 'Time']} onChange={this.onChange} />
					</div>

					<Form.NumberInput name={['speed_limit', 'Speed Limit']} onChange={this.onChange} />

					<Form.SelectInput name={['road_type_id', 'Road Type']} options={records.roadTypes.reduce((arr: [number, string][], roadType: RoadType) => (
						[...arr, [roadType.id, roadType.name]] as [number, string][]
					), [])} onChange={this.onChange} />

					<div className='grid'>
						<Form.SelectInput name={['curve_id', 'Curve']} options={records.curves.reduce((arr: [number, string][], curve: Curve) => (
							[...arr, [curve.id, curve.name]] as [number, string][]
						), [])} onChange={this.onChange} />

						<Form.SelectInput name={['slope_id', 'Slope']} options={records.slopes.reduce((arr: [number, string][], slope: Slope) => (
							[...arr, [slope.id, slope.name]] as [number, string][]
						), [])} onChange={this.onChange} />
					</div>

					<Form.SelectInput name={['surface_id', 'Surface']} options={records.surfaces.reduce((arr: [number, string][], surface: Surface) => (
						[...arr, [surface.id, surface.name]] as [number, string][]
					), [])} onChange={this.onChange} />

					<fieldset>
						<Form.BooleanInput name={['dry', 'Dry']} onChange={this.onChange} checked />
						<Form.BooleanInput name={['raining', 'Raining']} onChange={this.onChange} />
						<Form.BooleanInput name={['day', 'Day']} onChange={this.onChange} checked />
					</fieldset>

					<Form.SelectInput name={['crash_type_id', 'Crash Type']} options={records.crashTypes.reduce((arr: [number, string][], crashType: CrashType) => (
						[...arr, [crashType.id, crashType.name]] as [number, string][]
					), [])} onChange={this.onChange} />

					<fieldset>
						<Form.BooleanInput name={['alcohol', 'DUI Involved']} onChange={this.onChange} />
						<Form.BooleanInput name={['drugs', 'Drugs Involved']} onChange={this.onChange} />
					</fieldset>

					<button type='submit' disabled={crash.validate(data).error !== undefined}>Submit</button>

					{status[0] !== null && (
						!!status[0]
							? <ins>{status[1]}</ins>
							: <del>{status[1]}</del>
					)}
				</form>
			</article>
		);
	}

	// Handle Change
	onChange = (name: string, value: string | number | boolean | Date | null) => {
		this.setState(state => ({
			data: {
				...state.data,
				[name]: value
			}
		}));
	}

	// Handle Submit
	onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
		// Emit and Handle Request
		axios.post('/api/crashes', this.state.data)
			.then(() => this.setState({ status: [1, 'Record created successfully.'] }))
			.catch(() => {
				this.setState({ status: [0, 'Internal server error.'] })
			})
			.finally(() => setTimeout(() => this.setState({ status: [null, ''] }), 10 * 1000));

		event.preventDefault();
	}
}

// Export
export default CrashForm;
