// Import
import React, { useState } from 'react';
import axios from 'axios';

import { slope, Slope } from 'lib/models';

import Form from 'components/Form';

// Form Component
const SlopeForm: React.FC = () => {
	const [status, setStatus] = useState<[number | null, string]>([null, '']);
	const [data, setData] = useState<Omit<Slope, 'id'>>({ name: '' });

	// Handle Change
	const onChange = (_name: string, value: string) => {
		setData({ name: value });
	}

	// Handle Submit
	const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
		// Emit and Handle Request
		axios.post('/api/data/slopes', data)
			.then(() => setStatus([1, 'Record created successfully.']))
			.catch(err => {
				if (err.response.status === 409) {
					setStatus([0, 'The record \'' + data.name + '\' already exists.']);
				} else {
					setStatus([0, 'Internal server error.']);
				}
			})
			.finally(() => setTimeout(() => setStatus([null, '']), 10 * 1000));

		event.preventDefault();
	}

	// Component HTML
	return (
		<Form onSubmit={onSubmit}>
			<h6>Create a Slope</h6>

			<Form.StringInput name={['name', 'Name']} onChange={onChange} />

			<button type='submit' disabled={slope.validate(data).error !== undefined}>Submit</button>

			{status[0] !== null && (
				!!status[0]
					? <ins>{status[1]}</ins>
					: <del>{status[1]}</del>
			)}
		</Form>
	);
}

// Export
export default SlopeForm;
