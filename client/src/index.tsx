import React, { JSX } from 'react';
import { createRoot } from 'react-dom/client';
import { createUseStyles } from 'react-jss';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import FullHeader from './components/Header';
import Footer from './components/Footer';
import { Pane, PaneType } from './components/Pane';
import useCaselessSearchParams from './hooks/useSearchParamsCaseInsensitive';
import NotFound from './pages/404';
import Forum from './pages/Forum';
import Home from './pages/Home';
import Login from './pages/Login';
import Password from './pages/Password';
import Register from './pages/Register';
import Topic from './pages/Topic';
import User from './pages/User';

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

/**
* All queries to Halomaps' forum were done through an endpoint index.cfm.
* Forums, Topics, Users, etc... were all requested via query parameters to
* this one endpoint. Halomaps would then render the HTML server-side on-demand,
* then serve the full page to the client.
*
* Examples:
*   index.cfm?page=topic&topicID=12345&start=36
*   index.cfm?page=userInfo&viewuserid=54321
*
* Supporting these queries as Halomaps did will preserve links to other forum
* pages in Post content to continue working with this new mirror.
*
* The only difference is that instead of rendering the HTML server-side, we
* fetch the raw data as JSON and use React to render it client-side.
*/
const ROUTER = createBrowserRouter([
	{ path: '*',          element: <NotFound /> },
	{ path: '/',          element: <Navigate to='/index.cfm?page=home' /> },
	{ path: '/index.cfm', element: <QueryRouter /> },
]);

const QUERY_ELEMS: Record<string, JSX.Element> = {
	archiveinfo:       <Todo />,
	forgotpassword:    <Password />,
	forum:             <Forum />,
	home:              <Home />,
	login:             <Login />,
	members:           <Todo />,
	newreply:          <Todo />,
	privatemessagenew: <Todo />,
	recent:            <Todo />,
	register:          <Register />,
	search:            <Todo />,
	topic:             <Topic />,
	userinfo:          <User />,
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
	const [params] = useCaselessSearchParams();
	const page = params.get('page')?.toLowerCase();
	return page
		? QUERY_ELEMS[page] ?? <NotFound />
		: <Navigate to='/index.cfm?page=home' />;
}

// TODO remove this once all pages are done
function Todo(): JSX.Element {
	return (
		<Pane
			title='Page Under Construction'
			type={PaneType.WARNING}
			width='300px'
		/>
	);
}
