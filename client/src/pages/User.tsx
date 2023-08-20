import React, { JSX, ReactNode, useCallback, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { useAsync } from 'react-use';

import {
	Forum,
	Post,
	TopicWithCount,
	User,
	UserWithPostCount,
} from '../../../server/database/types';
import { mapById } from '../../../server/util';

import Client from '../client';
import AsyncContent from '../components/AsyncContent';
import { FORUM_CLOSE_DATE, RelDate, durationInDays } from '../components/Date';
import PostContent from '../components/Post';
import { Column, InlineElement, Separator, Table } from '../components/Table';
import { UserAvatar } from '../components/User';
import useCaselessSearchParams from '../hooks/useSearchParamsCaseInsensitive';

export default function User(): JSX.Element {
	const [params] = useCaselessSearchParams();
	const userId = params.getInt('userID');

	const userQuery = useAsync(async () => {
		if (userId == null) throw new Error('Missing userID');
		return await Client.getUser(userId);
	}, [userId]);

	return <AsyncContent state={userQuery} render={(userInfo) => {
		const { user, board_post_count, forums, posts, topics } = userInfo;
		const forumMap = mapById(forums);
		const topicMap = mapById(topics);

		const COLUMNS: Column<Post>[] = [{
			header: `Viewing User Profile for: ${user.name}`,
			onRender: (post) => {
				const topic = topicMap.get(post.topic_id)!;
				const forum = forumMap.get(topic.forum_id)!;
				return <UserPost post={post} forum={forum} topic={topic} />;
			},
		}];

		const rows: (Post | InlineElement)[] = [
			new InlineElement(<UserProfile user={user} />),
			new InlineElement(<UserSummary
				boardPostCount={board_post_count}
				recentPostCount={posts.length}
				user={user}
			/>),
			...posts,
		];

		return <Table columns={COLUMNS} rows={rows} />;
	}} />;
}

//******************************************************************************
// User Profile
//******************************************************************************

interface UserProfileProps {
	lastPostAt?: Date;
	user: User;
}

const useColumnStyles = createUseStyles({
	label: {
		display: 'inline-block',
		height: '20px',
		marginTop: '3px',
	},
	left: {
		display: 'inline-grid',
		width: '50%',
	},
	right: {
		borderLeftColor: 'white',
		borderLeftStyle: 'solid',
		borderLeftWidth: '1px',
		display: 'inline-grid',
		width: 'calc(50% - 1px)',
	},
});

/** The User profile info at the top of the User page. */
function UserProfile({
	user,
	lastPostAt,
}: UserProfileProps): JSX.Element {
	const styles = useColumnStyles();

	const ThickLabel = useCallback((label: string): JSX.Element => (
		<div className={styles.label}>
			{label}
		</div>
	), []);

	return <div>
		<div className={styles.left}>
			<Separator content={ThickLabel('About')} />
			<UserAbout user={user} lastPostAt={lastPostAt} />
		</div>
		<div className={styles.right}>
			<Separator content={ThickLabel('Contact')} />
			<UserContact user={user} />
		</div>
	</div>
}

//******************************************************************************
// User "About" info columns
//******************************************************************************

type AboutRow = [string, ReactNode];

const useAboutStyles = createUseStyles({
	label: {
		fontWeight: 'bold',
		textAlign: 'right',
	},
	link: {
		display: 'block',
		marginTop: '32px',
		fontSize: '14px',
		fontWeight: 'bold',
	},
	row: {
		height: '19px',
	},
	table: {
		marginTop: '1px',
		width: 'fit-content',
	},
	value: {
		display: 'block',
		marginLeft: '2px',
	},
});

/** The left-hand "About" User profile column. */
function UserAbout({
	user,
	lastPostAt,
}: UserProfileProps): JSX.Element {
	const styles = useAboutStyles();

	const rows = useMemo<AboutRow[]>(() => {
		const items: AboutRow[] = [
			['Joined',     <RelDate date={user.joined_at} />],
			['Last Post',  lastPostAt && <RelDate date={lastPostAt} />],
			['Last Visit', <RelDate date={user.last_visit_at} />],
			['Location',   user.location],
			['Occupation', user.occupation],
			['Interests',  user.interests],
			['Your Age',   user.age],
			['What Games do you play', user.games_played],
		];

		if (user.avatar) {
			items.push(['Avatar', <UserAvatar user={user} />]);
		}

		return items;
	}, [user, lastPostAt]);

	return (
		<table className={styles.table}>{
			rows.map(([label, node]) => (
				<tr className={styles.row}>
					<td className={styles.label}>{label}:</td>
					<td className={styles.value}>{node}</td>
				</tr>
			))
		}</table>
	);
}

/** The right-hand "Contact" User profile column. */
function UserContact({ user }: UserProfileProps): JSX.Element {
	const styles = useAboutStyles();
	return (
		<a
			className={styles.link}
			href={`index.cfm?page=privateMessageNew&messageTo=${user.name}`}
		>
			Send Private Message
		</a>
	);
}

//******************************************************************************
// User Posts and summary
//******************************************************************************

interface UserSummaryProps {
	boardPostCount: number;
	recentPostCount: number;
	user: UserWithPostCount;
}

interface UserPostProps {
	forum: Forum;
	topic: TopicWithCount;
	post: Post;
}

const PADDING_LEFT = '10px';
const usePostStyles = createUseStyles({
	indent: {
		paddingLeft: PADDING_LEFT,
	},
	path: {
		backgroundColor: '#C6DDF0',
	},
	summary: {
		fontWeight: 'bold',
		marginTop: '3px',
		paddingLeft: PADDING_LEFT,
	},
});

/** The User Post Statistics right below the profile info. */
function UserSummary({
	boardPostCount,
	recentPostCount,
	user,
}: UserSummaryProps): JSX.Element {
	const styles = usePostStyles();

	const accountAgeDays = durationInDays(user.joined_at, FORUM_CLOSE_DATE);
	const postPercent = (user.total_posts / boardPostCount) * 100;
	const postsPerDay = user.total_posts / accountAgeDays;

	return <>
		<Separator content='Post Statistics' />
		<div className={styles.summary}>
			{user.name} has contributed to {user.total_posts} posts
			out of {boardPostCount} total posts ({postPercent.toFixed(2)}%)
			in {Math.floor(accountAgeDays)} days
			({postsPerDay.toFixed(2)} posts per day).
		</div>
		<br />
		<div className={styles.summary}>
			{recentPostCount} Most recent posts:
		</div>
	</>;
}

/** A single Post from the user, including the Topic, Forum, and Post count. */
function UserPost({
	forum,
	post,
	topic,
}: UserPostProps): JSX.Element {
	const styles = usePostStyles();
	return (
		<div className={styles.indent}>
			<div className={styles.path}>
				<a href={`/index.cfm?page=forum&forumID=${forum.id}`}>
					{forum.name}
				</a>
				{' » '}
				<a href={`/index.cfm?page=topic&topicID=${topic.id}`}>
					{topic.name}
				</a>
				{' '}
				<i><RelDate date={post.created_at} /></i>
				{' '}
				(Total replies: {topic.replies})
			</div>

			<PostContent content={post.content} />
			<br />
		</div>
	);
}
