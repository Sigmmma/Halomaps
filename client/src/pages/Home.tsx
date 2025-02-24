import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';
import { useAsync } from 'react-use';

import { PostAndUser, User } from '../../../server/database/types';
import { ForumWithPost } from '../../../server/http/types';

import Client from '../client';
import AsyncContent from '../components/AsyncContent';
import { RelDate } from '../components/Date';
import ModeratorList from '../components/Moderator';
import ForumStats from '../components/Stats';
import { Column, InlineElement, Separator, Table } from '../components/Table';
import { UserLink } from '../components/User';
import useCaselessSearchParams from '../hooks/useSearchParamsCaseInsensitive';
import { Icons } from '../images';
import { clientUrl } from '../url';

interface TableRowInfo {
	forum: ForumWithPost;
	moderators: User[];
}

const useStyles = createUseStyles(() => ({
	icon: {
		paddingBottom: '8px',
		paddingTop: '9px',
		verticalAlign: 'middle',
	},
	separator: {
		paddingTop: '2px',
		height: '17px',
	},
}));

export default function Home(): JSX.Element {
	const [params] = useCaselessSearchParams();
	const categoryId = params.getInt('categoryID') ?? undefined;

	const state = useAsync(async () => await Client.getHome(categoryId), [categoryId]);
	const styles = useStyles();

	const COLUMNS: Column<TableRowInfo>[] = [
		{
			header: undefined,
			width: '32px',
			onRender: () => <img className={styles.icon} src={Icons.FORUM} />,
		},
		{
			header: 'Forum',
			span: 2,
			onRender: (info) => <ForumInfo info={info} />,
		},
		{
			header: 'Topics',
			blueBg: true,
			width: '50px',
			onRender: (info) => info.forum.topicCount,
		},
		{
			header: 'Posts',
			blueBg: true,
			width: '50px',
			onRender: (info) => info.forum.postCount,
		},
		{
			header: 'Last Post',
			blueBg: true,
			width: '125px',
			onRender: (info) => (
				<PostInfo
					info={info.forum.latest!}
					forumId={info.forum.id}
				/>
			),
		},
	];

	return <AsyncContent state={state} render={(data) => <>
		<Table columns={COLUMNS} rows={
			data.categories.flatMap(category => [
				new InlineElement(<Separator
					className={styles.separator}
					content={category.name}
					showTop
				/>),
				...category.forums?.map(forum => ({
					forum,
					moderators: data.moderators,
				})) ?? []
			])}
		/>

		<ForumStats
			lastPost={data.newestPost.post}
			lastPostUser={data.newestPost.user}
			lastRegisteredUser={data.newestUser}
			mostUsersAt={data.stats.most_users_at}
			mostUsersCount={data.stats.most_users_num}
			postCount={data.stats.posts}
			topicCount={data.stats.topics}
			userCount={data.stats.users}
		/>
	</>} />;
}

//******************************************************************************
// Forum Info Cell
//******************************************************************************

interface ForumInfoProps {
	info: TableRowInfo;
}

const useForumStyles = createUseStyles({
	container: {
		paddingLeft: '4px',
	},
	description: {
		fontSize: '10px',
	},
	icon: {
		verticalAlign: 'bottom',
		marginRight: '4px',
	},
	moderators: {
		paddingTop: '5px',
	},
});

function ForumInfo({ info }: ForumInfoProps): JSX.Element {
	const { forum, moderators } = info;

	const styles = useForumStyles();
	return (
		<div className={styles.container}>
			{forum.locked
				? <img className={styles.icon} src={Icons.LOCK} />
				: <></>
			}

			<b><a href={clientUrl(`/index.cfm?page=forum&forumId=${forum.id}`)}>
				{forum.name}
			</a></b>

			<div className={styles.description}>
				{/* TODO Set padding */}
				{forum.description}

				<ModeratorList
					className={styles.moderators}
					moderators={moderators}
				/>
			</div>
		</div>
	);
}

//******************************************************************************
// Forum Info Cell
//******************************************************************************

interface PostInfoProps {
	forumId: number;
	info: PostAndUser;
}

const usePostStyles = createUseStyles({
	icon: {
		marginLeft: '4px',
		verticalAlign: 'bottom',
	},
	text: {
		fontSize: '10px',
		textAlign: 'center',
	},
});

function PostInfo({
	forumId,
	info,
}: PostInfoProps): JSX.Element {
	const styles = usePostStyles();
	return (
		<div className={styles.text}>
			<RelDate date={info.post.created_at} /><br/>
			<UserLink user={info.user} />
			<a href={clientUrl(`/index.cfm?page=topic&eflag=findlasttopic&forumID=${forumId}`)}>
				<img className={styles.icon} src={Icons.TOPIC_JUMP} />
			</a>
		</div>
	);
}
