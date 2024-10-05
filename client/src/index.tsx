import React, { JSX, Profiler, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createUseStyles } from 'react-jss';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import FullHeader from './components/Header';
import Footer from './components/Footer';
import { Pane, PaneType } from './components/Pane';
import useCaselessSearchParams from './hooks/useSearchParamsCaseInsensitive';
import NotFound from './pages/404';
import Approval from './pages/Approval';
import Forum from './pages/Forum';
import Home from './pages/Home';
import Login from './pages/Login';
import Password from './pages/Password';
import PrivateMessageBox from './pages/PrivateMessageBox';
import Register from './pages/Register';
import Search from './pages/Search';
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
* Most queries to Halomaps' forum were done through an endpoint index.cfm.
* Forums, Topics, Users, etc... were all requested via query parameters to
* this one endpoint. Halomaps would then render the HTML server-side on-demand,
* then serve the full page to the client.
*
* Examples:
*   index.cfm?page=topic&topicID=12345&start=36
*   index.cfm?page=userInfo&viewuserid=54321
*
* Handling these queries the same way Halomaps did will allow links to other
* forum pages in Post content to continue working.
*
* The only difference is that instead of rendering the HTML server-side, we
* fetch the raw data as JSON and use React to render it client-side.
*/
const ROUTER = createBrowserRouter([
	{ path: '*',          element: <NotFound /> },
	{ path: '/',          element: <Navigate to='/index.cfm?page=home' /> },
	{ path: '/index.cfm', element: <QueryRouter /> },
	// TODO usrSelectAvatar.cfm This showed a list of avatars
	// TODO usrUploadAvatar.cfm No idea what this looks like
]);

const QUERY_ELEMS: Record<string, JSX.Element> = {
	archiveinfo:       <Todo />,
	// TODO we don't know what this page name was
	// and there's no natural way to get here.
	// We might consider making this its own page so we can change the header
	approval:          <Approval />,
	forgotpassword:    <Password />,
	forum:             <Forum />,
	home:              <Home />,
	login:             <Login />,
	members:           <Todo />,
	newreply:          <Bounty desc='This is the page for writing a new reply to a post.' />,
	privatemessagenew: <Bounty desc='This is the page for writing a new private message.' />,
	private_messages:  <PrivateMessageBox />,
	private_msg_view:  <Bounty desc='This is the page for viewing a private message.' />,
	profile:           <Bounty desc='This is the page linked in the header under "Profile".' />,
	recent:            <Todo />,
	register:          <Register />,
	search:            <Search />,
	topic:             <Topic />,
	userinfo:          <User />,
};

function App(): JSX.Element {
	// Abuse the built-in profiler to display render time on the page.
	const PERF_NAME = 'page_render';
	performance.clearMarks(PERF_NAME);
	performance.mark(PERF_NAME);

	useGlobalStyles();
	const [renderDuration, setRenderDuration] = useState<number>();

	return <>
	{/* FIXME this doesn't actually work. Interactive pages trigger re-renders which update this time value. */}
		<Profiler id={PERF_NAME} onRender={() => {
			const duration = performance.measure(PERF_NAME).duration;
			setRenderDuration(Math.round(duration));
		}}>
			<FullHeader />
			<RouterProvider router={ROUTER} />
		</Profiler>
		<Footer date={new Date()} duration={undefined /*renderDuration*/} />
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

interface BountyProps {
	desc: string;
}

function Bounty({ desc }: BountyProps): JSX.Element {
	return (
		<Pane
			title='Page Reference Needed'
			type={PaneType.WARNING}
			width='300px'
		>
		<div style={{ padding: '5px' }}>
			{desc}<br/>
			<br/>
			Our archive does not contain an example of this page.
			This was likely a page that required a user to be logged in, or was
			removed before the site went offline.<br/>
			<br/>
			If you have an example of this page (either saved HTML or a
			screenshot), please submit it in a&nbsp;
			<a href='https://github.com/Sigmmma/Halomaps/issues'>GitHub issue</a>,
			and we will do our best to faithfully reproduce it.
		</div>
		</Pane>
	);
}
