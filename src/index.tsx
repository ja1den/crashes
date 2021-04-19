// Import
import React from 'react';
import ReactDOM from 'react-dom';

import {
	BrowserRouter,
	Switch,
	Route,
	Link
} from 'react-router-dom';

import './styles/global.scss';

// Pages
import HomePage from './pages/Home';
import TablesPage from './pages/Tables';
import InputPage from './pages/Input';

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
				</ul>
			</nav>

			<Switch>
				<Route path='/tables'>
					<TablesPage />
				</Route>

				<Route path='/input'>
					<InputPage />
				</Route>

				<Route path='/'>
					<HomePage />
				</Route>
			</Switch>
		</BrowserRouter>
	);
}

// Render to DOM
ReactDOM.render(<Root />, document.getElementById('root'));
