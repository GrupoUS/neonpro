import React from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { RegulatoryDocumentsList } from '@/components/regulatory-documents/regulatory-documents-list'
import { ExpirationAlerts } from '@/components/regulatory-documents/expiration-alerts'

export default function RegulatoryDocumentsPage() {
  const breadcrumbItems = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Regulatory Documents' }
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regulatory Documents</h1>
          <p className="text-muted-foreground">
            Manage compliance documents and certifications for your clinic
          </p>
        </div>

        {/* Expiration Alerts */}
        <ExpirationAlerts />

        {/* Documents List */}
        <RegulatoryDocumentsList />
      </div>
    </div>
  )
}