import { Forum } from '../../server/database/types';
import {
	ForumInfo,
	HomeData,
	TopicList,
	TopicInfo,
	TopicPostPage,
	UserInfo,
	SearchParams,
} from '../../server/http/types';

// TODO need to configure this somewhere
const BASE_URL = 'http://localhost:9123';

function handlePossibleRequestError(response: Response) {
	if (response.status >= 400) {
		throw new Error(`${response.status} ${response.statusText}`);
	}
}

async function toData<T = unknown>(response: Response): Promise<T> {
	const parser = ({
		'text/plain':       () => response.text(),
		'application/json': () => response.json(),
	}[response.headers.get('Content-type') ?? '']);
	return await parser?.();
}

export default class Client {

	private static async request<T = unknown>(
		path: string,
		params?: Record<string, string>,
	): Promise<T> {
		const url = new URL(path, BASE_URL);
		Object
			.entries(params ?? {})
			.filter(([_key, value]) => value)
			.forEach(([key, value]) => url.searchParams.append(key, value));

		const response = await fetch(url);

		handlePossibleRequestError(response);

		return await toData(response);
	}

	private static async post<T = unknown>(
		path: string,
		data?: unknown,
	): Promise<T> {
		const url = new URL(path, BASE_URL);

		const response = await fetch(url, {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		handlePossibleRequestError(response);

		return await toData(response);
	}

	static async getInfo(): Promise<string> {
		return await Client.request('/info');
	}

	static async getHome(categoryId?: number): Promise<HomeData> {
		return await Client.request('/home' + (categoryId ? `/${categoryId}` : ''));
	}

	static async getForum(forumId: number): Promise<ForumInfo> {
		return await Client.request(`/forum/${forumId}`);
	}

	static async getForums(): Promise<Forum[]> {
		return await Client.request('/forums');
	}

	static async getLatestTopic(forumId: number): Promise<TopicInfo> {
		return await Client.request(`/topic/latest/${forumId}`);
	}

	static async getPosts(topicId: number, start?: number): Promise<TopicPostPage> {
		return await Client.request(`/topic/${topicId}/posts`, {
			start: start ? `${start}` : '',
		});
	}

	static async postSearch(searchParams: SearchParams): Promise<void> {
		return await Client.post('/search', searchParams);
	}

	static async getTopic(topicId: number): Promise<TopicInfo> {
		return await Client.request(`/topic/${topicId}`);
	}

	static async getTopics(forumId: number, start?: number): Promise<TopicList> {
		return await Client.request(`/forum/${forumId}/topics`, {
			start: start ? `${start}` : '',
		});
	}

	static async getUser(userId: number): Promise<UserInfo> {
		return await Client.request(`/user/${userId}`);
	}
}
