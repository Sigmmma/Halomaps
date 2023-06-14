import {
	Category,
	Forum,
	ForumStats,
	PostAndUser,
	TopicPosts,
	TopicWithInfo,
	User,
} from '../database/types';

export type ForumWithPost = Forum & {
	latest?: PostAndUser;
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
	topics: TopicWithInfo[];
}

export interface ForumInfo {
	category: Category;
	forum: Forum;
	moderators: User[];
	topics: number;
}

export type TopicPostPage = TopicPosts & {
	start: number;
}
