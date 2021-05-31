// Import
import React, { Fragment } from 'react';
import axios from 'axios';

import { Chart, registerables } from 'chart.js';

import toTitle from 'lib/toTitle';
import lookup from 'lib/lookup';

import Form from 'components/Form';

// Register Chart.js
Chart.register(...registerables);

// Types
declare namespace HomePage {
	export interface State {
		columns: string[];
		group: string;
		data: Data[];
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

	constructor(props: object) {
		super(props);

		this.state = {
			columns: Object.keys(lookup.columns),
			group: Object.keys(lookup.groups)[0],
			data: []
		}
	}

	componentDidMount() {
		this.emitRequest();
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render() {
		// Update Chart
		if (this._chart !== null && this.state.data !== undefined) {
			this._chart.data = {
				labels: Object.entries(this.state.data).map(
					([_key, entry]) => entry.group !== 'null' ? entry.group : 'Unknown'
				),
				datasets: this.state.columns.map(column => ({
					label: lookup.columns[column].display,
					data: this.state.data!.map(
						entry =>
							entry.data[column as keyof HomePage.Data['data']] ?? null
					),
					backgroundColor: 'hsl(' + lookup.columns[column].color + ', 0.2)',
					borderColor: 'hsl(' + lookup.columns[column].color + ', 1.0)',
					borderWidth: 1
				}))
			};

			this._chart.update();
		}

		// Table Data
		const table = {
			headers: [
				'Group', ...this.state.columns.map(column => lookup.columns[column].display)
			],
			data: this.state.data?.map(entry => [
				entry.group !== 'null' ? entry.group : 'Unknown', ...this.state.columns.map(
					column =>
						entry.data[column as keyof HomePage.Data['data']]
				)
			])
		}

		// Component HTML
		return (
			<main id='home'>
				<hgroup>
					<h2>Home</h2>
					<h3>Data summary.</h3>
				</hgroup>

				<article>
					<div className='grid'>
						<fieldset>
							<legend>Select Data</legend>
							{Object.entries(lookup.columns).map(([alias, meta]) => (
								<Form.BooleanInput key={alias} name={[alias, meta.display]} onChange={this.onChange} checked />
							))}
						</fieldset>

						<div>
							<Form.SelectInput name={['group', 'Data Grouping']} options={Object.keys(lookup.groups).map((alias, index) =>
								[index, toTitle(alias)]
							)} onChange={this.onChange}></Form.SelectInput>
						</div>
					</div>
				</article>

				{this.state.data !== undefined && (
					<Fragment>
						<section className='chart'>
							<canvas ref={this.onRefUpdate} onMouseDown={(e) => e.preventDefault()} />
						</section>

						<section>
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
						</section>
					</Fragment>
				)}
			</main>
		);
	}

	// Emit Request
	emitRequest = () => {
		axios.get('/api', { params: { columns: this.state.columns, group: this.state.group } }).then(({ data }) => {
			if (this._mounted) this.setState({ data });
		});
	};

	// Handle Change
	onChange = (name: string, value: number | boolean) => {
		// Switch on Type
		switch (typeof value) {
			case 'number':
				this.setState({
					group: Object.keys(lookup.groups)[value]
				}, this.emitRequest);
				break;

			case 'boolean':
				this.setState(state => ({
					columns: Object.keys(lookup.columns).filter(
						column => value
							? state.columns.includes(column) || column === name
							: state.columns.includes(column) && column !== name
					)
				}), this.emitRequest);
				break;
		}
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
							color: 'rgba(115, 130, 140, 0.1)',
							drawBorder: false
						}
					},
					y: {
						grid: {
							color: 'rgba(115, 130, 140, 0.1)',
							drawBorder: false
						},
						beginAtZero: true
					}
				},
				responsive: true,
				maintainAspectRatio: true,
				aspectRatio: 2,
				onResize: (_, size) => {
					if (this._chart) this._chart.options.aspectRatio = size.width >= 768 ? 11 / 4 : 2;
				},
				events: [],
				animation: false
			}
		});

		// Update
		this.forceUpdate();
	}
}

// Export
export default HomePage;
