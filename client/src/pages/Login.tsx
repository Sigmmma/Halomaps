import React, { JSX, useState } from 'react';
import { createUseStyles } from 'react-jss';

import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import { FieldTable, TableRow } from '../components/Form';
import Input from '../components/Input';
import { Pane } from '../components/Pane';
import Warning from '../components/Warning';
import { clientUrl } from '../url';

const useStyles = createUseStyles({
	center: {
		textAlign: 'center',
	},
	header: {
		height: '15px',
	},
	pane: {
		marginBottom: '15px',
		padding: '1px',
		width: '300px',
	},
});

const FIELDS: TableRow[] = [
	['Username', <Input maxLength={25} size={20} />],
	['Password', <Input maxLength={25} size={20} type='password' />],
	['',         <Checkbox label='Log in automatically' />],
];

export default function Login(): JSX.Element {
	const styles = useStyles();
	const [showWarning, setShowWarning] = useState(false);

	return <>
		<Pane title='Forums Login' className={styles.pane}>
			<form>
				<FieldTable fields={FIELDS} />
				<div className={styles.center}>
					<Button
						text='Login'
						onClick={() => setShowWarning(true)}
						/>
				</div>
			</form>
		</Pane>

		<div className={styles.center}>
			<Warning display={showWarning} label='Login' />
			<a href={clientUrl('index.cfm?page=forgotPassword')}>Forgot your password?</a>
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			<a href={clientUrl('index.cfm?page=register')}>Create new account</a>
		</div>
	</>;
}
