// Mock implementation of the useFileUpload hook
export const useFileUpload = jest.fn(({ onUpload }) => ({
  isDragActive: false,
  isLoading: false,
  error: null,
  fileInfo: [],
  handleDrop: jest.fn(async (files) => {
    // Mock implementation that simulates file processing
    if (files && files.length > 0) {
      const file = files[0];
      if (onUpload) {
        await onUpload('file content', file);
      }
    }
  }),
  handleFileSelect: jest.fn(),
}));

// Reuse the types from the real implementation
export interface FileValidation {
  maxSize?: number;
  allowedTypes?: string[];
  validateContent?: (content: string) => boolean | Promise<boolean>;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export interface UseFileUploadOptions extends FileValidation {
  onUpload?: (content: string, file: File) => void | Promise<void>;
  multiple?: boolean;
}

export interface UseFileUploadResult {
  isDragActive: boolean;
  isLoading: boolean;
  error: string | null;
  fileInfo: FileInfo[];
  handleDrop: (files: File[]) => Promise<void>;
  handleFileSelect: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
}
