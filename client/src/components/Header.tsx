import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { Design } from '../images';

const VERTICAL_SPACING = '10px';

export default function FullHeader(): JSX.Element {
	return <>
		<Header />
		<NavBar />
	</>;
}

//******************************************************************************
// Header
//******************************************************************************

const HEADER_BG_COLOR = '#757F8D';
const HEADER_HEIGHT = '73px'; // Matches toplogo_forum.gif
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
		paddingTop: VERTICAL_SPACING,
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
const useNavBarStyles = createUseStyles({
	bar: {
		backgroundImage: NAV_BG_IMAGE,
		height: NAV_HEIGHT,
		marginBottom: VERTICAL_SPACING,
	},
	link: {
		backgroundImage: NAV_BG_IMAGE,
		borderRight: '1px solid black',
		color: 'white',
		display: 'block',
		float: 'left',
		fontWeight: 'bold',
		lineHeight: NAV_HEIGHT,
		paddingLeft: VERTICAL_SPACING,
		paddingRight: VERTICAL_SPACING,
		textDecoration: 'none',
	},
});

function NavBar(): JSX.Element {
	const styles = useNavBarStyles();
	return (
		<div className={styles.bar}>
			{NAV_ITEMS.map(item => (
				<a
					className={styles.link}
					href={item.url}
				>{item.label}</a>
			))}
		</div>
	);
}
