import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { Pane } from '../components/Pane';
import { clientUrl } from '../url';

const useStyles = createUseStyles({
	link: {
		marginLeft: 'auto',
		marginRight: 'auto',
		marginTop: '15px',
		textAlign: 'center',
		width: '95%',
	},
	content: {
		width: 300,
		padding: '4px',
		fontSize: '13px',
	}
});

export default function Approval(): JSX.Element {
	const styles = useStyles();
	return <>
		<Pane title='New Post Needs Approval'>
			<div className={styles.content}>
				Thank you for posting. The forum you posted in needs
				moderator approval. Once moderators approve your post,
				you will be notified.
			</div>
		</Pane>

		<div className={styles.link}>
			<a href={clientUrl('index.cfm?page=home')}>Back to forums home</a>
		</div>
	</>;
}
