import { HomeData } from '../../server/http/types';

// TODO need to configure this somewhere
const BASE_URL = 'http://localhost:9123';

export default class Client {

	private static async request<T = unknown>(url: string): Promise<T> {
		const response = await fetch(`${BASE_URL}${url}`);

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
}
