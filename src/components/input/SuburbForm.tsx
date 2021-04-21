// Import
import React from 'react';
import axios from 'axios';

import { suburb, Suburb } from 'lib/models';

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
		// Destructure
		const { status, data } = this.state;

		// Component HTML
		return (
			<article>
				<form onSubmit={this.onSubmit}>
					<h6>Create a Suburb</h6>

					<label htmlFor='nameField'>Name</label>
					<input type='text' id='nameField' maxLength={255} aria-invalid={data.name === ''} onChange={this.onChange} />

					<label htmlFor='postcodeField'>Postcode</label>
					<input type='number' id='postcodeField' min='0' aria-invalid={!Number.isInteger(data.postcode)} onKeyDown={this.onKeyDown} onChange={this.onChange} />

					<button type='submit' disabled={suburb.validate(data).error !== undefined}>Submit</button>

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
	onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		const update: Partial<SuburbForm.State['data']> = {};

		// Switch on Target ID
		switch (event.target.id) {
			case 'nameField':
				update.name = event.target.value;
				break;

			case 'postcodeField':
				update.postcode = parseInt(event.target.value)
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

	// Handle Submit
	onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
		// Emit and Handle Request
		axios.post('/api/data/suburbs', this.state.data)
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

	// Filter Number Inputs
	onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
		if (['e', 'E', '+', '-', '.'].includes(event.key)) event.preventDefault();
	}
}

// Export
export default SuburbForm;
