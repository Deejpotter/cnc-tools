/**
 * useFileUpload Mock
 * Updated: 01/06/2025
 * Author: Deej Potter
 * Description: Mock implementation of the useFileUpload hook for testing.
 */
export const mockFileInfo = [
	{ name: "test1.pdf", size: 1024, type: "application/pdf" },
	{ name: "test2.docx", size: 2048, type: "application/docx" },
];

// Default mock implementation
const defaultMock = {
	isDragActive: false,
	isLoading: false,
	error: null,
	fileInfo: [],
	handleDrop: jest.fn(async () => {}),
	handleFileSelect: jest.fn(async () => {}),
};

// Create a mock function that can be configured for different test scenarios
export const useFileUploadMock = jest
	.fn()
	.mockImplementation(({ onUpload }) => {
		return {
			...defaultMock,
			handleDrop: jest.fn(async (files) => {
				if (files && files.length > 0 && onUpload) {
					await onUpload("file content", files[0]);
				}
			}),
		};
	});

// Helper to reset the mock between tests
export function resetMock() {
	useFileUploadMock.mockClear();
	defaultMock.handleDrop.mockClear();
	defaultMock.handleFileSelect.mockClear();
}

// Helper to configure the mock for a specific test scenario
export function configureMock(config) {
	useFileUploadMock.mockImplementationOnce(() => ({
		...defaultMock,
		...config,
	}));
}

export default useFileUploadMock;
