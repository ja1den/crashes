// Import
import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter, Switch, Route, Link, Redirect } from 'react-router-dom';

import 'styles/global.scss';

// Pages
import TablesPage from 'pages/Tables';
import TablePage from 'pages/Table';

import InputPage from 'pages/Input';
import UploadPage from 'pages/Upload';

import HomePage from 'pages/Home';

// Root Component
const Root: React.FC = () => {
	return (
		<BrowserRouter>
			<nav className='container-fluid'>
				<ul>
					<li><strong>Crash Data</strong></li>
				</ul>
				<ul>
					<li><Link to='/'>Home</Link></li>
					<li><Link to='/tables'>Tables</Link></li>
					<li><Link to='/input'>Input</Link></li>
					<li><Link to='/upload'>Upload</Link></li>
				</ul>
			</nav>

			<Switch>
				<Route path='/tables/:name'>
					<TablePage />
				</Route>

				<Route path='/tables'>
					<TablesPage />
				</Route>

				<Route path='/input'>
					<InputPage />
				</Route>

				<Route path='/upload'>
					<UploadPage />
				</Route>

				<Route path='/' exact>
					<HomePage />
				</Route>

				<Route path='*'>
					<Redirect to='/' />
				</Route>
			</Switch>
		</BrowserRouter>
	);
}

// Render to DOM
ReactDOM.render(<Root />, document.getElementById('root'));
