// Import
import React from 'react';
import axios from 'axios';

import { Chart } from 'chart.js';

import toTitle from 'lib/toTitle';
import lookup from 'lib/lookup';

// Types
declare namespace HomePage {
	export interface State {
		columns: string[];
		data?: Data[];

		canvas: React.LegacyRef<HTMLCanvasElement> | null;
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
	_chart: Chart | null = null;
	_mounted = true;

	constructor(props: object) {
		super(props);

		this.state = {
			columns: [Object.values(lookup.columns)[0].alias],
			canvas: null
		}
	}

	componentDidMount() {
		axios.get('/api', { params: { columns: this.state.columns } }).then(res => {
			this._mounted && this.setState({ data: res.data });
		});
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render() {
		console.log(this.state.canvas);

		// console.log('cv', this._canvas.current, 'ch', this._chart)

		/*

		// Initialise Chart
		if (this._canvas.current !== null && this._chart === null) {
			const context = this._canvas.current.getContext('2d');

			console.log('fortnite');

			if (context !== null) {
				this._chart = new Chart(context, {
					type: 'bar',
					data: {
						labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
						datasets: [{
							label: '# of Votes',
							data: [12, 19, 3, 5, 2, 3],
							backgroundColor: [
								'rgba(255, 99, 132, 0.2)',
								'rgba(54, 162, 235, 0.2)',
								'rgba(255, 206, 86, 0.2)',
								'rgba(75, 192, 192, 0.2)',
								'rgba(153, 102, 255, 0.2)',
								'rgba(255, 159, 64, 0.2)'
							],
							borderColor: [
								'rgba(255, 99, 132, 1)',
								'rgba(54, 162, 235, 1)',
								'rgba(255, 206, 86, 1)',
								'rgba(75, 192, 192, 1)',
								'rgba(153, 102, 255, 1)',
								'rgba(255, 159, 64, 1)'
							],
							borderWidth: 1
						}]
					},
					options: {
						scales: {
							y: {
								beginAtZero: true
							}
						}
					}
				});
			}
		}

		*/

		// Component HTML
		return (
			<main id='home'>
				<hgroup>
					<h2>Home</h2>
					<h3>Data summary.</h3>
				</hgroup>

				{this.state.data !== undefined && (
					<div className='grid'>
						<canvas ref={this.onRefChange} />

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

	onRefChange = (node: React.LegacyRef<HTMLCanvasElement>) => this.setState({ canvas: node });
}

// Export
export default HomePage;
