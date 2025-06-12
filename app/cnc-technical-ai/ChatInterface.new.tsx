"use client";
import React, {
	useState,
	useEffect,
	useRef,
	Dispatch,
	SetStateAction,
} from "react";
import { useAuth } from "@clerk/nextjs";
import LayoutContainer from "@/components/LayoutContainer";
import { Send, Upload, RotateCcw, MessageSquare, FileText } from "lucide-react";

// Define message type
interface ChatMessage {
	id: string;
	type: "user" | "bot";
	content: string;
	timestamp: Date;
}

/**
 * Modern Bootstrap-based chat interface for CNC Technical AI
 * Redesigned to replace @chatscope/chat-ui-kit-react with better UX
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({
	setShowConversations,
	showConversations,
}) => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
	const { getToken } = useAuth();

	// Chat state
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isTyping, setIsTyping] = useState(false);

	// File upload state
	const [dragActive, setDragActive] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<string | null>(null);

	// Refs for auto-scrolling and file input
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const messageInputRef = useRef<HTMLTextAreaElement>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Create a new message with unique ID
	const createMessage = (
		type: "user" | "bot",
		content: string
	): ChatMessage => ({
		id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
		type,
		content,
		timestamp: new Date(),
	});

	// Handle sending a message
	const handleSendMessage = async () => {
		if (!inputMessage.trim() || isLoading) return;

		const userMessage = createMessage("user", inputMessage.trim());
		setMessages((prev) => [...prev, userMessage]);
		setInputMessage("");
		setIsLoading(true);
		setIsTyping(true);

		try {
			const jwt = await getToken();
			const response = await fetch(`${apiUrl}/api/ai/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
				},
				body: JSON.stringify({
					inputCode: userMessage.content,
					model: "gpt-4o-mini",
				}),
			});

			if (response.ok) {
				// Handle streaming response
				const reader = response.body?.getReader();
				if (reader) {
					let botResponseContent = "";
					const botMessage = createMessage("bot", "");
					setMessages((prev) => [...prev, botMessage]);

					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							const chunk = new TextDecoder().decode(value);
							botResponseContent += chunk;

							// Update the bot message content as we receive chunks
							setMessages((prev) =>
								prev.map((msg) =>
									msg.id === botMessage.id
										? { ...msg, content: botResponseContent }
										: msg
								)
							);
						}
					} finally {
						reader.releaseLock();
					}
				}
			} else {
				const errorMessage = createMessage(
					"bot",
					"Sorry, I encountered an error. Please try again."
				);
				setMessages((prev) => [...prev, errorMessage]);
			}
		} catch (error) {
			console.error("Error sending message:", error);
			const errorMessage = createMessage(
				"bot",
				"Sorry, I couldn't connect to the server. Please try again."
			);
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
			setIsTyping(false);
		}
	};

	// Handle file upload for Q&A pairs
	const handleFileUpload = async (file: File) => {
		if (!file) return;

		setUploadProgress("Uploading file...");
		const formData = new FormData();
		formData.append("file", file);

		try {
			const jwt = await getToken();
			const response = await fetch(`${apiUrl}/upload`, {
				method: "POST",
				body: formData,
				headers: {
					...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
				},
			});

			if (response.ok) {
				setUploadProgress("File uploaded successfully!");
				setTimeout(() => setUploadProgress(null), 3000);
			} else {
				setUploadProgress("Failed to upload file.");
				setTimeout(() => setUploadProgress(null), 3000);
			}
		} catch (error) {
			console.error("Error uploading file:", error);
			setUploadProgress("Upload failed - connection error.");
			setTimeout(() => setUploadProgress(null), 3000);
		}
	};

	// Handle key press in textarea
	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// Handle drag and drop
	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileUpload(files[0]);
		}
	};

	// Clear chat history
	const handleClearChat = () => {
		if (confirm("Are you sure you want to clear the chat history?")) {
			setMessages([]);
		}
	};

	// Reinitialize QA collection
	const handleReinitializeQA = async () => {
		if (
			!confirm(
				"Are you sure you want to reinitialize the Q&A collection? This will reset all uploaded data."
			)
		)
			return;

		try {
			const jwt = await getToken();
			const response = await fetch(`${apiUrl}/reinitialize`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
				},
			});

			if (response.ok) {
				alert("Q&A Collection reinitialized successfully.");
			} else {
				alert("Failed to reinitialize Q&A Collection.");
			}
		} catch (error) {
			console.error("Error reinitializing Q&A Collection:", error);
			alert("Failed to reinitialize Q&A Collection.");
		}
	};

	return (
		<LayoutContainer>
			<div className="container-fluid h-100">
				<div className="row h-100">
					{/* Sidebar for file upload and controls */}
					<div className="col-md-3 bg-light border-end h-100">
						<div className="p-3">
							<h5 className="mb-3">
								<MessageSquare className="me-2" size={20} />
								CNC Technical AI
							</h5>

							{/* File Upload Area */}
							<div
								className={`border-2 border-dashed rounded p-4 text-center mb-3 ${
									dragActive
										? "border-primary bg-primary bg-opacity-10"
										: "border-secondary"
								}`}
								onDragEnter={handleDragEnter}
								onDragOver={(e) => e.preventDefault()}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								style={{ cursor: "pointer" }}
								onClick={() => fileInputRef.current?.click()}
							>
								<Upload className="mx-auto mb-2" size={32} />
								<p className="mb-1">Upload Q&A CSV</p>
								<small className="text-muted">
									Drag & drop or click to select
								</small>
								<input
									ref={fileInputRef}
									type="file"
									accept=".csv"
									onChange={(e) =>
										e.target.files?.[0] && handleFileUpload(e.target.files[0])
									}
									className="d-none"
								/>
							</div>

							{uploadProgress && (
								<div className="alert alert-info small py-2 mb-3">
									{uploadProgress}
								</div>
							)}

							{/* Control Buttons */}
							<div className="d-grid gap-2">
								<button
									className="btn btn-outline-secondary btn-sm"
									onClick={handleClearChat}
									disabled={messages.length === 0}
								>
									<RotateCcw size={16} className="me-2" />
									Clear Chat
								</button>
								<button
									className="btn btn-outline-warning btn-sm"
									onClick={handleReinitializeQA}
								>
									<FileText size={16} className="me-2" />
									Reset Q&A Data
								</button>
							</div>

							<hr />
							<small className="text-muted">
								Upload CSV files to add Q&A pairs to the knowledge base. Use the
								chat to ask CNC-related questions.
							</small>
						</div>
					</div>

					{/* Chat Area */}
					<div className="col-md-9 d-flex flex-column h-100">
						{/* Chat Messages */}
						<div
							className="flex-grow-1 p-3"
							style={{ overflowY: "auto", height: "calc(100vh - 200px)" }}
						>
							{messages.length === 0 ? (
								<div className="text-center text-muted mt-5">
									<MessageSquare size={48} className="mb-3" />
									<h5>Welcome to CNC Technical AI</h5>
									<p>
										Ask me anything about CNC machining, 3D printing, or
										technical questions!
									</p>
								</div>
							) : (
								messages.map((message) => (
									<div
										key={message.id}
										className={`mb-3 d-flex ${
											message.type === "user"
												? "justify-content-end"
												: "justify-content-start"
										}`}
									>
										<div
											className={`p-3 rounded max-w-75 ${
												message.type === "user"
													? "bg-primary text-white"
													: "bg-light border"
											}`}
											style={{ maxWidth: "75%" }}
										>
											<div className="mb-1">{message.content}</div>
											<small
												className={`d-block ${
													message.type === "user"
														? "text-white-50"
														: "text-muted"
												}`}
											>
												{message.timestamp.toLocaleTimeString()}
											</small>
										</div>
									</div>
								))
							)}

							{isTyping && (
								<div className="mb-3 d-flex justify-content-start">
									<div className="bg-light border p-3 rounded">
										<div className="d-flex align-items-center">
											<div
												className="spinner-border spinner-border-sm me-2"
												role="status"
											>
												<span className="visually-hidden">Loading...</span>
											</div>
											AI is typing...
										</div>
									</div>
								</div>
							)}

							<div ref={messagesEndRef} />
						</div>

						{/* Message Input */}
						<div className="border-top p-3">
							<div className="input-group">
								<textarea
									ref={messageInputRef}
									className="form-control"
									placeholder="Type your CNC or technical question here..."
									value={inputMessage}
									onChange={(e) => setInputMessage(e.target.value)}
									onKeyPress={handleKeyPress}
									rows={2}
									disabled={isLoading}
									style={{ resize: "none" }}
								/>
								<button
									className="btn btn-primary"
									onClick={handleSendMessage}
									disabled={!inputMessage.trim() || isLoading}
								>
									{isLoading ? (
										<div
											className="spinner-border spinner-border-sm"
											role="status"
										>
											<span className="visually-hidden">Loading...</span>
										</div>
									) : (
										<Send size={20} />
									)}
								</button>
							</div>
							<small className="text-muted">
								Press Enter to send, Shift+Enter for new line
							</small>
						</div>
					</div>
				</div>
			</div>
		</LayoutContainer>
	);
};

export default ChatInterface;

// Define props interface
export type ChatInterfaceProps = {
	setShowConversations: Dispatch<SetStateAction<boolean>>;
	showConversations: boolean;
};
