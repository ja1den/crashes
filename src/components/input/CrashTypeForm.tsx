// Import
import React, { useState } from 'react';
import axios from 'axios';

import { crashTypes, CrashType } from 'lib/models';

import Form from 'components/Form';

// Form Component
const CrashTypeForm: React.FC = () => {
	const [status, setStatus] = useState<[number | null, string]>([null, '']);
	const [data, setData] = useState<Omit<CrashType, 'id'>>({ name: '' });

	// Handle Change
	const onChange = (_name: string, data: string) => {
		setData({ name: data });
	}

	// Handle Submit
	const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
		// Emit and Handle Request
		axios.post('/api/crash_types', data)
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
			<h6>Create a Crash Type</h6>

			<Form.StringInput name={['name', 'Name']} onChange={onChange} />

			<button type='submit' disabled={crashTypes.schema.validate(data).error !== undefined}>Submit</button>

			{status[0] !== null && (
				!!status[0]
					? <ins>{status[1]}</ins>
					: <del>{status[1]}</del>
			)}
		</Form>
	);
}

// Export
export default CrashTypeForm;
