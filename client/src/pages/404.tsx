import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { PaneType, TextPane } from '../components/Pane';

const useStyles = createUseStyles({
	text: {
		textAlign: 'center',
	},
});

export default function NotFound(): JSX.Element {
	const styles = useStyles();
	return (
		<TextPane
			className={styles.text}
			text={
				'The resource you are looking for might have been removed, ' +
				'had its name changed, or is temporarily unavailable.'
			}
			title='404 Page Not Found'
			type={PaneType.WARNING}
		/>
	);
}
