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

interface ChangeUpdate {
	[key: string]: number | string | boolean | Date | null;
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
				date: null,
				time: null,
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
			axios.get('/api/data/' + pName).then(res => {
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
		// Destructure
		const { status, data, records } = this.state;

		// Component HTML
		return (
			<article>
				<form onSubmit={this.onSubmit}>
					<h4>Create a Crash</h4>

					<div className='grid'>
						<label htmlFor='regionField'>
							Region
							<select id='regionField' onChange={this.onChangeSelect}>
								{records.regions.map(region => (
									<option key={region.id}>{region.name}</option>
								))}
							</select>
						</label>

						<label htmlFor='suburbField'>
							Suburb
							<select id='suburbField' onChange={this.onChangeSelect}>
								{records.suburbs.map(suburb => (
									<option key={suburb.id}>{suburb.name}</option>
								))}
							</select>
						</label>
					</div>

					<label htmlFor='unitField'>No. Units</label>
					<input type='number' id='unitField' min='0' aria-invalid={!Number.isInteger(data.units)} onKeyDown={this.onKeyDown} onChange={this.onChangeInput} />

					<div className='grid'>
						<label htmlFor='fatalitiesField'>
							No. Fatalities
							<input type='number' id='fatalitiesField' min='0' aria-invalid={!Number.isInteger(data.fatalities)} onKeyDown={this.onKeyDown} onChange={this.onChangeInput} />
						</label>

						<label htmlFor='injuriesField'>
							No. Injuries
							<input type='number' id='injuriesField' min='0' aria-invalid={!Number.isInteger(data.injuries)} onKeyDown={this.onKeyDown} onChange={this.onChangeInput} />
						</label>
					</div>

					<div className='grid'>
						<label htmlFor='dateField'>
							Date
							<input type='month' id='dateField' aria-invalid={data.date === null} onChange={this.onChangeInput} />
						</label>

						<label htmlFor='timeField'>
							Time
							<input type='time' id='timeField' aria-invalid={data.time === null} onChange={this.onChangeInput} />
						</label>
					</div>

					<label htmlFor='speedField'>Speed Limit</label>
					<input type='number' id='speedField' min='0' aria-invalid={!Number.isInteger(data.speed_limit)} onKeyDown={this.onKeyDown} onChange={this.onChangeInput} />

					<label htmlFor='roadField'>Road Type</label>
					<select id='roadField' onChange={this.onChangeSelect}>
						{records.roadTypes.map(roadType => (
							<option key={roadType.id}>{roadType.name}</option>
						))}
					</select>

					<div className='grid'>
						<label htmlFor='curveField'>
							Curve
							<select id='curveField' onChange={this.onChangeSelect}>
								{records.curves.map(curve => (
									<option key={curve.id}>{curve.name}</option>
								))}
							</select>
						</label>

						<label htmlFor='slopeField'>
							Slope
							<select id='slopeField' onChange={this.onChangeSelect}>
								{records.slopes.map(slope => (
									<option key={slope.id}>{slope.name}</option>
								))}
							</select>
						</label>
					</div>

					<label htmlFor='surfaceField'>Surface</label>
					<select id='surfaceField' onChange={this.onChangeSelect}>
						{records.surfaces.map(surface => (
							<option key={surface.id}>{surface.name}</option>
						))}
					</select>

					<fieldset>
						<label htmlFor='dryField'>
							<input type='checkbox' id='dryField' role='switch' defaultChecked={true} onChange={this.onChangeInput} />
							Dry
						</label>

						<label htmlFor='rainField'>
							<input type='checkbox' id='rainField' role='switch' onChange={this.onChangeInput} />
							Raining
						</label>

						<label htmlFor='dayField'>
							<input type='checkbox' id='dayField' role='switch' defaultChecked={true} onChange={this.onChangeInput} />
							Day
						</label>
					</fieldset>

					<label htmlFor='crashField'>Crash Type</label>
					<select id='crashField' onChange={this.onChangeSelect}>
						{records.crashTypes.map(crashType => (
							<option key={crashType.id}>{crashType.name}</option>
						))}
					</select>

					<fieldset>
						<label htmlFor='alcoholField'>
							<input type='checkbox' id='alcoholField' role='switch' onChange={this.onChangeInput} />
							DUI Involved
						</label>

						<label htmlFor='drugsField'>
							<input type='checkbox' id='drugsField' role='switch' onChange={this.onChangeInput} />
							Drugs Involved
						</label>
					</fieldset>

					<button type='submit' disabled={crash.validate(this.state.data).error !== undefined}>Submit</button>

					{this.state.status[0] !== null && (
						!!status[0]
							? <ins>{this.state.status[1]}</ins>
							: <del>{this.state.status[1]}</del>
					)}
				</form>
			</article>
		);
	}

	// Handle Input Change
	onChangeInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		const update: ChangeUpdate = {};

		// Field Name
		let name = event.target.id.match(/.+(?=Field)/)?.[0] ?? null;
		if (name === null) return;

		if (name === 'unit') name = 'units';
		if (name === 'speed') name = 'speed_limit';
		if (name === 'rain') name = 'raining';

		// Switch on Input Type
		switch (event.target.type) {
			case 'number':
				update[name] = parseInt(event.target.value);
				break;

			case 'month':
				update[name] = event.target.value !== ''
					? new Date(event.target.value)
					: null;
				break;

			case 'time':
				update[name] = event.target.value;
				break;

			case 'checkbox':
				update[name] = event.target.checked;
				break;
		}

		// Update Data
		this.setState(state => ({
			data: {
				...state.data,
				...update
			}
		}));
	}

	// Handle Select Change
	onChangeSelect: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
		const update: ChangeUpdate = {};

		// Field Name
		let name = event.target.id.match(/.+(?=Field)/)?.[0] ?? null;
		if (name === null) return;

		if (name === 'crash') name = 'crash_type';
		if (name === 'road') name = 'road_type';


		// @ts-ignore Records
		let records = this.state.records[name + 's'];

		if (name === 'crash_type') records = this.state.records.crashTypes;
		if (name === 'road_type') records = this.state.records.roadTypes;

		// Find Record ID
		update[name + '_id'] = records.find((record: { name: string }) =>
			record.name === event.target.value
		).id;

		// Update Data
		this.setState(state => ({
			data: {
				...state.data,
				...update
			}
		}));
	}

	// Handle Submit
	onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
		// Emit and Handle Request
		axios.post('/api/data/crashes', this.state.data)
			.then(() => this.setState({ status: [1, 'Record created successfully.'] }))
			.catch(() => {
				this.setState({ status: [0, 'Internal server error.'] })
			})
			.finally(() => setTimeout(() => this.setState({ status: [null, ''] }), 10 * 1000));

		event.preventDefault();
	}

	// Filter Number Inputs
	onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
		if (['e', 'E', '+', '-', '.'].includes(event.key)) event.preventDefault();
	}
}

// Export
export default CrashForm;
