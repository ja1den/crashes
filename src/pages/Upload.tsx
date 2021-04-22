// Import
import React from 'react';
import axios from 'axios';

import Joi from 'joi';

import Form from 'components/Form';

import { crashType, crash, curve, region, roadType, slope, suburb, surface } from 'lib/models';
import toTitle from 'lib/toTitle';

// Type
declare namespace UploadPage {
	export interface State {
		status: [number | null, string];
		data: {
			table: number;
			content: string | null;
			truncate: boolean;
			id: boolean;
		};
	}

	export interface Table { name: string; columns: string[]; schema: Joi.Schema }

	export interface Record {
		[key: string]: string | number | boolean | null;
	}
}

// Form Schema
const schema = Joi.object({
	table: Joi.number().required(),
	content: Joi.string().required(),
	truncate: Joi.boolean().required(),
	id: Joi.boolean().required()
});

// Tables
const tables: UploadPage.Table[] = [
	{ name: 'crash_types', columns: ['ID', 'Name'], schema: crashType },
	{ name: 'crashes', columns: ['ID', 'Region ID', 'Suburb ID', 'Units', 'Fatalities', 'Injuries', 'Date', 'Time', 'Speed Limit', 'Road Type ID', 'Curve ID', 'Slope ID', 'Surface ID', 'Dry', 'Raining', 'Day', 'Crash Type ID', 'Alcohol', 'Drugs'], schema: crash },
	{ name: 'curves', columns: ['ID', 'Name'], schema: curve },
	{ name: 'regions', columns: ['ID', 'Name'], schema: region },
	{ name: 'road_types', columns: ['ID', 'Name'], schema: roadType },
	{ name: 'slopes', columns: ['ID', 'Name'], schema: slope },
	{ name: 'suburbs', columns: ['ID', 'Name', 'Postcode'], schema: suburb },
	{ name: 'surfaces', columns: ['ID', 'Name'], schema: surface }
];

// Upload Component
class UploadPage extends React.Component<object, UploadPage.State> {
	constructor(props: object) {
		super(props);

		this.state = {
			status: [null, ''],
			data: {
				table: 0,
				content: '',
				truncate: true,
				id: false
			}
		};
	}

	async componentDidUpdate(_prevProps: object, prevState: UploadPage.State) {
		if (prevState.status[0] === null && this.state.status[0] !== null) setTimeout(() => this.setState({ status: [null, ''] }), 10 * 1000);
	}

	render() {
		const { status, data } = this.state;

		// Component HTML
		return (
			<main id='upload'>
				<hgroup>
					<h2>Upload</h2>
					<h3>Create records in bulk.</h3>
				</hgroup>

				<Form onSubmit={this.onSubmit}>
					<h6>Upload Comma Separated Data</h6>

					<Form.SelectInput name={['table', 'Target Table']} options={tables.reduce((arr: [number, string][], table: UploadPage.Table, index: number) => (
						[...arr, [index, toTitle(table.name)]] as [number, string][]
					), [])} onChange={this.onChange} />

					<Form.FileInput name={['content', 'File']} onChange={this.onChange} />

					<fieldset>
						<Form.BooleanInput name={['truncate', 'Truncate Table']} onChange={this.onChange} checked />
						<Form.BooleanInput name={['id', 'Ignore ID']} onChange={this.onChange} />
					</fieldset>

					<button type='submit' disabled={schema.validate(data).error !== undefined}>Submit</button>

					{status[0] !== null && (
						!!status[0]
							? <ins>{status[1]}</ins>
							: <del>{status[1]}</del>
					)}
				</Form>
			</main>
		);
	}

	// Handle Change
	onChange = (name: string, value: string | number | boolean) => {
		this.setState(state => ({
			data: {
				...state.data,
				[name]: value
			}
		}));
	}

	// Handle Submit
	onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();

		// Extract Lines
		const lines = this.state.data.content?.trim().split('\n').map(line => line.split(',').map(entry => entry.trim()));
		if (lines === undefined) return;

		// Find Table Entry
		const table = tables[this.state.data.table];

		// Compare Columns
		for (let i = 0; i < Math.max(table.columns.length, lines[0].length); i++) {
			if (table.columns[i] === undefined) {
				this.setState({ status: [0, 'The column \'' + lines[0][i] + '\' is superfluous.'] });
				return;
			}

			if (lines[0][i] === undefined) {
				this.setState({ status: [0, 'The column \'' + table.columns[i] + '\' is missing.'] });
				return;
			}

			if (table.columns[i] !== lines[0][i]) {
				this.setState({ status: [0, 'The column \'' + lines[0][i] + '\' does not match \'' + table.columns[i] + '\'.'] });
				return;
			}
		}

		lines.shift();

		// Column Names to Property Names
		const columns = table.columns.map(column => column.toLowerCase().replace(/ /g, '_'));

		// Strings to Columns
		const records: UploadPage.Record[] = [];

		for (const line of lines) {
			const record: UploadPage.Record = {};

			for (let i = 0; i < columns.length; i++) {
				let parsed: string | number | boolean | null = line[i];

				// String to Number / Boolean
				if (/(_?id)|units|fatalities|injuries|speed_limit|postcode/.test(columns[i])) parsed = parseInt(line[i]);
				if (/dry|raining|day|alcohol|drugs/.test(columns[i])) parsed = /[01]/.test(line[i]) ? !!+line[i] : null;

				// Parse NULL
				if (line[i] === 'NULL') parsed = null;

				record[columns[i]] = parsed;
			}

			// Joi
			const { error } = table.schema.validate(record, { convert: false });

			if (error !== undefined) {
				this.setState({ status: [0, 'Record ' + line[0] + ': ' + error.message.replace(/"/g, '\'').replace(/pattern:.+?$/, 'pattern') + '.'] });
				return;
			}

			// Push Record
			records.push(record);
		}

		console.log(records);

		// Emit and Handle Request
		axios.post('/api/crashes', records).then(() => this.setState({ status: [1, 'Records created successfully.'] }))
			.catch(() => this.setState({ status: [0, 'Internal server error.'] }));
	}
}

// Export
export default UploadPage;
