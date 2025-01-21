import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { Design, Icons } from '../images';
import { clientUrl } from '../url';

export default function FullHeader(): JSX.Element {
	return <>
		<Header />
		<NavBar />
		<Controls />
	</>;
}

//******************************************************************************
// Header
//******************************************************************************

const HEADER_BG_COLOR = '#757F8D';
const HEADER_HEIGHT = '73px'; // Matches Design.TOP_LOGO
const useHeaderStyles = createUseStyles({
	disclaimer: {
		color: 'orange',
		float: 'right',
		fontSize: '12px',
		marginRight: '-35px',
		marginTop: '20px',
		textAlign: 'right',
	},
	header: {
		backgroundColor: HEADER_BG_COLOR,
		backgroundImage: `url(${Design.TOP_LOGO})`,
		backgroundRepeat: 'no-repeat',
		height: HEADER_HEIGHT,
		overflow: 'hidden',
	},
	text: {
		backgroundColor: HEADER_BG_COLOR,
		color: 'white',
		float: 'right',
		fontSize: '1.6em',
		height: HEADER_HEIGHT,
		margin: 0,
		paddingRight: '50px',
		paddingTop: '10px',
		width: '550px',
	},
});

function Header(): JSX.Element {
	const styles = useHeaderStyles();
	return (
		<div className={styles.header}>
			<div className={styles.text}>
				A Community discussion forum for Halo Custom Edition,
				Halo 2 Vista, Portal and Halo Machinima

				<a
					className={styles.disclaimer}
					// TODO we want a better on-site page explaining this archive
					href='https://github.com/Sigmmma/Halomaps'
					//href={clientUrl('/index.cfm?page=archiveinfo')}
				>The Community Archive</a>
			</div>
		</div>
	);
}

//******************************************************************************
// NavBar
//******************************************************************************

const NAV_ITEMS = [
	{ label: 'Halo Maps Home',     url: 'http://www.halomaps.org'       },
	{ label: 'Halo CE Maps',       url: 'http://hce.halomaps.org'       },
	{ label: 'Halo CE Videos',     url: 'http://videos.halomaps.org'    },
	{ label: 'Halo CE Art',        url: 'http://art.halomaps.org'       },
	{ label: 'Halo 2 Vista',       url: 'http://h2v.halomaps.org'       },
	{ label: 'Halo Movies',        url: 'http://www.halomovies.org'     },
	{ label: 'Halo CE Chronicles', url: 'http://hcec.halomaps.org'      },
	{ label: 'Portal Maps',        url: 'http://www.portalgamemaps.com' },

	// TODO we probably want to do something special here to highlight this
	{ label: 'Forum',              url: 'http://forum.halomaps.org'     },
];

const NAV_BG_IMAGE = `url(${Design.NAV_BG})`;
const NAV_HEIGHT = '42px';
const NAV_MARGIN = '10px';
const useNavBarStyles = createUseStyles({
	bar: {
		backgroundImage: NAV_BG_IMAGE,
		height: NAV_HEIGHT,
		marginBottom: NAV_MARGIN,
	},
	container: {
		overflow: 'auto',
	},
	link: {
		backgroundImage: NAV_BG_IMAGE,
		borderRight: '1px solid black',
		color: 'white',
		display: 'block',
		float: 'left',
		fontWeight: 'bold',
		lineHeight: NAV_HEIGHT,
		paddingLeft: NAV_MARGIN,
		paddingRight: NAV_MARGIN,
		textDecoration: 'none',
		'&:hover': {
			backgroundImage: `url(${Design.NAV_BG_BRIGHT})`,
			color: 'white',
		},
	},
});

function NavBar(): JSX.Element {
	const styles = useNavBarStyles();
	return (
		<div className={styles.container}>
			<div className={styles.bar}>
				{NAV_ITEMS.map((item, idx) => (
					<a className={styles.link} href={item.url} key={idx}>
						{item.label}
					</a>
				))}
			</div>
		</div>
	);
}

//******************************************************************************
// Controls
//******************************************************************************

enum Show {
	ALWAYS, LOGGED_IN, LOGGED_OUT
}

const CONTROL_ITEMS = [
	{ label: 'Home',         icon: Icons.HOME,     url: 'index.cfm?page=home',     show: Show.ALWAYS     },
	{ label: 'Search',       icon: Icons.SEARCH,   url: 'index.cfm?page=search',   show: Show.ALWAYS     },
	{ label: 'Register',     icon: Icons.REGISTER, url: 'index.cfm?page=register', show: Show.LOGGED_OUT },
	{ label: 'Login',        icon: Icons.LOGIN,    url: 'index.cfm?page=login',    show: Show.LOGGED_OUT },
	{ label: 'Profile',      icon: Icons.PROFILE,  url: 'index.cfm?page=profile',  show: Show.LOGGED_IN  },
	{ label: 'Member List',  icon: Icons.MEMBERS,  url: 'index.cfm?page=members',  show: Show.ALWAYS     },
	{ label: 'Recent Posts', icon: Icons.RECENT,   url: 'index.cfm?page=recent',   show: Show.ALWAYS     },
];

interface ControlsProps {
	loginName?: string;
	messages?: number;
}

const useControlStyles = createUseStyles({
	container: {
		marginTop: '15px',
	},
	icon: {
		marginRight: '3px',
		verticalAlign: 'middle',
	},
	item: {
		display: 'inline-block',
		marginRight: '10px',
	},
	// This reproduces HaloMaps' behavior at max width, but not at min width.
	// The gap is a little bigger at min width, but still displays the whole
	// control bar at 640x480 (not that anybody should be using that...).
	//
	// There's probably some CSS incantation that will actually accomplish this
	// 1:1, but I can't figure it out.
	// For anybody feeling adventurous, the position should slide like this:
	// When <body> width = 600px -> gap 50px
	// When <body> width = 940px -> gap 190px
	leftSpacing: {
		display: 'inline-block',
		maxWidth: '190px',
		minWidth: '50px', // We never actually reach this because 600px * 16% = 96px
		width: '16%',
	},
	rows: {
		display: 'inline-block',
		textAlign: 'center',
	},
	vertSeparator: {
		height: '10px',
	},
});

function Controls({
	loginName,
	messages,
}: ControlsProps): JSX.Element {
	const styles = useControlStyles();

	const loggedInItems = [
		{
			label: 'My Forums',
			icon: Icons.MY_FORUMS,
			url: clientUrl('index.cfm?page=myforum'),
		},
		{
			label: 'Private Messages',
			icon: Icons.MESSAGES,
			url: clientUrl('index.cfm?page=private_messages'),
			after: messages ? ` (${messages})` : '',
		},
		{
			label: `Logout [${loginName}]`,
			icon: Icons.LOGOUT,
			url: clientUrl('index.cfm?page=logout&eflag=logout'),
		},
	];

	return (
		<div className={styles.container}>
			<div className={styles.leftSpacing}></div>
			<div className={styles.rows}>
				{CONTROL_ITEMS
					.filter(item => (
						item.show === Show.ALWAYS ||
						( loginName && item.show === Show.LOGGED_IN) ||
						(!loginName && item.show === Show.LOGGED_OUT)
					))
					.map((item, idx) => (
						<div className={styles.item} key={idx}>
							<a href={clientUrl(item.url)}>
								<img className={styles.icon} src={item.icon} />
								{item.label}
							</a>
						</div>
					))
				}
				{ loginName && <>
					<br/>
					<div className={styles.vertSeparator} />

					{ loggedInItems.map((item, index) => (
						<div className={styles.item} key={index}>
							<a href={clientUrl(item.url)}>
								<img className={styles.icon} src={item.icon} />
								{item.label}
							</a>
							{item.after}
						</div>
					))}
				</>}
			</div>
		</div>
	);
}
