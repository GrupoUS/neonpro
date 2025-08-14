'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { PatientConsent } from '@/app/types/compliance'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'

interface ConsentWithdrawalManagerProps {
  patientId?: string
  clinicId: string
}

export default function ConsentWithdrawalManager({ patientId, clinicId }: ConsentWithdrawalManagerProps) {
  const [consents, setConsents] = useState<PatientConsent[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [withdrawalReason, setWithdrawalReason] = useState('')
  const [selectedConsentType, setSelectedConsentType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('active')
  
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchPatientConsents()
  }, [patientId, clinicId, selectedConsentType, selectedStatus])

  const fetchPatientConsents = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('patient_consent')
        .select(`
          *,
          consent_forms (
            id,
            title,
            version,
            form_type
          ),
          patients (
            id,
            full_name
          )
        `)
        .eq('clinic_id', clinicId)

      if (patientId) {
        query = query.eq('patient_id', patientId)
      }

      if (selectedConsentType !== 'all') {
        query = query.eq('consent_type', selectedConsentType)
      }

      if (selectedStatus === 'active') {
        query = query.in('status', ['active', 'pending'])
      } else if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching consents:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch patient consents',
          variant: 'destructive'
        })
        return
      }

      setConsents(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawConsent = async (consentId: string) => {
    if (!withdrawalReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for withdrawal',
        variant: 'destructive'
      })
      return
    }

    try {
      setWithdrawing(consentId)

      const { data, error } = await supabase
        .from('patient_consent')
        .update({
          status: 'revoked',
          withdrawal_date: new Date().toISOString(),
          withdrawal_reason: withdrawalReason.trim()
        })
        .eq('id', consentId)
        .select()

      if (error) {
        console.error('Error withdrawing consent:', error)
        toast({
          title: 'Error',
          description: 'Failed to withdraw consent',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Consent has been successfully withdrawn',
        variant: 'default'
      })

      // Refresh the list
      await fetchPatientConsents()
      setWithdrawalReason('')
      setWithdrawing(null)
      
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setWithdrawing(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'withdrawn':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      withdrawn: 'destructive',
      expired: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canWithdraw = (consent: PatientConsent) => {
    return consent.status === 'active' || consent.status === 'pending'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Consent Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Patient Consent Withdrawal Management
          </CardTitle>
          <CardDescription>
            Manage consent withdrawals and modifications for compliance with LGPD and patient rights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="consent-type">Consent Type</Label>
              <Select value={selectedConsentType} onValueChange={setSelectedConsentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consent type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="data_processing">Data Processing</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active (Signed/Pending)</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {consents.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No consents found matching the selected criteria.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Consent Type</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Consent Date</TableHead>
                  <TableHead>Withdrawal Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {consent.patient?.full_name || 'Unknown Patient'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {consent.consent_type?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{consent.consent_form?.form_name}</div>
                        <div className="text-sm text-muted-foreground">
                          v{consent.consent_form?.form_version}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(consent.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(consent.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {consent.withdrawal_date ? (
                        <div>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(consent.withdrawal_date)}
                          </div>
                          {consent.withdrawal_reason && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {consent.withdrawal_reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {canWithdraw(consent) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <XCircle className="h-4 w-4 mr-1" />
                              Withdraw
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Withdraw Consent</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to withdraw this consent? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reason">Reason for Withdrawal (Required)</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="Please provide a reason for withdrawing this consent..."
                                  value={withdrawalReason}
                                  onChange={(e) => setWithdrawalReason(e.target.value)}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setWithdrawalReason('')
                                  setWithdrawing(null)
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleWithdrawConsent(consent.id)}
                                disabled={withdrawing === consent.id || !withdrawalReason.trim()}
                              >
                                {withdrawing === consent.id ? 'Withdrawing...' : 'Withdraw Consent'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}