import classNames from 'classnames';
import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { Icons } from '../images';
import { clientUrl } from '../url';

interface PrivateMessageControlsProps {
	selectedKey?: ButtonKey;
}

export enum ButtonKey {
	NEW_MSG, INBOX, SENTBOX, SAVEBOX,
}

const BUTTON_DEFS = [
	{ key: ButtonKey.NEW_MSG, icon: Icons.NEW_PM,  label: 'New Message', url: 'index.cfm?page=privateMessageNew'          },
	{ key: ButtonKey.INBOX,   icon: Icons.INBOX,   label: 'Inbox',       url: 'index.cfm?page=private_messages&box=inbox' },
	{ key: ButtonKey.SENTBOX, icon: Icons.SENTBOX, label: 'Sentbox',     url: 'index.cfm?page=private_messages&box=sent'  },
	{ key: ButtonKey.SAVEBOX, icon: Icons.SAVEBOX, label: 'Savebox',     url: 'index.cfm?page=private_messages&box=saved' },
];

const useStyles = createUseStyles({
	bar: {
		marginBottom: '-12px',
		marginTop: '30px',
	},
	bold: {
		fontWeight: 'bold',
	},
	item: {
		display: 'inline',
		fontSize: '14px',
		marginRight: '24px',
		marginLeft: '3px',
	},
	label: {
		display: 'inline-block',
		paddingBottom: '20px',
		textDecorationLine: 'underline',
		verticalAlign: 'middle',
	},
});

export default function PrivateMessageControls({
	selectedKey,
}: PrivateMessageControlsProps): JSX.Element {
	const styles = useStyles();
	return (
		<div className={styles.bar}>{
			BUTTON_DEFS.map((def, index) => (
				<div className={styles.item} key={index}>
					<a href={clientUrl(def.url)}>
						<img src={def.icon} />
						<div className={classNames(styles.label, {
							[styles.bold]: def.key === selectedKey,
						})}>
							{def.label}
						</div>
					</a>
				</div>
			))
		}</div>
	);
}
