// Import
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';

import './styles/global.scss';

// Root Component
const Root: React.FC = () => {
	const [color, setColor] = useState<string>('transparent');

	useEffect(() => {
		axios.get('/api/color')
			.then(res => setColor(res.data.color))
			.catch(console.error);
	}, []);

	return <p style={{ color }}>Hello!</p>;
}

// Render to DOM
ReactDOM.render(<Root />, document.getElementById('root'));
