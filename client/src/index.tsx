import React, { JSX } from 'react';
import { createRoot } from 'react-dom/client';
import { createUseStyles } from 'react-jss';
import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
	useSearchParams,
} from 'react-router-dom';

import FullHeader from './components/Header';
import Footer from './components/Footer';
import NotFound from './pages/404';
import Home from './pages/Home';

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

createRoot(document.getElementById('app-root')!).render(<App />);

const ROUTER = createBrowserRouter([
	{ path: '*',          element: <NotFound /> },
	{ path: '/index.cfm', element: <QueryRouter />},
]);

const QUERY_ELEMS: Record<string, JSX.Element> = {
	forgotpassword: <></>,
	forum:          <></>,
	home:           <Home />,
	login:          <></>,
	members:        <></>,
	recent:         <></>,
	register:       <></>,
	search:         <></>,
	topic:          <></>,
	userinfo:       <></>,
};

function App(): JSX.Element {
	useGlobalStyles();
	return <>
		<FullHeader />
		<RouterProvider router={ROUTER} />
		{/* TODO actually calculate duration */}
		<Footer date={new Date()} duration={12345} />
	</>;
}

function QueryRouter(): JSX.Element {
	const [params] = useSearchParams();
	const page = params.get('page');
	return page
		? QUERY_ELEMS[page] ?? <NotFound />
		: <Navigate to='/index.cfm?page=home' />;
}
