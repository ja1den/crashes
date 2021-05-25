// Import
import React, { Fragment } from 'react';
import axios from 'axios';

import { Chart, registerables } from 'chart.js';

import lookup from 'lib/lookup';

import Form from 'components/Form';

// Register Chart.js
Chart.register(...registerables);

// Types
declare namespace HomePage {
	export interface State {
		columns: string[];
		data?: Data[];
	}

	export interface Data {
		group: string;
		data: {
			total?: number;
			fatalities?: number;
			injuries?: number;
			units?: number;
		}
	}
}

// Home Component
class HomePage extends React.Component<object, HomePage.State> {
	_mounted = true;

	_canvas: HTMLCanvasElement | null = null;
	_chart: Chart | null = null;

	_colours = [
		'338, 78%, 48%',
		'287, 65%, 40%',
		'208, 79%, 51%',
		'123, 41%, 45%'
	];

	constructor(props: object) {
		super(props);

		this.state = {
			columns: Object.keys(lookup.columns)
		}
	}

	componentDidMount() {
		this.requestData();
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render() {
		// Update Chart
		if (this._chart !== null && this.state.data !== undefined) {
			this._chart.data = {
				labels: Object.values(this.state.data).reduce(
					(labels: string[], entry) => [...labels, entry.group], []
				),
				datasets: this.state.columns.map((column, index) => ({
					label: lookup.columns[column].display,
					data: this.state.data!.map(
						entry => entry.data[column as keyof HomePage.Data['data']] ?? null
					),
					backgroundColor: 'hsl(' + this._colours[index] + ', 0.2)',
					borderColor: 'hsl(' + this._colours[index] + ', 1.0)',
					borderWidth: 1
				}))
			};

			this._chart.update();
		}

		// Table Data
		const table = {
			headers: ['Group', ...this.state.columns.map(column => lookup.columns[column].display)],
			data: this.state.data?.map(entry => ([
				entry.group, ...this.state.columns.map(column => entry.data[column as keyof HomePage.Data['data']])
			]))
		}

		// Component HTML
		return (
			<main id='home'>
				<hgroup>
					<h2>Home</h2>
					<h3>Data summary.</h3>
				</hgroup>

				<Form>
					<h6>Select Data</h6>

					<div className='grid'>
						{Object.entries(lookup.columns).map(([alias, meta]) => (
							<Form.BooleanInput key={alias} name={[alias, meta.display]} onChange={this.onChange} checked />
						))}
					</div>
				</Form>

				{this.state.data !== undefined && (
					<Fragment>
						<canvas ref={this.onRefUpdate} onMouseDown={(e) => e.preventDefault()} />

						<figure>
							<table role='grid'>
								<thead>
									<tr>{table.headers.map(name => (<th scope='col' key={name}>{name}</th>))}</tr>
								</thead>

								<tbody>
									{table.data?.map(entry => (
										<tr key={entry[0]}>
											{entry.map((point, index) => (
												<td key={index}>{point}</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</figure>
					</Fragment>
				)}
			</main>
		);
	}

	// Request Data
	requestData() {
		if (this.state.columns.length !== 0) {
			axios.get('/api', { params: { columns: this.state.columns } }).then(res => {
				this._mounted && this.setState({ data: res.data });
			});
		}
	}

	// Handle Change
	onChange = (name: string, checked: boolean) => {
		this.setState(state => {
			const columns = checked
				? [...state.columns, name]
				: state.columns.filter(entry => entry !== name)

			columns.sort((a, b) => {
				return Object.keys(lookup.columns).indexOf(a) - Object.keys(lookup.columns).indexOf(b);
			});

			return { columns };
		}, this.requestData);
	}

	// Handle Reference Update
	onRefUpdate = (node: HTMLCanvasElement) => {
		this._canvas = node;

		// Rendering Context
		const context = this._canvas?.getContext('2d');
		if (!context) return;

		// Initialise Chart
		this._chart = new Chart(context, {
			type: 'bar',
			data: {
				labels: [], datasets: []
			},
			options: {
				scales: {
					x: {
						grid: {
							color: 'rgba(115, 130, 140, 0.2)'
						}
					},
					y: {
						grid: {
							color: 'rgba(115, 130, 140, 0.2)'
						},
						beginAtZero: true
					}
				},
				responsive: true,
				animation: false,
				events: []
			}
		});

		// Update
		this.forceUpdate();
	}
}

// Export
export default HomePage;
