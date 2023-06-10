import {
	Category,
	Forum,
	ForumStats,
	PostAndUser,
	Topic,
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

export interface ForumInfo {
	category: Category;
	forum: Forum;
	moderators: User[];
	topics: number;
}
