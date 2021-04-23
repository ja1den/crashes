// Import
import React from 'react';
import axios from 'axios';

import Joi from 'joi';

import Form from 'components/Form';

import toTitle from 'lib/toTitle';
import models from 'lib/models';

// Type
declare namespace UploadPage {
	export interface State {
		status: [number | null, string];
		data: {
			model: number;
			content: string | null;
			truncate: boolean;
			append: boolean;
		};
	}

	export interface Record {
		[key: string]: string | number | boolean | null;
	}
}

// Form Schema
const schema = Joi.object({
	model: Joi.number().required(),
	content: Joi.string().required(),
	truncate: Joi.boolean().required(),
	append: Joi.boolean().required()
});

// Upload Component
class UploadPage extends React.Component<object, UploadPage.State> {
	constructor(props: object) {
		super(props);

		this.state = {
			status: [null, ''],
			data: {
				model: 0,
				content: '',
				truncate: true,
				append: false
			}
		};
	}

	async componentDidUpdate(_prevProps: object, prevState: UploadPage.State) {
		if (prevState.status[0] !== 0 && this.state.status[0] === 0) setTimeout(() => this.setState({ status: [null, ''] }), 10 * 1000);
		if (prevState.status[0] !== 1 && this.state.status[0] === 1) setTimeout(() => this.setState({ status: [null, ''] }), 10 * 1000);
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

					<Form.SelectInput name={['model', 'Target Table']} options={Object.entries(models).reduce((arr: [number, string][], entry, index) => (
						[...arr, [index, toTitle(entry[1].name)] as [number, string]]
					), [])} onChange={this.onChange} />

					<Form.FileInput name={['content', 'File']} onChange={this.onChange} />

					<fieldset>
						<Form.BooleanInput name={['truncate', 'Truncate Table']} onChange={this.onChange} checked />
						<Form.BooleanInput name={['append', 'Ignore ID']} onChange={this.onChange} />
					</fieldset>

					<button type='submit' disabled={schema.validate(data).error !== undefined || status[0] === -1}>Submit</button>

					{status[0] !== null && status[0] !== -1 && (
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

		// Disable Button
		this.setState({ status: [-1, ''] });

		// Extract Lines
		const lines = this.state.data.content?.trim().split('\n').map(line => line.split(',').map(entry => entry.trim()));
		if (lines === undefined) return;

		// Find Model
		const model = Object.entries(models)[this.state.data.model][1];

		// Compare Columns
		for (let i = 0; i < Math.max(model.properties.length, lines[0].length); i++) {
			const m = toTitle(model.properties[i] ?? '') || model.properties[i];
			const l = lines[0][i];

			if (m === undefined) {
				this.setState({ status: [0, 'The column \'' + l + '\' is superfluous.'] });
				return;
			}

			if (l === undefined) {
				this.setState({ status: [0, 'The column \'' + m + '\' is missing.'] });
				return;
			}

			if (m !== l) {
				this.setState({ status: [0, 'The column \'' + l + '\' does not match \'' + m + '\'.'] });
				return;
			}
		}

		lines.shift();

		// Parse Records
		const records: UploadPage.Record[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// String to Object
			const record: UploadPage.Record = {};

			for (let j = 0; j < model.properties.length; j++) {
				const property = model.properties[j];

				let parsed: string | number | boolean | null = line[j];

				// Numbers and Booleans
				if (/(_?id)|units|fatalities|injuries|speed_limit|postcode/.test(property)) parsed = parseInt(line[j]);
				if (/dry|raining|day|alcohol|drugs/.test(property)) parsed = /[01]/.test(line[j]) ? !!+line[j] : null;

				// NULL
				if (line[j] === 'NULL') parsed = null;

				record[property] = parsed;
			}

			// Joi
			const { error } = model.schema.validate(record, { convert: false });

			if (error !== undefined) {
				this.setState({ status: [0, 'Line ' + (i + 1) + ': ' + error.message.replace(/"/g, '\'').replace(/pattern:.+?$/, 'pattern') + '.'] });
				return;
			}

			// Push Record
			records.push(record);
		}

		// Request Parameters
		const params: { truncate?: string, append?: string } = {};

		if (this.state.data.truncate) params.truncate = '1';
		if (this.state.data.append) params.append = '1';

		// Emit and Handle Request
		axios.post('/api/' + model.name, records, { params }).then(() => this.setState({ status: [1, 'Records created successfully.'] }))
			.catch(err => {
				switch (err.response.status) {
					case 409:
						this.setState({ status: [0, 'Duplicate record exists.'] });
						break;

					case 422:
						this.setState({ status: [0, 'Invalid foreign key.'] });
						break;

					case 403:
						this.setState({ status: [0, 'Illegal truncate.'] });
						break;

					default:
						this.setState({ status: [0, 'Internal server error.'] });
						break;
				}
			});
	}
}

// Export
export default UploadPage;
