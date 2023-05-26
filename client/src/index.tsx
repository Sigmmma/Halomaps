import React, { JSX } from 'react';
import { createRoot } from 'react-dom/client';
import { createUseStyles } from 'react-jss';

import FullHeader from './components/Header';
import Footer from './components/Footer';

const useGlobalStyles = createUseStyles({
	'@global': {
		body: {
			fontFamily: 'Verdana, Geneva, sans-serif',
			fontSize: 12,
			marginTop: 0,
			minWidth: '600px',
			marginBottom: '2px',
		},
		'a:hover': {
			color: 'red',
		},
	},
});

const container = document.getElementById('app-root');
const root = createRoot(container!);
root.render(<App />);

function App(): JSX.Element {
	useGlobalStyles();
	return <>
		<FullHeader />
		<Footer date={new Date()} duration={12345} />
	</>;
}
