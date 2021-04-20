// Import
import React from 'react';

// Forms
import CrashTypeForm from 'components/input/CrashTypeForm';
import CurveForm from 'components/input/CurveForm';
import RegionForm from 'components/input/RegionForm';
import RoadTypeForm from 'components/input/RoadTypeForm';
import SlopeForm from 'components/input/SlopeForm';
import SurfaceForm from 'components/input/SurfaceForm';

// Input Component
const InputPage: React.FC = () => {
	return (
		<main id='input'>
			<hgroup>
				<h2>Input</h2>
				<h3>Create a new record.</h3>
			</hgroup>

			<CrashTypeForm />
			<CurveForm />
			<RegionForm />
			<RoadTypeForm />
			<SlopeForm />
			<SurfaceForm />
		</main>
	);
}

// Export
export default InputPage;
