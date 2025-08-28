"use client";

import { useRegulatoryDocuments } from "@/hooks/use-regulatory-documents";
import { useState } from "react";

export function RegulatoryDocumentsList() {
  const { documents, loading, error, deleteDocument } =
    useRegulatoryDocuments();
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("expiration_date");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>();

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-4" data-testid="loading-skeleton">
        <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-5/6 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading documents
        <div>Failed to fetch documents</div>
      </div>
    );
  }

  // Show empty state
  if (!documents || documents.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500" data-testid="empty-state">
        No regulatory documents found
      </div>
    );
  }

  // Filter documents by category
  const filteredDocuments = filter
    ? documents.filter((doc) =>
        doc.category.toLowerCase().includes(filter.toLowerCase()),
      )
    : documents;

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === "expiration_date") {
      return (
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
      );
    }
    return a.title.localeCompare(b.title);
  });

  const handleDelete = async (id: string) => {
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (documentToDelete) {
      await deleteDocument(documentToDelete);
      setDeleteDialogOpen(false);
      setDocumentToDelete(undefined);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Filters and sorting */}
      <div className="flex gap-4">
        <select
          className="rounded border px-3 py-2"
          data-testid="category-filter"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <option value="">All Categories</option>
          <option value="ANVISA">ANVISA</option>
          <option value="CFM">CFM</option>
          <option value="CRM">CRM</option>
        </select>

        <select
          className="rounded border px-3 py-2"
          data-testid="sort-select"
          onChange={(e) => setSortBy(e.target.value)}
          value={sortBy}
        >
          <option value="expiration_date">Sort by Expiration</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      {/* Documents list */}
      <div className="space-y-4">
        {sortedDocuments.map((document) => (
          <div
            className="rounded-lg border bg-white p-4 shadow-sm"
            key={document.id}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="font-semibold text-lg"
                  data-testid="document-title"
                >
                  {document.title}
                </h3>
                <p className="text-gray-600">Category: {document.category}</p>
                <p className="text-gray-600">Type: {document.type}</p>
                <p className="text-gray-600">
                  Expires: {document.expiration_date}
                </p>
              </div>
              <button
                className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                data-testid="delete-document-button"
                onClick={() => handleDelete(document.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 font-semibold text-lg">Confirm Deletion</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                data-testid="confirm-delete-button"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegulatoryDocumentsList;
