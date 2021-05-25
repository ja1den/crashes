// Import
import React from 'react';
import axios from 'axios';

import Chart from 'chart.js/auto';

import toTitle from 'lib/toTitle';
import lookup from 'lib/lookup';

// Types
declare namespace HomePage {
	export interface State {
		columns: string[];
		data?: Data[];
	}

	export interface Data {
		group: string;
		data: {
			total?: string;
			fatalities?: string;
			injuries?: string;
			units?: string;
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
			columns: Object.keys(lookup.columns)
		}
	}

	// Request Data
	componentDidMount() {
		axios.get('/api', { params: { columns: this.state.columns } }).then(res => {
			this._mounted && this.setState({ data: res.data });
		});
	}

	componentWillUnmount() {
		this._mounted = false;
	}


	render() {
		// Update Chart
		if (this._chart !== null && this.state.data !== undefined) {
			const colours = [
				'338, 78%, 48%',
				'287, 65%, 40%',
				'208, 79%, 51%',
				'123, 41%, 45%'
			];

			this._chart.data = {
				labels: Object.values(this.state.data).reduce(
					(labels: string[], entry) => [...labels, entry.group], []
				),
				datasets: this.state.columns.map((column, index) => ({
					label: lookup.columns[column].display,
					data: this.state.data!.map(
						entry => entry.data[column as keyof HomePage.Data['data']]
					),
					backgroundColor: 'hsl(' + colours[index] + ', 0.2)',
					borderColor: 'hsl(' + colours[index] + ', 1.0)',
					borderWidth: 1
				}))
			};

			this._chart.update();
		}

		// Component HTML
		return (
			<main id='home'>
				<hgroup>
					<h2>Home</h2>
					<h3>Data summary.</h3>
				</hgroup>

				{this.state.data !== undefined && (
					<div className='grid'>
						<div className='chart'>
							<canvas ref={this.onRefChange} onMouseDown={(e) => e.preventDefault()} />
						</div>

						<figure>
							<table role='grid'>
								<thead>
									<tr>
										{['Group', ...Object.keys(this.state.data[0].data)].map(key => (
											<th scope='col' key={key}>{toTitle(key)}</th>
										))}
									</tr>
								</thead>

								<tbody>
									{Object.values(this.state.data).map(entry => (
										<tr key={entry.group}>
											<td>{entry.group}</td>
											{Object.entries(entry.data).map(([key, value]) => (
												<td key={key}>{value}</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</figure>
					</div>
				)}
			</main>
		);
	}

	onRefChange = (node: HTMLCanvasElement) => {
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
				animation: false
			}
		});

		// Update
		this.forceUpdate();
	}
}

// Export
export default HomePage;
