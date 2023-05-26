import React, { JSX } from 'react';
import { createRoot } from 'react-dom/client';
import { createUseStyles } from 'react-jss';

import FullHeader from './components/Header';

const useGlobalStyles = createUseStyles({
	'@global': {
		body: {
			fontFamily: 'Verdana, Geneva, sans-serif',
			fontSize: 12,
			marginTop: 0,
			minWidth: '640px',
		},
	},
});

const container = document.getElementById('app-root');
const root = createRoot(container!);
root.render(<App />);

function App(): JSX.Element {
	useGlobalStyles();
	return <FullHeader />;
}
