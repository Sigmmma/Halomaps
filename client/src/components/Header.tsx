import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { Design, Icons } from '../images';

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
		paddingTop: '10px',
		paddingRight: '50px',
		width: '550px',
	},
});

function Header(): JSX.Element {
	const styles = useHeaderStyles();
	return (
		<div className={styles.header}>
			<span className={styles.text}>
				A Community discussion forum for Halo Custom Edition,
				Halo 2 Vista, Portal and Halo Machinima
			</span>
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

const CONTROL_ITEMS = [
	// TODO need to add actual URLs
	{ label: 'Home',         icon: Icons.HOME,     url: '' },
	{ label: 'Search',       icon: Icons.SEARCH,   url: '' },
	{ label: 'Register',     icon: Icons.REGISTER, url: '' },
	{ label: 'Login',        icon: Icons.LOGIN,    url: '' },
	{ label: 'Member List',  icon: Icons.MEMBERS,  url: '' },
	{ label: 'Recent Posts', icon: Icons.RECENT,   url: '' },
];

const useControlStyles = createUseStyles({
	container: {
		marginLeft: '190px',
		marginTop: '15px',
	},
	icon: {
		marginRight: '3px',
		verticalAlign: 'middle',
	},
	item: {
		marginRight: '10px',
	},
});

function Controls(): JSX.Element {
	const styles = useControlStyles();
	return (
		<div className={styles.container}>
			{CONTROL_ITEMS.map((item, idx) => (
				<a className={styles.item} href={item.url} key={idx}>
					<img className={styles.icon} src={item.icon} />
					{item.label}
				</a>
			))}
		</div>
	);
}
