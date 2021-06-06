// Import
import React, { Fragment } from 'react';
import axios from 'axios';

import { Chart, registerables } from 'chart.js';

import { RouteComponentProps, withRouter } from 'react-router';
import qs from 'qs';

import toTitle from 'lib/toTitle';
import lookup from 'lib/lookup';

// Register Chart.js
Chart.register(...registerables);

// Types
declare namespace HomePage {
	export interface Props extends RouteComponentProps { }

	export interface State {
		options: string[];
		data: Data[];

		isLegal: boolean;
	}

	export interface Parameters {
		columns: string[];

		group: string;
		hideNull: '0' | '1';

		filter: { group: string; field: string };
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
class HomePage extends React.Component<HomePage.Props, HomePage.State> {
	_mounted = true;

	_canvas: HTMLCanvasElement | null = null;
	_chart: Chart | null = null;

	constructor(props: RouteComponentProps) {
		super(props);

		// Initialise State
		this.state = {
			options: [],
			data: [],
			isLegal: false
		};
	}

	// Handle Mount
	componentDidMount = () => this.checkParams();

	// Handle Update
	componentDidUpdate(prevProps: HomePage.Props) {
		if (prevProps.location.search !== this.props.location.search) this.checkParams();
	}

	// Handle Unmount
	componentWillUnmount = () => this._mounted = false;

	render() {
		// Page Content
		let content = <p>Loading...</p>;

		if (this.state.isLegal) {
			// Read Parameters
			const params = qs.parse(this.props.location.search.substring(1)) as unknown as HomePage.Parameters;

			// Handle Empty
			params.columns = params.columns ?? [];

			// Parse Table Data
			const table = {
				headers: [
					'Group', ...params.columns.map(column => lookup.columns[column].display)
				],
				data: this.state.data.map(entry => [
					entry.group === 'null'
						? params.hideNull === '0' && 'Unknown'
						: entry.group,
					...params.columns.map(
						column =>
							entry.data[column as keyof HomePage.Data['data']]
					)
				]).filter(entry => Boolean(entry[0])) as (string | number)[][]
			}

			// Parse Chart Data
			if (this._chart !== null && this.state.data !== undefined) {
				this._chart.data = {
					labels: Object.entries(this.state.data).map(
						([_key, entry]) =>
							entry.group === 'null'
								? params.hideNull === '0' && 'Unknown'
								: entry.group
					).filter(Boolean),
					datasets: params.columns.map(column => ({
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

			// Page Content
			content = (
				<Fragment>
					<article>
						<div className='grid'>
							<fieldset>
								<legend>Select Data</legend>

								{Object.entries(lookup.columns).map(([alias, meta]) => {
									const checked = params.columns.includes(alias);
									const enabled = params.columns.length !== 1;

									return (
										<label key={alias} htmlFor={alias}>
											<input type='checkbox' role='switch' id={alias} onChange={this.onChangeInput} checked={checked} disabled={checked && !enabled} />
											<>{meta.display}</>
										</label>
									);
								})}
							</fieldset>

							<div>
								<label htmlFor='group'>
									Group Data
									<select id='group' value={params.group} onChange={this.onChangeSelect}>
										{Object.keys(lookup.groups).map(alias =>
											lookup.groups[alias].onlyFilter !== true
												? [alias, toTitle(alias)]
												: null
										).filter(Boolean).map(option => (
											<option key={option![0]} value={option![0]}>{option![1]}</option>
										))}
									</select>
								</label>

								<label htmlFor='hide_null'>
									<input type='checkbox' role='switch' id='hide_null' onChange={this.onChangeInput} checked={params.hideNull === '1'} />
									<>Hide Unknown</>
								</label>
							</div>

							<div>
								<label htmlFor='filterGroup'>
									Filter Data
									<select id='filterGroup' value={params.filter.group} onChange={this.onChangeSelect}>
										{Object.keys(lookup.groups).map(alias =>
											alias !== params.group
												? [alias, toTitle(alias)]
												: null
										).filter(Boolean).map(option => (
											<option key={option![0]} value={option![0]}>{option![1]}</option>
										))}
									</select>
								</label>

								<label htmlFor='filterField'>
									Filter Data
									<select id='filterField' value={params.filter.field ? this.state.options.indexOf(params.filter.field) : -1} onChange={this.onChangeSelect}>
										{[[-1, 'None'], ...this.state.options.map(
											(entry, index) => [index, entry === 'null' ? 'Unknown' : entry]
										)].map(option => (
											<option key={option![0]} value={option![0]}>{option![1]}</option>
										))}
									</select>
								</label>
							</div>
						</div>
					</article>

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
			);
		}

		// Component HTML
		return (
			<main id='home'>
				<hgroup>
					<h2>Home</h2>
					<h3>Data summary.</h3>
				</hgroup>

				{content}
			</main>
		);
	}

	// Check Parameters
	checkParams = () => {
		// Read Parameters
		const params = qs.parse(this.props.location.search.substring(1));

		// Updated Params
		let updated: Partial<HomePage.Parameters> = { ...params };
		let isLegal = true;

		// Check Columns
		if (!Array.isArray(params.columns)) {
			updated.columns = Object.keys(lookup.columns);
			isLegal = false;
		} else {
			for (const column of params.columns) if (typeof column !== 'string' || lookup.columns[column] === undefined) {
				updated.columns = Object.keys(lookup.columns);
				isLegal = false;
			}
		}

		// Check Group
		if (typeof params.group !== 'string' || lookup.groups[params.group] === undefined || lookup.groups[params.group].onlyFilter) {
			updated.group = Object.keys(lookup.groups)[0];
			isLegal = false;
		}

		// Check HideNull
		if (typeof params.hideNull !== 'string' || !['0', '1'].includes(params.hideNull)) {
			updated.hideNull = '1';
			isLegal = false;
		}

		// Check Filter
		if (typeof params.filter === 'object' && !Array.isArray(params.filter)) {
			// Check Filter Group
			if (typeof params.filter.group !== 'string' || lookup.groups[params.filter.group] === undefined || params.group === params.filter.group) {
				updated.filter!.group = Object.keys(lookup.groups)[1];
				updated.filter!.field = '';

				isLegal = false;
			}

			// Check Filter Field
			if (typeof params.filter.group !== 'string') {
				updated.filter!.field = '';
				isLegal = false;
			}
		} else {
			updated.filter = { group: Object.keys(lookup.groups)[1], field: '' };
			isLegal = false;
		}

		// Update State
		this.props.history.push({ search: '?' + qs.stringify(updated) });
		this.setState({ isLegal }, this.requestData);
	}

	// Request Data
	requestData = () => {
		// Parse Parameters
		const params = qs.parse(this.props.location.search.substring(1)) as unknown as HomePage.Parameters;

		// Request Filters
		axios.get('/api', { params: { group: params.filter.group } }).then(({ data }: { data: { group: string }[] }) => {
			if (this._mounted) {
				// Parse Response
				const options = data.map(entry => entry.group);

				// Check Filter Field
				if (!options.includes(params.filter.field) && params.filter.field !== '') {
					params.filter.field = '';

					this.props.history.push({ search: '?' + qs.stringify(params) });
				}

				// Update State
				this.setState({ options });

				// Request Data
				axios.get('/api?' + qs.stringify(params)).then(({ data }) => {
					if (this._mounted) this.setState({ data });
				});
			}
		});
	}

	// Handle Input Change
	onChangeInput: React.ChangeEventHandler<HTMLInputElement> = event => {
		// Parse Parameters
		const params = qs.parse(this.props.location.search.substring(1)) as unknown as HomePage.Parameters;

		// Switch on Type
		switch (event.target.type) {
			case 'checkbox':
				if (event.target.id === 'hide_null') {
					params.hideNull = event.target.checked ? '1' : '0';
				} else {
					params.columns = Object.keys(lookup.columns).filter(
						column => event.target.checked
							? params.columns.includes(column) || column === event.target.id
							: params.columns.includes(column) && column !== event.target.id
					)
				}
				break;
		}

		// Update Parameters
		this.props.history.push({ search: '?' + qs.stringify(params) });
	}

	// Handle Select Change
	onChangeSelect: React.ChangeEventHandler<HTMLSelectElement> = event => {
		// Parse Parameters
		const params = qs.parse(this.props.location.search.substring(1)) as unknown as HomePage.Parameters;

		// Switch on ID
		switch (event.target.id) {
			case 'group':
				params.group = event.target.value;
				break;

			case 'filterGroup':
				params.filter.group = event.target.value;
				params.filter.field = '';

				this.setState({ options: [] });
				break;

			case 'filterField':
				console.log(parseInt(event.target.value) === -1);

				params.filter.field = parseInt(event.target.value) !== -1
					? this.state.options[parseInt(event.target.value)]
					: '';

				console.log(this.state.options[parseInt(event.target.value)])
				break;
		}

		// Update Parameters
		console.log(params, qs.stringify(params));

		this.props.history.push({ search: '?' + qs.stringify(params) });
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
export default withRouter(HomePage);
