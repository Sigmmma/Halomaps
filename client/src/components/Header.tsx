import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

const NAV_ITEMS = [
	{ label: 'Halo Maps Home',     url: 'http://www.halomaps.org'       },
	{ label: 'Halo CE Maps',       url: 'http://hce.halomaps.org'       },
	{ label: 'Halo CE Videos',     url: 'http://videos.halomaps.org'    },
	{ label: 'Halo CE Art',        url: 'http://art.halomaps.org'       },
	{ label: 'Halo 2 Vista',       url: 'http://h2v.halomaps.org'       },
	{ label: 'Halo Movies',        url: 'http://www.halomovies.org'     },
	{ label: 'Halo CE Chronicles', url: 'http://hcec.halomaps.org'      },
	{ label: 'Portal Maps',        url: 'http://www.portalgamemaps.com' },
	{ label: 'Forum',              url: 'http://forum.halomaps.org'     },
];

const HEADER_BG_COLOR = '#757F8D';
const HEADER_HEIGHT = '73px'; // Matches toplogo_forum.gif
const NAV_BG_IMAGE = `url(${require('../../static/mbg3.gif')})`;
const NAV_HEIGHT = '42px';
const VERTICAL_SPACING = '10px';

const useStyles = createUseStyles({
	header: {
		backgroundColor: HEADER_BG_COLOR,
		backgroundImage: `url(${require('../../static/toplogo_forum.gif')})`,
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
	navBar: {
		backgroundImage: NAV_BG_IMAGE,
		height: NAV_HEIGHT,
		marginBottom: VERTICAL_SPACING,
	},
	navLink: {
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

export default function Header(): JSX.Element {
	const styles = useStyles();

	return <>
		<div className={styles.header}>
			<span className={styles.text}>
				A Community discussion forum for Halo Custom Edition,
				Halo 2 Vista, Portal and Halo Machinima
			</span>
		</div>
		<div className={styles.navBar}>
			{NAV_ITEMS.map(item => (
				<a
					className={styles.navLink}
					href={item.url}
				>{item.label}</a>
			))}
		</div>
	</>;
}
