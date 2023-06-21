import {
	ForumInfo,
	HomeData,
	TopicList,
	TopicInfo,
	TopicPostPage,
} from '../../server/http/types';

// TODO need to configure this somewhere
const BASE_URL = 'http://localhost:9123';

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

		if (response.status >= 400) {
			throw new Error(`${response.status} ${response.statusText}`);
		}

		const parser = ({
			'text/plain':       () => response.text(),
			'application/json': () => response.json(),
		}[response.headers.get('Content-type') ?? '']);

		return await parser?.();
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

	static async getLatestTopic(forumId: number): Promise<TopicInfo> {
		return await Client.request(`/topic/latest/${forumId}`);
	}

	static async getPosts(topicId: number, start?: number): Promise<TopicPostPage> {
		return await Client.request(`/topic/${topicId}/posts`, {
			start: start ? `${start}` : '',
		});
	}

	static async getTopic(topicId: number): Promise<TopicInfo> {
		return await Client.request(`/topic/${topicId}`);
	}

	static async getTopics(forumId: number, start?: number): Promise<TopicList> {
		return await Client.request(`/forum/${forumId}/topics`, {
			start: start ? `${start}` : '',
		});
	}
}
