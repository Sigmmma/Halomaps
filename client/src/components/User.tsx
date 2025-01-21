import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { User } from '../../../server/database/types';

import { DayDate } from './Date';
import { Icons, avatar } from '../images';
import { clientUrl } from '../url';

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

interface UserAvatarProps {
	user: User;
	gap?: number;
}

interface UserLinkProps {
	user: Pick<User, 'name'|'id'>;
}

interface UserPanelProps {
	user: User;
}

export function UserAvatar({
	user,
	gap = 0,
}: UserAvatarProps): JSX.Element {
	return <>
		{user.avatar && <img src={avatar(user.avatar)} />}
		{Array(gap).fill(null).map(() => <br />)}
		{user.quote && <div>{user.quote}</div>}
	</>;
}

export function UserLink({ user }: UserLinkProps): JSX.Element {
	return <a href={clientUrl(`index.cfm?page=userinfo&userid=${user.id}`)}>
		{user.name}
	</a>;
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

		<UserAvatar user={user} gap={2} />
	</div>;
}
