
interface Mirrored {
	mirrored_at: Date;
}

export type User = Mirrored & {
	id: number;
	name: string;
	joined_at: Date;
	last_visit_at: Date;
	special: string | null;
	avatar: string | null;
	quote: string | null;
	location: string | null;
	occupation: string | null;
	interests: string | null;
	age: string | null;
	games_played: string | null;
}

export type Category = Mirrored & {
	id: number;
	sort_index: number;
	name: string;
}

export type Forum = Mirrored & {
	id: number;
	sort_index: number;
	name: string;
	locked: boolean;
	description: string;
	category_id: number;
}

export type Stat = Mirrored & {
	name: string;
	value: number;
}

export type Topic = Mirrored & {
	id: number;
	name: string;
	views: number;
	pinned: boolean;
	locked: boolean;
	forum_id: number;
	author_id: number;
	author_name: string;
	moved_from: number | null;
	created_at: Date;
}

export type Post = Mirrored & {
	id: number;
	author_id: number;
	topic_id: number;
	created_at: Date;
	content: string;
}

export interface ForumStats {
	users: number;
	topics: number;
	posts: number;
	most_users_num: number;
	most_users_at: Date;
}
