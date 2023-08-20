import React, { JSX, useState } from 'react';
import { createUseStyles } from 'react-jss';

import Button from '../components/Button';
import Input from '../components/Input';
import { Pane } from '../components/Pane';
import Warning from '../components/Warning';

const useStyles = createUseStyles({
	button: {
		marginTop: '3px',
		marginBottom: '1px',
	},
	links: {
		textAlign: 'center',
	},
	pane: {
		marginBottom: '15px',
		width: '300px',
		textAlign: 'center',
	},
	text: {
		padding: '10px',
	},
});

export default function Password(): JSX.Element {
	const styles = useStyles();
	const [showWarning, setShowWarning] = useState(false);

	return <>
		<Pane title='Forgot Password?' className={styles.pane}>
			<div className={styles.text}>
				Enter your forums username or email and we
				will email you your password shortly.
				{/* No we won't. */}
			</div>

			<Input maxLength={50} size={35} />
			<Button
				className={styles.button}
				text='Send Password'
				onClick={() => setShowWarning(true)}
			/>
		</Pane>

		<div className={styles.links}>
			<Warning display={showWarning} label='Password reset' />
			<a href='index.cfm?page=login'>Back to login page</a>
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			<a href='index.cfm?page=register'>Create new account</a>
		</div>
	</>;
}
