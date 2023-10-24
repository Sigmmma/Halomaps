import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { Icons } from '../images';

const BUTTON_DEFS = [
	{ icon: Icons.NEW_PM,  label: 'New Message', url: 'index.cfm?page=privateMessageNew'          },
	{ icon: Icons.INBOX,   label: 'Inbox',       url: 'index.cfm?page=private_messages&box=inbox' },
	{ icon: Icons.SENTBOX, label: 'Sentbox',     url: 'index.cfm?page=private_messages&box=sent'  },
	{ icon: Icons.SAVEBOX, label: 'Savebox',     url: 'index.cfm?page=private_messages&box=saved' },
];

const useStyles = createUseStyles({
	bar: {
		marginBottom: '-12px',
		marginTop: '30px',
	},
	item: {
		display: 'inline',
		fontSize: '14px',
		marginRight: '27px',
		marginLeft: '3px',
	},
	label: {
		display: 'inline-block',
		paddingBottom: '20px',
		textDecorationLine: 'underline',
		verticalAlign: 'middle',
	},
});

export default function PrivateMessageControls(): JSX.Element {
	const styles = useStyles();
	return (
		<div className={styles.bar}>{
			BUTTON_DEFS.map((def, index) => (
				<div className={styles.item} key={index}>
					<a href={def.url}>
						<img src={def.icon} />
						<div className={styles.label}>{def.label}</div>
					</a>
				</div>
			))
		}</div>
	);
}
