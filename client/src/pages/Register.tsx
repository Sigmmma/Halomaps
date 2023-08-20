import React, { JSX, ReactNode, useState } from 'react';
import { createUseStyles } from 'react-jss';

import Button from '../components/Button';
import Input from '../components/Input';
import { HeaderBar, Separator } from '../components/Table';
import { Captcha } from '../images';

type TableRow = [string, ReactNode];

const useStyles = createUseStyles({
	container: {
		backgroundColor: '#F2F2F2',
		borderColor: 'black',
		borderStyle: 'solid',
		borderWidth: '1px',
		marginTop: '3px',
		width: '95%',
	},
	header: {
		height: '18px',
		paddingTop: '3px',
	},
	separator: {
		height: '17px',
		textAlign: 'center',
		width: '100%',
	},
});

const REQUIRED_FIELDS: TableRow[] = [
	['Username',      <Input maxLength={25} size={40} />],
	['Email Address', <Input maxLength={25} size={40} />],
	['',              <EmailCheck />],
	['Password', 'Random password will be sent to above email account. You can change it later.'],
];

const OPTIONAL_FIELDS: TableRow[] = [
	['Website',                <Input maxLength={100} size={60} />],
	['Location',               <Input maxLength={100} size={60} />],
	['Occupation',             <Input maxLength={100} size={60} />],
	['Interests',              <Input maxLength={100} size={60} />],
	['Your Age',               <Input maxLength={100} size={60} />],
	['What Games do you play', <Input maxLength={100} size={60} />],
];

export default function Register(): JSX.Element {
	const styles = useStyles();
	return (
		<form className={styles.container}>
			<HeaderBar className={styles.header} content='Registration Information' />
			<Separator className={styles.separator} content='Required Information' />
			<BasicTable fields={REQUIRED_FIELDS} />
			<Separator className={styles.separator} content='About you (Optional)' />
			<BasicTable fields={OPTIONAL_FIELDS} />
			<Separator className={styles.separator} />
			<Verify />
			<HeaderBar />
		</form>
	);
}

//******************************************************************************
// Table for aligning user info entry fields
//******************************************************************************

interface BasicTableProps {
	fields: TableRow[];
}

const useElementStyles = createUseStyles({
	alert: {
		color: 'red',
		marginBottom: '-18px',
		marginTop: '3px',
	},
	checkbox: {
		marginTop: '-10px',
	},
	content: {
		width: '100ch',
	},
	label: {
		fontWeight: 'bold',
		textAlign: 'right',
		width: '20%',
	},
	padding: {
		paddingTop: '6px',
	},
	row: {
		height: '25px',
	},
	table: {
		marginLeft: 'auto',
		marginRight: 'auto',
	},
	verify: {
		marginBottom: '20px',
		marginTop: '20px',
		textAlign: 'center',
	},
});

function BasicTable({ fields }: BasicTableProps): JSX.Element {
	const styles = useElementStyles();
	return (
		<table className={styles.table}>
			<tbody>{fields.map(([label, content], idx) => (
				<tr className={styles.row} key={idx}>
					<td className={styles.label}>{label ? `${label}:` : ''}</td>
					<td className={styles.content}>{content}</td>
				</tr>
			))}</tbody>
		</table>
	);
}

function EmailCheck(): JSX.Element {
	const EMAIL = 'email';
	const styles = useElementStyles();
	return (
		<div className={styles.checkbox}>
			<input id={EMAIL} type='checkbox' defaultChecked />
			<label htmlFor={EMAIL}>
				Show my email in public profile?
			</label>
		</div>
	);
}

function Verify(): JSX.Element {
	const styles = useElementStyles();
	const [showWarning, setShowWarning] = useState(false);

	return (
		<div className={styles.verify}>
			Enter Verify code:<br />

			{[Captcha.U, Captcha.W, Captcha.A, Captcha.Y, Captcha.D]
				.map((src, idx) => <img src={src} key={idx} />
			)}<br />

			<Input size={20} />

			<div className={styles.padding}>
				<Button text='Submit' onClick={() => setShowWarning(true)} />
				{' '}
				<Button text='Reset' type='reset' />
			</div>

			<div className={styles.alert} hidden={!showWarning}>
				Registration is disabled on this archive!
			</div>
		</div>
	);
}
