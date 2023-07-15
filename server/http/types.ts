import {
	AdjacentTopic,
	Category,
	Forum,
	ForumStats,
	Post,
	PostAndUser,
	TopicPosts,
	TopicWithCount,
	TopicWithPostInfo,
	User,
	UserWithPostCount,
} from '../database/types';

export type ForumWithPost = Forum & {
	latest?: PostAndUser;
	postCount: number;
	topicCount: number;
};

export type CategoryWithForum = Category & {
	forums?: ForumWithPost[];
}

export type HomeData = {
	categories: CategoryWithForum[];
	moderators: User[];
	newestPost: PostAndUser;
	newestUser: User;
	stats: ForumStats;
}

export interface TopicList {
	start: number;
	topics: TopicWithPostInfo[];
}

export interface ForumInfo {
	category: Category;
	forum: Forum;
	moderators: User[];
	topics: number;
}

export type TopicInfo = AdjacentTopic & {
	category: Category;
	forum: Forum;
	moderators: User[];
	topic: TopicWithCount;
}

export type TopicPostPage = TopicPosts & {
	size: number;
	start: number;
}

export interface UserInfo {
	board_post_count: number;
	forums: Forum[];
	posts: Post[];
	topics: TopicWithCount[];
	user: UserWithPostCount;
}
