'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Eye, Edit } from 'lucide-react'
import { MarketingCampaign, MarketingROIMetrics } from '@/app/types/marketing-roi'

interface CampaignAnalysisProps {
  campaigns: MarketingCampaign[]
  metrics: MarketingROIMetrics[]
  isLoading?: boolean
  onViewCampaign?: (campaignId: string) => void
  onEditCampaign?: (campaignId: string) => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function CampaignAnalysis({ 
  campaigns, 
  metrics = [], 
  isLoading = false,
  onViewCampaign,
  onEditCampaign
}: CampaignAnalysisProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Prepare data for charts
  const campaignPerformanceData = campaigns.map(campaign => {
    const campaignMetrics = metrics.find(m => m.campaignId === campaign.id)
    return {
      name: campaign.name,
      roi: campaignMetrics?.totalROI || 0,
      revenue: campaignMetrics?.totalRevenue || 0,
      cost: campaignMetrics?.totalCost || 0,
      conversions: campaignMetrics?.totalConversions || 0,
      roas: campaignMetrics?.roas || 0
    }
  })

  const roiComparisonData = campaigns.map((campaign, index) => {
    const campaignMetrics = metrics.find(m => m.campaignId === campaign.id)
    return {
      name: campaign.name,
      roi: campaignMetrics?.totalROI || 0,
      target: campaign.targetROI || 0,
      color: COLORS[index % COLORS.length]
    }
  })

  const budgetAllocationData = campaigns.map((campaign, index) => ({
    name: campaign.name,
    value: campaign.budget,
    color: COLORS[index % COLORS.length]
  }))

  const getROIStatus = (roi: number, target: number) => {
    if (roi >= target * 1.2) return { status: 'excellent', color: 'default' }
    if (roi >= target) return { status: 'good', color: 'default' }
    if (roi >= target * 0.8) return { status: 'warning', color: 'secondary' }
    return { status: 'poor', color: 'destructive' }
  }

  return (
    <div className="space-y-6">
      {/* Campaign Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance das Campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'revenue' || name === 'cost') {
                    return [formatCurrency(value as number), name === 'revenue' ? 'Receita' : 'Custo']
                  }
                  if (name === 'roi' || name === 'roas') {
                    return [formatPercentage(value as number), name === 'roi' ? 'ROI' : 'ROAS']
                  }
                  return [value, name === 'conversions' ? 'Conversões' : name]
                }}
              />
              <Bar yAxisId="left" dataKey="revenue" fill="#00C49F" name="Receita" />
              <Bar yAxisId="left" dataKey="cost" fill="#FF8042" name="Custo" />
              <Bar yAxisId="right" dataKey="roi" fill="#0088FE" name="ROI %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROI vs Target Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>ROI vs Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={roiComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  formatPercentage(value as number), 
                  name === 'roi' ? 'ROI Atual' : 'Meta ROI'
                ]}
              />
              <Line type="monotone" dataKey="roi" stroke="#0088FE" strokeWidth={3} />
              <Line type="monotone" dataKey="target" stroke="#FF8042" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={budgetAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {budgetAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign List */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Campanhas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaigns.map(campaign => {
              const campaignMetrics = metrics.find(m => m.campaignId === campaign.id)
              const roi = campaignMetrics?.totalROI || 0
              const roiStatus = getROIStatus(roi, campaign.targetROI || 0)
              
              return (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status === 'active' ? 'Ativa' : 
                         campaign.status === 'paused' ? 'Pausada' : 'Finalizada'}
                      </Badge>
                      <Badge variant={roiStatus.color}>
                        ROI: {formatPercentage(roi)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      <span>Orçamento: {formatCurrency(campaign.budget)}</span>
                      <span className="mx-2">•</span>
                      <span>Gasto: {formatCurrency(campaignMetrics?.totalCost || 0)}</span>
                      <span className="mx-2">•</span>
                      <span>Conversões: {campaignMetrics?.totalConversions || 0}</span>
                    </div>
                    
                    <Progress 
                      value={((campaignMetrics?.totalCost || 0) / campaign.budget) * 100} 
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {(((campaignMetrics?.totalCost || 0) / campaign.budget) * 100).toFixed(1)}% do orçamento utilizado
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewCampaign?.(campaign.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditCampaign?.(campaign.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}