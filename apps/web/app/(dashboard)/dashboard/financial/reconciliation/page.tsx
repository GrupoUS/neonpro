'use client';

// 🏥 Bank Reconciliation Dashboard - Healthcare Financial Management
// Sistema de Reconciliação Bancária - Gestão Financeira para Clínicas

import React from 'react';

export default function BankReconciliationPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Main Dashboard Header */}
      <div data-testid="reconciliation-dashboard" className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Bank Reconciliation Dashboard
        </h1>
        <p className="text-gray-600">
          Healthcare financial reconciliation system for aesthetic clinics
        </p>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <button 
          data-testid="import-statement-button"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Import Bank Statement
        </button>
        
        <div className="mt-4 hidden" data-testid="file-upload-section">
          <input 
            type="file"
            data-testid="file-upload-input"
            accept=".csv,.xlsx"
            className="block w-full text-sm text-gray-500"
          />
          <button 
            data-testid="start-import-button"
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Start Import
          </button>
        </div>

        <div data-testid="import-progress" className="hidden mt-4">
          <div className="bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-full w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div data-testid="reconciliation-summary" className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm text-gray-500">Total Transactions</h3>
          <p data-testid="total-transactions-count" className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm text-gray-500">Matched Transactions</h3>
          <p data-testid="matched-transactions-count" className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm text-gray-500">Unmatched Transactions</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm text-gray-500">Accuracy Rate</h3>
          <p data-testid="accuracy-rate-value" className="text-2xl font-bold">100%</p>
        </div>
      </div>

      {/* Transactions List */}
      <div data-testid="transactions-list" className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Transactions</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-500">No transactions imported yet</p>
        </div>
      </div>

      {/* Matching Algorithms Config */}
      <div data-testid="matching-algorithms-config" className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Matching Configuration</h2>
        <button 
          data-testid="start-matching-button"
          className="bg-purple-600 text-white px-4 py-2 rounded-md"
        >
          Start Matching
        </button>
        <button 
          data-testid="execute-matching-button"
          className="ml-2 bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Execute Matching
        </button>
        <div data-testid="matching-progress" className="hidden mt-4">
          <p>Matching in progress...</p>
        </div>
      </div>
    </div>
  );
}