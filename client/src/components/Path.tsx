import React, { Fragment, JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { Buttons } from '../images';

interface PathPart {
	url: string;
	name: string;
}

interface PathProps {
	parts: PathPart[];
}

const useStyles = createUseStyles({
	button: {
		float: 'right',
		height: '24px',
		textAlign: 'end',
	},
	container: {
		display: 'table',
		marginTop: '3px',
		width: '95%',
	},
	links: {
		display: 'table-cell',
		fontSize: '11px',
		fontWeight: 'bold',
		verticalAlign: 'bottom',
		width: 'calc(100% - 92px)',
	},
})

const FIRST_PART: PathPart = {
	url: '/index.cfm?page=home',
	name: 'Forums Index',
};

export default function Path({ parts }: PathProps): JSX.Element {
	const styles = useStyles();
	return (
		<div className={styles.container}>
			<div className={styles.links}>
				{[FIRST_PART, ...parts].map((part, idx) => (
					<Fragment key={idx}>
						»
						<a href={part.url}>{part.name}</a>
						{' '}
					</Fragment>
				))}
			</div>
			<a className={styles.button} href='TODO'>
				<img src={Buttons.NEW_TOPIC} />
			</a>
		</div>
	);
}
