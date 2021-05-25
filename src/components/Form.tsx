// Imports
import React from 'react';

// Types
declare namespace Form {
	export interface Props {
		onSubmit?: React.FormEventHandler<HTMLFormElement>;
	}

	export interface State<T> { data: T }

	export interface InputProps<T> {
		name: [string, string];
		onChange: (name: string, value: T) => void;
	}

	namespace BooleanInput {
		export interface Props extends InputProps<boolean> {
			checked?: boolean;
		}
	}

	namespace SelectInput {
		export interface Props extends InputProps<number> {
			options: [number, string][];
		}
	}
}

// Form Component
class Form extends React.Component<Form.Props> {
	render = () => (
		<article>
			<form onSubmit={this.props.onSubmit}>{this.props.children}</form>
		</article>
	);

	// String Input
	static StringInput = class StringInput extends React.Component<Form.InputProps<string>, Form.State<string>> {
		state = { data: '' };

		// Component HTML
		render = () => (
			<label htmlFor={this.props.name[0]}>
				{this.props.name[1]}
				<input type='text' id={this.props.name[0]} maxLength={255} aria-invalid={this.state.data === ''} onChange={this.onChange} />
			</label>
		);

		// Handle Change
		onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
			this.props.onChange(this.props.name[0], e.target.value);
			this.setState({ data: e.target.value });
		}
	}

	// Number Input
	static NumberInput = class NumberInput extends React.Component<Form.InputProps<number>, Form.State<number>> {
		state = { data: NaN };

		// Component HTML
		render = () => (
			<label htmlFor={this.props.name[0]}>
				{this.props.name[1]}
				<input type='number' id={this.props.name[0]} min='0' aria-invalid={!Number.isInteger(this.state.data)} onKeyDown={this.onKeyDown} onChange={this.onChange} />
			</label>
		);

		// Handle Change
		onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
			const data = parseInt(e.target.value);

			this.props.onChange(this.props.name[0], data);
			this.setState({ data });
		}

		// Handle Key Down
		onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
			if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
		}
	}

	// Boolean Input
	static BooleanInput = class BooleanInput extends React.Component<Form.BooleanInput.Props, Form.State<boolean>> {
		constructor(props: Form.BooleanInput.Props) {
			super(props);

			this.state = {
				data: props.checked ?? false
			};
		}

		// Component HTML
		render = () => (
			<label htmlFor={this.props.name[0]}>
				<input type='checkbox' id={this.props.name[0]} role='switch' defaultChecked={this.props.checked} onChange={this.onChange} />
				{this.props.name[1]}
			</label>
		);

		// Handle Change
		onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
			this.props.onChange(this.props.name[0], e.target.checked);
			this.setState({ data: e.target.checked });
		}
	}

	// Date Input
	static DateInput = class DateInput extends React.Component<Form.InputProps<string>, Form.State<string>> {
		state = { data: '' };

		// Component HTML
		render = () => (
			<label htmlFor={this.props.name[0]}>
				{this.props.name[1]}
				<input type='month' id={this.props.name[0]} aria-invalid={this.state.data === ''} onChange={this.onChange} />
			</label>
		);

		// Handle Change
		onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
			this.props.onChange(this.props.name[0], e.target.value + '-01');
			this.setState({ data: e.target.value + '-01' });
		}
	}

	// Time Input
	static TimeInput = class TimeInput extends React.Component<Form.InputProps<string>, Form.State<string>> {
		state = { data: '' };

		// Component HTML
		render = () => (
			<label htmlFor={this.props.name[0]}>
				{this.props.name[1]}
				<input type='time' id={this.props.name[0]} aria-invalid={this.state.data === ''} onChange={this.onChange} />
			</label>
		);

		// Handle Change
		onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
			this.props.onChange(this.props.name[0], e.target.value);
			this.setState({ data: e.target.value });
		}
	}

	// Select Input
	static SelectInput = class SelectInput extends React.Component<Form.SelectInput.Props, Form.State<number>> {
		constructor(props: Form.SelectInput.Props) {
			super(props);

			this.state = {
				data: props.options[0]?.[0]
			};
		}

		// Update State
		componentDidUpdate() {
			if (this.state.data === undefined && this.props.options.length !== 0) {
				this.setState({
					data: this.props.options[0][0]
				});
			}
		}

		// Component HTML
		render = () => (
			<label htmlFor={this.props.name[0]}>
				{this.props.name[1]}
				<select id={this.props.name[0]} onChange={this.onChange}>
					{this.props.options.map(option => (
						<option key={option[0]} value={option[0]}>{option[1]}</option>
					))}
				</select>
			</label>
		);

		// Handle Change
		onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
			const data = parseInt(e.target.value);

			this.props.onChange(this.props.name[0], data);
			this.setState({ data });
		}
	}

	// File Input
	static FileInput = class TimeInput extends React.Component<Form.InputProps<string>, Form.State<string>> {
		state = { data: '' };

		// Component HTML
		render = () => (
			<label htmlFor={this.props.name[0]}>
				{this.props.name[1]}
				<input type='file' id={this.props.name[0]} accept='.csv' onChange={this.onChange} />
			</label>
		);

		// Handle Change
		onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
			// Handle Unset
			if (e.target.files === null || e.target.files?.length === 0) {
				this.props.onChange(this.props.name[0], '');
				return this.setState({ data: '' });
			}

			// File Type
			if (e.target.files?.[0].name.match(/.+.csv$/) === null) return;

			// Read File
			const reader = new FileReader();

			reader.onload = async () => {
				const data = reader.result as string;

				this.props.onChange(this.props.name[0], data);
				this.setState({ data });
			};

			reader.readAsText(e.target.files[0]);
		}
	}
}

// Export
export default Form;
