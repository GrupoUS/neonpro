'use client';

import { useState } from 'react';
import { useRegulatoryDocuments } from '@/hooks/use-regulatory-documents';

export function RegulatoryDocumentsList() {
  const { documents, loading, error, deleteDocument } =
    useRegulatoryDocuments();
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('expiration_date');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Show loading skeleton
  if (loading) {
    return (
      <div data-testid="loading-skeleton" className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-6 w-3/4 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-6 w-1/2 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-6 w-5/6 rounded"></div>
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
        doc.category.toLowerCase().includes(filter.toLowerCase())
      )
    : documents;

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'expiration_date') {
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
      setDocumentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters and sorting */}
      <div className="flex gap-4">
        <select
          data-testid="category-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          <option value="ANVISA">ANVISA</option>
          <option value="CFM">CFM</option>
          <option value="CRM">CRM</option>
        </select>

        <select
          data-testid="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="expiration_date">Sort by Expiration</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      {/* Documents list */}
      <div className="space-y-4">
        {sortedDocuments.map((document) => (
          <div
            key={document.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 data-testid="document-title" className="font-semibold text-lg">{document.title}</h3>
                <p className="text-gray-600">Category: {document.category}</p>
                <p className="text-gray-600">Type: {document.type}</p>
                <p className="text-gray-600">
                  Expires: {document.expiration_date}
                </p>
              </div>
              <button
                data-testid="delete-document-button"
                onClick={() => handleDelete(document.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                data-testid="confirm-delete-button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
