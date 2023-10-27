import React, { JSX, ReactNode, useState } from 'react';
import { createUseStyles } from 'react-jss';

import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import FieldTable, { FieldTableClasses, TableRow } from '../components/FieldTable';
import { Form } from '../components/Form';
import Input from '../components/Input';
import { HeaderBar, Separator } from '../components/Table';
import Warning from '../components/Warning';
import { Captcha } from '../images';

const useStyles = createUseStyles({
	content: {
		width: '100ch',
	},
	label: {
		fontWeight: 'bold',
		width: '20%',
	},
	row: {
		height: '25px',
	},
	separator: {
		height: '17px',
		textAlign: 'center',
		width: '100%',
	},
});

const REQUIRED_FIELDS: TableRow[] = [
	['Username',      <Input maxLength={25} size={40} />],
	['Email Address', (
		<div>
			<Input maxLength={25} size={40} />
			<Checkbox defaultChecked label='Show my email in public profile?'/>
		</div>
	)],
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
	const tableClasses: FieldTableClasses = {
		content: styles.content,
		label: styles.label,
		row: styles.row,
	};

	return (
		<Form title='Registration Information'>
			<Separator className={styles.separator} content='Required Information' />
			<FieldTable tableClasses={tableClasses} fields={REQUIRED_FIELDS} />
			<Separator className={styles.separator} content='About you (Optional)' />
			<FieldTable tableClasses={tableClasses} fields={OPTIONAL_FIELDS} />
			<Separator className={styles.separator} />
			<Verify />
			<HeaderBar />
		</Form>
	);
}

//******************************************************************************
// Verify element with captcha and form buttons
//******************************************************************************

const useVerifyStyles = createUseStyles({
	alert: {
		marginBottom: '-18px',
		marginTop: '3px',
	},
	padding: {
		paddingTop: '6px',
	},
	verify: {
		marginBottom: '20px',
		marginTop: '20px',
		textAlign: 'center',
	},
});

function Verify(): JSX.Element {
	const styles = useVerifyStyles();
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

			<Warning
				className={styles.alert}
				display={showWarning}
				label='Registration'
			/>
		</div>
	);
}
