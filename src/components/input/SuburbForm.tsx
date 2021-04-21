// Import
import React from 'react';
import axios from 'axios';

import { suburb, Suburb } from 'lib/models';

import Form from 'components/Form';

// Types
declare namespace SuburbForm {
	export interface State {
		status: [number | null, string];
		data: Omit<Suburb, 'id'>;
	}
}

// Form Component
class SuburbForm extends React.Component<object, SuburbForm.State> {
	constructor(props: object) {
		super(props);

		this.state = {
			status: [null, ''],
			data: {
				name: '',
				postcode: NaN
			}
		};
	}

	render() {
		const { status, data } = this.state;

		// Component HTML
		return (
			<Form onSubmit={this.onSubmit}>
				<h6>Create a Suburb</h6>

				<Form.StringInput name={['name', 'Name']} onChange={this.onChange} />
				<Form.NumberInput name={['postcode', 'Postcode']} onChange={this.onChange} />

				<button type='submit' disabled={suburb.validate(data).error !== undefined}>Submit</button>

				{status[0] !== null && (
					!!status[0]
						? <ins>{status[1]}</ins>
						: <del>{status[1]}</del>
				)}
			</Form>
		);
	}

	// Handle Change
	onChange = (name: string, value: string | number) => {
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
		axios.post('/api/suburbs', this.state.data)
			.then(() => this.setState({ status: [1, 'Record created successfully.'] }))
			.catch(err => {
				if (err.response.status === 409) {
					this.setState({ status: [0, 'The record \'' + this.state.data.name + '\' already exists.'] });
				} else {
					this.setState({ status: [0, 'Internal server error.'] });
				}
			})
			.finally(() => setTimeout(() => this.setState({ status: [null, ''] }), 10 * 1000));

		event.preventDefault();
	}
}

// Export
export default SuburbForm;
