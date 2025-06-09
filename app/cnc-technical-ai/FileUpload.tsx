import { useDropzone } from "react-dropzone";
import { useAuth } from "@clerk/nextjs";

const FileUpload = ({ uploadEndpoint }) => {
	const { getToken } = useAuth(); // Clerk: getToken for authenticated API requests

	// Handles file upload to the backend API using the provided endpoint.
	const handleUpload = async (file) => {
		const formData = new FormData();
		formData.append("file", file);

		try {
			const jwt = await getToken();
			const response = await fetch(uploadEndpoint, {
				method: "POST",
				body: formData,
				headers: {
					...(jwt ? { Authorization: `Bearer ${jwt}` } : {}), // Add Clerk JWT if available
				},
			});

			if (response.ok) {
				alert("File uploaded successfully.");
			} else {
				alert("Failed to upload file.");
			}
		} catch (error) {
			console.error("Error uploading file", error);
		}
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => handleUpload(acceptedFiles[0]),
	});

	return (
		<div
			{...getRootProps()}
			style={{
				border: "1px dashed #218838",
				padding: "1rem",
				cursor: "pointer",
			}}
		>
			<input {...getInputProps()} />
			<p>
				This uploader is for bulk adding QA pairs to the Pinecone DB. Please
				upload a CSV file.
			</p>
			<p>Drag and drop a file here, or click to select a file</p>
		</div>
	);
};

export default FileUpload;
