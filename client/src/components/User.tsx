import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { User } from '../../../server/database/types';

import { DayDate } from './Date';
import { Icons } from '../images';

const useStyles = createUseStyles({
	container: {
		width: '140px',
		paddingLeft: '5px',
	},
	date: {
		fontSize: '10px',
	},
	name: {
		fontSize: '14px',
		fontWeight: 'bold',
	},
});

interface UserLinkProps {
	user: Pick<User, 'name'|'id'>;
}

interface UserPanelProps {
	user: User;
}

export function UserLink({ user }: UserLinkProps): JSX.Element {
	return <a href='TODO'>{user.name}</a>;
}

export function UserPanel({ user }: UserPanelProps): JSX.Element {
	const styles = useStyles();

	return <div className={styles.container}>
		<div className={styles.name}><UserLink user={user} /></div>

		<div>{user.special === 'moderator'
			? <img src={Icons.MODERATOR} />
			: <>{user.special}</>
		}</div>

		<div className={styles.date}>
			Joined: <DayDate date={user.joined_at} />
		</div>

		{/* TODO need to load static content somehow */}
		{user.avatar && <img src={user.avatar} />}

		<br /><br />

		{user.quote && <div>{user.quote}</div>}
	</div>;
}
