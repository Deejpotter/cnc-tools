// Test utilities for mocking fetch and streaming responses

export function mockFetchStream(chunks: string[]) {
	let callCount = 0;
	return jest.fn(async (url: string, options?: any) => {
		// if it's an upload endpoint, just resolve ok
		if (url?.includes("/upload")) {
			return { ok: true };
		}

		const enc = new TextEncoder();
		const reader = {
			read: async () => {
				if (callCount < chunks.length) {
					const chunkStr = chunks[callCount++];
					return { done: false, value: enc.encode(chunkStr) };
				}
				return { done: true, value: undefined };
			},
			releaseLock: () => {},
		};

		return {
			ok: true,
			body: {
				getReader: () => reader,
			},
		};
	});
}

export function mockFetchOnce(response: any) {
	return jest.fn(async () => response);
}
