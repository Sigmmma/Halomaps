import React, { JSX, useState } from 'react';
import { createUseStyles } from 'react-jss';

import FieldTable, { TableRow } from '../components/FieldTable';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import Input from '../components/Input';
import { HeaderBar } from '../components/Table';
import Warning from '../components/Warning';

const useStyles = createUseStyles({
	center: {
		textAlign: 'center',
	},
	container: {
		backgroundColor: '#F2F2F2',
		marginLeft: 'calc(65% - 300px)',
		marginTop: '50px',
		width: '300px',
	},
	form: {
		borderColor: 'black',
		borderStyle: 'solid',
		borderWidth: '1px',
		marginBottom: '15px',
		padding: '1px',
	},
	header: {
		height: '15px',
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

	return (
		<div className={styles.container}>
			<form className={styles.form}>
				<HeaderBar
					className={styles.header}
					content='Forums Login'
				/>
				<FieldTable fields={FIELDS} />
				<div className={styles.center}>
					<Button text='Login' onClick={() => setShowWarning(true)} />
				</div>
			</form>

			<div className={styles.center}>
				<Warning display={showWarning} label='Login' />
				<a href='index.cfm?page=forgotPassword'>Forgot your password?</a>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<a href='index.cfm?page=register'>Create new account</a>
			</div>
		</div>
	);
}
