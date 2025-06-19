import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CreditCard, Plus, Search, DollarSign, Calendar, User, TrendingUp } from 'lucide-react'

// Enable Partial Prerendering for this page
export const experimental_ppr = true

// Static header component
function PaymentsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground">
          Track payments, invoices, and financial transactions
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-10 w-64"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>
    </div>
  )
}

// Simulate fetching payments data
async function getPayments() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1100))
  
  return [
    {
      id: 1,
      patient: 'John Doe',
      treatment: 'Facial Rejuvenation',
      amount: 1200,
      status: 'completed',
      method: 'Credit Card',
      date: '2024-01-15',
      transactionId: 'TXN-001234',
      invoice: 'INV-2024-001'
    },
    {
      id: 2,
      patient: 'Jane Wilson',
      treatment: 'Botox Treatment',
      amount: 450,
      status: 'completed',
      method: 'Debit Card',
      date: '2024-01-14',
      transactionId: 'TXN-001235',
      invoice: 'INV-2024-002'
    },
    {
      id: 3,
      patient: 'Michael Brown',
      treatment: 'Laser Hair Removal',
      amount: 800,
      status: 'pending',
      method: 'Bank Transfer',
      date: '2024-01-13',
      transactionId: 'TXN-001236',
      invoice: 'INV-2024-003'
    },
    {
      id: 4,
      patient: 'Sarah Davis',
      treatment: 'Chemical Peel',
      amount: 600,
      status: 'failed',
      method: 'Credit Card',
      date: '2024-01-12',
      transactionId: 'TXN-001237',
      invoice: 'INV-2024-004'
    },
    {
      id: 5,
      patient: 'Robert Wilson',
      treatment: 'Microneedling',
      amount: 900,
      status: 'completed',
      method: 'Cash',
      date: '2024-01-11',
      transactionId: 'TXN-001238',
      invoice: 'INV-2024-005'
    },
    {
      id: 6,
      patient: 'Emily Johnson',
      treatment: 'Consultation',
      amount: 150,
      status: 'refunded',
      method: 'Credit Card',
      date: '2024-01-10',
      transactionId: 'TXN-001239',
      invoice: 'INV-2024-006'
    }
  ]
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'refunded':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getMethodIcon(method: string) {
  switch (method) {
    case 'Credit Card':
    case 'Debit Card':
      return CreditCard
    case 'Bank Transfer':
      return DollarSign
    case 'Cash':
      return DollarSign
    default:
      return CreditCard
  }
}

async function PaymentsList() {
  const payments = await getPayments()

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const MethodIcon = getMethodIcon(payment.method)
        
        return (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <MethodIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{payment.patient}</h3>
                    <p className="text-sm text-muted-foreground">
                      {payment.treatment}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.invoice} • {payment.transactionId}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {payment.date}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.method}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${payment.amount.toLocaleString()}
                    </p>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    {payment.status === 'pending' && (
                      <Button size="sm">
                        Process
                      </Button>
                    )}
                    {payment.status === 'failed' && (
                      <Button size="sm">
                        Retry
                      </Button>
                    )}
                    {payment.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      {/* Static Header - Prerendered */}
      <PaymentsHeader />
      
      {/* Financial Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-green-600">+15% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,450</div>
            <p className="text-xs text-green-600">+22% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">$1,200</div>
            <p className="text-xs text-muted-foreground">3 transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.5%</div>
            <p className="text-xs text-green-600">+1.2% improvement</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment Methods Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Credit/Debit Cards</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">65%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Cash</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">25%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Bank Transfer</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">10%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  <span className="text-sm">John Doe - $1,200</span>
                </div>
                <span className="text-xs text-muted-foreground">2 min ago</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  <span className="text-sm">Jane Wilson - $450</span>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                  <span className="text-sm">Michael Brown - $800</span>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full" />
                  <span className="text-sm">Sarah Davis - $600</span>
                </div>
                <span className="text-xs text-muted-foreground">3 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dynamic Payments List - Streamed */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PaymentsSkeleton />}>
            <PaymentsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
