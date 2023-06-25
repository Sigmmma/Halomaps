import parseHTML from 'html-react-parser';
import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';
import { useAsync } from 'react-use';

import { AdjacentTopic, Post, User } from '../../../server/database/types';
import { TopicInfo, TopicPostPage } from '../../../server/http/types';

import Client from '../client';
import AsyncContent from '../components/AsyncContent';
import { UserPanel } from '../components/User';
import { RelDate } from '../components/Date';
import ModeratorList from '../components/Moderator';
import { CurPage, TopicPageControl } from '../components/PageControl';
import Path, { PathPart } from '../components/Path';
import { Column, Separator, Table } from '../components/Table';
import useCaselessSearchParams from '../hooks/useSearchParamsCaseInsensitive';
import { Buttons } from '../images';

interface TopicInfoResponse {
	info: TopicInfo;
	page: TopicPostPage;
}

const useStyles = createUseStyles({
	messageArea: {
		paddingBottom: '30px',
		paddingLeft: '10px',
		paddingRight: '10px',
		paddingTop: '10px',
	},
});

export default function Topic(): JSX.Element {
	const styles = useStyles();

	const [params] = useCaselessSearchParams();
	const eflag   = params.get('eflag');
	const forumId = params.getInt('forumID');
	const start   = params.getInt('start');
	const topicId = params.getInt('topicID');

	const topicQuery = useAsync(async (): Promise<TopicInfoResponse> => {
		let info: TopicInfo;
		if (eflag === 'findlasttopic') {
			if (!forumId) throw new Error('Missing forumID');
			info = await Client.getLatestTopic(forumId);
		} else {
			if (!topicId) throw new Error('Missing topicID');
			info = await Client.getTopic(topicId)
		}

		return {
			info,
			page: await Client.getPosts(info.topic.id, start ?? undefined),
		};
	});

	return <AsyncContent state={topicQuery} render={({ info, page }) => {
		const authorMap = page.users.reduce(
			(map, user) => map.set(user.id, user),
			new Map<number, User>()
		);

		const columns: Column<Post>[] = [
			{
				header: 'Author',
				valign: 'top',
				width: '145px',
				onRender: (post) => (
					<UserPanel user={authorMap.get(post.author_id)!} />
				),
			},
			{
				header: <>
					Topic: {info.topic.name}{' '}
					({info.topic.posts} messages,{' '}
					<CurPage
						count={info.topic.posts}
						pageSize={page.size}
						start={page.start}
					/>)
				</>,
				valign: 'top',
				onRender: (post, idx) => <>
					<PostInfoBar
						post={post}
						// Row list has one separator as index 0, so index
						// coincidentally can double as the post number.
						postNum={idx}
						totalPosts={info.topic.posts}
					/>

					<div className={styles.messageArea}>
						{parseHTML(post.content)}
					</div>

					<PostReplyBar postId={post.id} topicId={post.topic_id} />
				</>,
			},
		];

		const pageControl = (info.topic.posts > page.size) && (
			<TopicPageControl
				count={info.topic.posts}
				pageSize={page.size}
				start={page.start}
				buildUrl={(pageNum) => {
					const start = ((pageNum - 1) * page.size) + 1;
					return `/index.cfm?page=topic&topicID=${info.topic.id}&start=${start}`;
				}}
			/>
		);

		const pathParts: PathPart[] = [
			{
				name: info.category.name,
				url: `/index.cfm?page=home&categoryID=${info.category.id}`,
			},
			{
				name: info.forum.name,
				url: `/index.cfm?page=forum&forumID=${info.forum.id}`,
			},
			{
				name: info.topic.name,
				locked: info.topic.locked,
				url: `/index.cfm?page=topic&topicID=${info.topic.id}`,
			},
		];

		const rows = [
			Separator(<ModeratorList moderators={info.moderators} />),
			...page.posts,
			Separator(),
		];

		return <>
			<Path parts={pathParts} />
			<br />
			{ pageControl }
			<Table columns={columns} rows={rows} />
			{ pageControl && <>
				{pageControl}
				<br />
			</> }
			<br />
			<TopicReplyBar
				forumId={info.topic.forum_id}
				topicId={info.topic.id}
			/>
			<TopicLinks {...info} />
		</>
	}} />;
}

//******************************************************************************
// PostInfoBar
//******************************************************************************

interface PostInfoBarProps {
	post: Post;
	postNum: number;
	totalPosts: number;
}

const useInfoBarStyles = createUseStyles({
	container: {
		backgroundColor: '#C6DDF0',
		padding: '10px',
	},
});

function PostInfoBar({
	post,
	postNum,
	totalPosts,
}: PostInfoBarProps): JSX.Element {
	const styles = useInfoBarStyles();
	return (
		<div className={styles.container}>
			<b>Posted: <RelDate date={post.created_at} /></b>
			&nbsp;&nbsp;&nbsp;&nbsp;
			Msg. {postNum} of {totalPosts}
		</div>
	);
}

//******************************************************************************
// PostReplyBar
//******************************************************************************

interface PostReplyBarProps {
	topicId: number;
	postId: number;
}

const usePostReplyBarStyles = createUseStyles({
	container: {
		float: 'right',
		width: '300px',
	},
});

function PostReplyBar({
	topicId,
	postId,
}: PostReplyBarProps): JSX.Element {
	const styles = usePostReplyBarStyles()
	return (
		<div className={styles.container}>
			<a href={
				`/index.cfm?page=newreply&topicID=${topicId}&replyID=${postId}#NEWMSG`
			}>
				<img src={Buttons.REPLY_POST} title='Reply to Post' />
			</a>
			{' '}
			<a href={
				`/index.cfm?page=newreply&topicID=${topicId}&quoteID=${postId}#NEWMSG`
			}>
				<img src={Buttons.REPLY_QUOTE} title='Quote Post' />
			</a>
		</div>
	);
}

//******************************************************************************
// TopicReplyBar
//******************************************************************************

interface TopicReplyBarProps {
	forumId: number;
	topicId: number;
}

const useTopicReplyBarStyles = createUseStyles({
	buttons: {
		float: 'right',
	},
	container: {
		height: '27px',
		width: '95%',
	},
});

function TopicReplyBar({
	forumId,
	topicId,
}: TopicReplyBarProps): JSX.Element {
	const styles = useTopicReplyBarStyles();
	return (
		<div className={styles.container}>
			<div className={styles.buttons}>
				<a href={`/index.cfm?page=newtopic&forumID=${forumId}`}>
					<img src={Buttons.NEW_TOPIC} />
				</a>
				{' '}
				<a href={`/index.cfm?page=newreply&topicID=${topicId}#NEWMSG`}>
					<img src={Buttons.REPLY_TOPIC} />
				</a>
			</div>
		</div>
	);
}

//******************************************************************************
// TopicLinks
//******************************************************************************

const useLinkStyles = createUseStyles({
	container: {
		width: '95%',
	},
	links: {
		marginLeft: 'auto',
		marginRight: 'auto',
		width: 'fit-content',
	},
});

function TopicLinks({
	topicNewerId,
	topicOlderId,
}: AdjacentTopic): JSX.Element {
	const styles = useLinkStyles();
	return (
		<div className={styles.container}>
			<div className={styles.links}>
				{topicOlderId && (
					<a href={`/index.cfm?page=topic&topicID=${topicOlderId}`}>
						Previous Older Thread
					</a>
				)}
				&nbsp;&nbsp;&nbsp;&nbsp;
				{topicNewerId && (
					<a href={`/index.cfm?page=topic&topicID=${topicNewerId}`}>
						Next newer Thread
					</a>
				)}
			</div>
		</div>
	);
}
