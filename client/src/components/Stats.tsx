import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';

import { Post, User } from '../../../server/database/types';

import { RelDate } from './Date';
import { Table } from './Table';
import UserLink from './User';

interface StatProps {
	lastPostUser: User;
	lastPost: Post;
	lastRegisteredUser: User;
	mostUsersAt: Date;
	mostUsersCount: number;
	postCount: number;
	topicCount: number;
	userCount: number;
}

const useStyles = createUseStyles({
	container: {
		marginTop: '15px',
	},
	text: {
		fontSize: '10px',
	},
});

export default function ForumStats(props: StatProps): JSX.Element {
	const styles = useStyles();
	return (
		<div className={styles.container}>
			<Table
				columns={[{
					header: 'Forum Statistics',
					onRender: (data) => <StatCell {...data} />,
				}]}
				rows={[props]}
			/>
		</div>
	);
}

function StatCell({
	lastPost,
	lastPostUser,
	lastRegisteredUser,
	mostUsersAt,
	mostUsersCount,
	postCount,
	topicCount,
	userCount,
}: StatProps): JSX.Element {
	const styles = useStyles();
	return (
		<div className={styles.text}>
			<b>{userCount}</b> users have contributed to {' '}
			<b>{topicCount}</b> threads and {' '}
			<b>{postCount}</b> posts with latest post by {' '}
			<UserLink user={lastPostUser} /> on {' '}
			<a href='TODO'><RelDate date={lastPost.created_at} /></a><br/>

			There are currently: <b>0</b> anonymous users online. {' '}
			<b>0</b> of <b>{userCount}</b> registered users online:<br/>

			Most registered users online was {mostUsersCount} on {' '}
			<RelDate date={mostUsersAt} />. Today 0 users visited forums.<br/>

			The newest user is {' '}
			<UserLink user={lastRegisteredUser} /> registered {' '}
			<RelDate date={lastRegisteredUser.joined_at} />
		</div>
	);
}
