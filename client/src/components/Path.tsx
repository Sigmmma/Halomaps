import React, { Fragment, JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { Buttons, Icons } from '../images';

interface PathPart {
	// Typescript enforces this as a boolean, but it may show up as a number
	// due to some database silliness. We should always do the !! trick on this.
	locked?: boolean;
	name: string;
	url: string;
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
	lock: {
		verticalAlign: 'bottom',
	},
})

const FIRST_PART: PathPart = {
	name: 'Forums Index',
	url: '/index.cfm?page=home',
};

export default function Path({ parts }: PathProps): JSX.Element {
	const styles = useStyles();
	return (
		<div className={styles.container}>
			<div className={styles.links}>
				{[FIRST_PART, ...parts].map((part, idx) => (
					<Fragment key={idx}>
						»

						{!!part.locked && (
							<img src={Icons.LOCK} className={styles.lock} />
						)}

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
