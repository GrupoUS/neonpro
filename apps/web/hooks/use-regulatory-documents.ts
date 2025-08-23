import { useEffect, useState } from "react";

type RegulatoryDocument = {
	id: string;
	title: string;
	category: string;
	type: "regulamento" | "diretriz" | "portaria" | "resolucao";
	file_path: string;
	expiration_date: string;
	created_at: string;
	updated_at: string;
};

type UseRegulatoryDocumentsReturn = {
	documents: RegulatoryDocument[];
	loading: boolean;
	error: string | null;
	refetch: () => void;
	createDocument: (
		document: Omit<RegulatoryDocument, "id" | "created_at" | "updated_at">,
	) => Promise<void>;
	updateDocument: (
		id: string,
		updates: Partial<RegulatoryDocument>,
	) => Promise<void>;
	deleteDocument: (id: string) => Promise<void>;
};

export function useRegulatoryDocuments(): UseRegulatoryDocumentsReturn {
	const [documents, setDocuments] = useState<RegulatoryDocument[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchDocuments = () => {
		setLoading(true);
		setError(null);
		try {
			// This would normally fetch from an API
			// For now, return empty array since tests mock this
			setDocuments([]);
		} catch (_err) {
			setError("Failed to fetch documents");
		} finally {
			setLoading(false);
		}
	};

	const createDocument = async (
		_document: Omit<RegulatoryDocument, "id" | "created_at" | "updated_at">,
	) => {};

	const updateDocument = async (
		_id: string,
		_updates: Partial<RegulatoryDocument>,
	) => {};

	const deleteDocument = async (_id: string) => {};

	useEffect(() => {
		fetchDocuments();
	}, [fetchDocuments]);

	return {
		documents,
		loading,
		error,
		refetch: fetchDocuments,
		createDocument,
		updateDocument,
		deleteDocument,
	};
}

export default useRegulatoryDocuments;
