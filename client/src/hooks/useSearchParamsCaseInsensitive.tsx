import { useSearchParams } from 'react-router-dom';

/** Like {@link URLSearchParams} except keys are case-insensitive. */
class CaselessURLSearchParams extends URLSearchParams {
	constructor(params: URLSearchParams) {
		super();

		Array.from(params.entries()).forEach(
			([key, value]) => this.set(key, value)
		);
	}

	append(name: string, value: string): void {
		super.append(name.toLowerCase(), value);
	}

	delete(name: string): void {
		super.delete(name.toLowerCase());
	}

	get(name: string): string | null {
		return super.get(name.toLowerCase());
	}

	// Our own helper, since this is such a common operation.
	getInt(name: string): number | null {
		const value = super.get(name.toLowerCase());
		return value ? Number.parseInt(value) : null;
	}

	getAll(name: string): string[] {
		return super.getAll(name.toLowerCase());
	}

	has(name: string): boolean {
		return super.has(name.toLowerCase());
	}

	set(name: string, value: string): void {
		super.set(name.toLowerCase(), value);
	}
}

/**
 * A limited version of {@link useSearchParams} that uses
 * case-insensitive parameter names.
 */
export default function useCaselessSearchParams(): [CaselessURLSearchParams] {
	const [params] = useSearchParams();
	return [new CaselessURLSearchParams(params)];
}
