import { Category, Forum, ForumStats, PostAndUser, User } from '../database/types';

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
