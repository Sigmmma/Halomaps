import React, { ReactNode, useCallback, useMemo } from 'react';
import { createUseStyles } from 'react-jss';

import { Post, User, UserWithPostCount } from '../../../server/database/types';

import { FORUM_CLOSE_DATE, RelDate, durationInDays } from '../components/Date';
import { Column, InlineElement, Separator, Table } from '../components/Table';
import { UserAvatar } from '../components/User';

// TODO obviously remove and replace this with real data
const TEMP_TEST_USER: UserWithPostCount = {
	age: 'older than your mother',
	avatar: null,
	games_played: 'all of them',
	id: 123,
	interests: 'fuckin bitches',
	joined_at: new Date(),
	last_visit_at: new Date(),
	location: 'everywhere',
	mirrored_at: new Date(),
	name: 'Cool dude',
	occupation: 'fuckin bitches professionally',
	quote: 'I fuck bitches',
	special: 'certified bitch fucker',
	total_posts: 1000,
};

export default function User(): JSX.Element {
	const COLUMNS: Column<Post>[] = [{
		header: `Viewing User Profile for: ${TEMP_TEST_USER.name}`,
		onRender: (post) => <UserPost post={post}/>,
	}];

	const rows: (Post | InlineElement)[] = [
		new InlineElement(<UserProfile user={TEMP_TEST_USER} />),
		new InlineElement(<UserSummary user={TEMP_TEST_USER} boardPostCount={1400} />),
	];

	return (
		<Table
			columns={COLUMNS}
			rows={rows}
		/>
	);
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
	user: UserWithPostCount;
}

interface UserPostProps {
	post: Post;
}

const PADDING_LEFT = '10px';
const usePostStyles = createUseStyles({
	summary: {
		fontWeight: 'bold',
		marginTop: '3px',
		paddingLeft: PADDING_LEFT,
	},
});

/** The User Post Statistics right below the profile info. */
function UserSummary({
	boardPostCount,
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
	</>;
}

/** A single Post from the user, including the Topic, Forum, and Post count. */
function UserPost({ post }: UserPostProps): JSX.Element {
	// TODO implement this
	return <></>;
}
