import React, { JSX } from 'react';
import { createUseStyles } from 'react-jss';
import { useAsync } from 'react-use';

import { TopicWithPostInfo } from '../../../server/database/types';

import Client from '../client';
import AsyncContent from '../components/AsyncContent';
import { RelDate } from '../components/Date';
import ModeratorList from '../components/Moderator';
import { OverviewPageControl, TopicPageControl } from '../components/PageControl';
import Path from '../components/Path';
import { Column, InlineElement, Separator, Table } from '../components/Table';
import { UserLink } from '../components/User';
import useCaselessSearchParams from '../hooks/useSearchParamsCaseInsensitive';
import { Icons } from '../images';
import { clientUrl } from '../url';

const POPULAR_THRESHOLD = 100;
const POSTS_PER_PAGE = 35;
const TOPICS_PER_PAGE = 50;

const useStyles = createUseStyles({
	icon: {
		display: 'block',
	},
	moderator: {
		height: '16px',
		paddingLeft: '5px',
	},
	pin: {
		marginLeft: '4px',
		verticalAlign: 'bottom',
	},
	table: {
		marginTop: '0px',
	},
	title: {
		paddingLeft: '4px',
	},
});

const COLUMNS: Column<TopicWithPostInfo>[] = [
	{
		header: undefined,
		width: '32px',
		onRender: (topic) => <TopicIcon topic={topic} />,
	},
	{
		header: 'Thread',
		span: 2,
		onRender: (topic) => <TopicInfo topic={topic} />,
	},
	{
		header: 'Started By',
		blueBg: true,
		width: '100px',
		onRender: (topic) => <>{topic.author_name}</>,
	},
	{
		header: 'Replies',
		blueBg: true,
		width: '50px',
		onRender: (topic) => <>{topic.post_count}</>,
	},
	{
		header: 'Views',
		blueBg: true,
		width: '50px',
		onRender: (topic) => <>{topic.views}</>,
	},
	{
		header: 'Last Post',
		blueBg: true,
		width: '125px',
		onRender: (topic) => <LastPost topic={topic} />,
	},
];

export default function Forum(): JSX.Element {
	const [params] = useCaselessSearchParams();
	const forumId = params.getInt('forumID') ?? 0;
	const startAt = params.getInt('start') ?? undefined;

	const forumInfo = useAsync(() => Promise.all([
		// TODO need to separate these somehow, while allowing one AsyncContent
		// context to access both values.
		Client.getForum(forumId),
		Client.getTopics(forumId, startAt),
	]), [forumId, startAt]);

	const styles = useStyles();

	return <AsyncContent state={forumInfo} render={([info, list]) => <>
		<Path parts={[
			{
				name: info.category.name,
				url: clientUrl(`/index.cfm?page=home&categoryID=${info.category.id}`),
			},
			{
				name: info.forum.name,
				url: clientUrl(`/index.cfm?page=forum&forumID=${info.forum.id}`),
			},
		]} />

		<Table className={styles.table} columns={COLUMNS} rows={[
			new InlineElement(<Separator content={
				<ModeratorList
					className={styles.moderator}
					moderators={info.moderators}
				/>
			}/>),
			...list.topics,
		]} />

		{info.topics > TOPICS_PER_PAGE && <>
			<TopicPageControl
				count={info.topics}
				pageSize={TOPICS_PER_PAGE}
				start={list.start}
				buildUrl={(page: number): string => {
					const start = ((page - 1) * TOPICS_PER_PAGE) + 1;
					return clientUrl(`/index.cfm?page=forum&forumID=${forumId}&start=${start}`);
				}}
			/>
			<br />
		</>}
	</>}/>;
}

//******************************************************************************
// Column components
//******************************************************************************

interface TopicProp {
	topic: TopicWithPostInfo;
}

function TopicIcon({ topic }: TopicProp): JSX.Element {
	const styles = useStyles();
	const image = topic.locked                 ? Icons.TOPIC_LOCKED
		: topic.post_count > POPULAR_THRESHOLD ? Icons.TOPIC_POPULAR
		:                                        Icons.TOPIC;
	return <img src={image} className={styles.icon} />;
}

function TopicInfo({ topic }: TopicProp): JSX.Element {
	const styles = useStyles();
	return (
		<div>
			{ topic.pinned
				? <img className={styles.pin} src={Icons.PINNED} />
				: undefined
			}

			<span className={styles.title}>
				<b><a href={clientUrl(`/index.cfm?page=topic&topicID=${topic.id}`)}>
					{topic.name}
				</a></b>
			</span>

			{' '}

			<OverviewPageControl
				count={topic.post_count}
				pageSize={POSTS_PER_PAGE}
				buildUrl={(page: number): string => {
					const start = ((page - 1) * POSTS_PER_PAGE) + 1;
					return clientUrl(`/index.cfm?page=topic&topicID=${topic.id}&start=${start}`);
				}}
			/>
		</div>
	);
}

function LastPost({ topic }: TopicProp): JSX.Element {
	return <>
		<div><RelDate date={topic.latest_post_time} /></div>
		{'by '}<UserLink user={{
			id:   topic.latest_post_author_id,
			name: topic.latest_post_author_name,
		}} />
	</>;
}
