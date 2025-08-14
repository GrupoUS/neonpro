'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Target, Zap, Calendar, DollarSign, Star, Eye } from "lucide-react"

// Mock data para analytics
const performanceData = [
  { month: 'Jan', accuracy: 85, engagement: 78, conversions: 12 },
  { month: 'Fev', accuracy: 87, engagement: 82, conversions: 15 },
  { month: 'Mar', accuracy: 89, engagement: 85, conversions: 18 },
  { month: 'Abr', accuracy: 91, engagement: 88, conversions: 22 },
  { month: 'Mai', accuracy: 93, engagement: 91, conversions: 25 },
  { month: 'Jun', accuracy: 95, engagement: 94, conversions: 28 }
]

const segmentPerformance = [
  { segment: 'Cliente Premium', recommendations: 145, clicks: 128, conversions: 35, revenue: 85000 },
  { segment: 'Cliente Jovem', recommendations: 230, clicks: 195, conversions: 48, revenue: 32000 },
  { segment: 'Cliente Executiva', recommendations: 88, clicks: 76, conversions: 22, revenue: 45000 },
  { segment: 'Cliente VIP', recommendations: 67, clicks: 61, conversions: 18, revenue: 67000 }
]

const treatmentRecommendations = [
  { name: 'Botox', value: 35, color: '#8884d8' },
  { name: 'Harmonização', value: 28, color: '#82ca9d' },
  { name: 'Peeling', value: 18, color: '#ffc658' },
  { name: 'Limpeza', value: 12, color: '#ff7300' },
  { name: 'Outros', value: 7, color: '#8dd1e1' }
]

interface MetricCardProps {
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

function MetricCard({ title, value, change, changeType, icon }: MetricCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : 
                     changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${changeColor}`}>
          {change} vs. mês anterior
        </p>
      </CardContent>
    </Card>
  )
}

export default function PersonalizationAnalytics() {
  const [timeRange, setTimeRange] = useState('6m')
  const [selectedSegment, setSelectedSegment] = useState('all')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Personalização</h2>
          <p className="text-muted-foreground">
            Análise de performance e efetividade das recomendações personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Segmentos</SelectItem>
              <SelectItem value="premium">Cliente Premium</SelectItem>
              <SelectItem value="young">Cliente Jovem</SelectItem>
              <SelectItem value="executive">Cliente Executiva</SelectItem>
              <SelectItem value="vip">Cliente VIP</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Mês</SelectItem>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="1y">1 Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Taxa de Precisão"
          value="95%"
          change="+2.3%"
          changeType="positive"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Taxa de Engajamento"
          value="94%"
          change="+3.1%"
          changeType="positive"
          icon={<Zap className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Conversões"
          value="28"
          change="+12.5%"
          changeType="positive"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Receita Gerada"
          value="R$ 229k"
          change="+18.7%"
          changeType="positive"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="treatments">Tratamentos</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Performance</CardTitle>
              <CardDescription>
                Acompanhe a evolução das métricas de personalização ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Precisão (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Engajamento (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    name="Conversões"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Cliques por Segmento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentPerformance.map((segment) => {
                    const clickRate = (segment.clicks / segment.recommendations * 100).toFixed(1)
                    return (
                      <div key={segment.segment} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{segment.segment}</span>
                          <span>{clickRate}%</span>
                        </div>
                        <Progress value={parseFloat(clickRate)} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI por Segmento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentPerformance.map((segment) => {
                    const roi = (segment.revenue / (segment.recommendations * 10)).toFixed(1) // Assumindo custo de R$10 por recomendação
                    return (
                      <div key={segment.segment} className="flex justify-between items-center">
                        <span className="text-sm">{segment.segment}</span>
                        <div className="text-right">
                          <div className="font-bold">{roi}x</div>
                          <div className="text-xs text-muted-foreground">
                            R$ {(segment.revenue / 1000).toFixed(0)}k
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Segmento</CardTitle>
              <CardDescription>
                Análise detalhada da performance de cada segmento de cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="recommendations" fill="#8884d8" name="Recomendações" />
                  <Bar dataKey="clicks" fill="#82ca9d" name="Cliques" />
                  <Bar dataKey="conversions" fill="#ffc658" name="Conversões" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {segmentPerformance.map((segment) => (
              <Card key={segment.segment}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{segment.segment}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Recomendações:</span>
                    <span className="font-medium">{segment.recommendations}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Cliques:</span>
                    <span className="font-medium">
                      {(segment.clicks / segment.recommendations * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Conversão:</span>
                    <span className="font-medium">
                      {(segment.conversions / segment.clicks * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Receita:</span>
                    <span className="text-green-600">
                      R$ {(segment.revenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="treatments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Recomendações</CardTitle>
                <CardDescription>
                  Tratamentos mais recomendados pelo sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={treatmentRecommendations}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {treatmentRecommendations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Tratamentos</CardTitle>
                <CardDescription>
                  Ranking dos tratamentos mais efetivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentRecommendations.map((treatment, index) => (
                    <div key={treatment.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{treatment.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{treatment.value}%</div>
                        <div className="text-xs text-muted-foreground">
                          das recomendações
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Insights Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                    <Star className="h-4 w-4" />
                    Melhor Performance
                  </div>
                  <p className="text-sm text-blue-700">
                    Cliente Premium tem a maior taxa de conversão (45.7%) e maior ticket médio
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Crescimento
                  </div>
                  <p className="text-sm text-green-700">
                    Recomendações de Botox aumentaram 34% no último trimestre
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 text-orange-800 font-medium mb-1">
                    <Users className="h-4 w-4" />
                    Oportunidade
                  </div>
                  <p className="text-sm text-orange-700">
                    Segmento Jovem tem alta interação mas baixa conversão - potencial para otimização
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações de Ação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Otimizar Segmento Jovem</p>
                    <p className="text-xs text-muted-foreground">
                      Ajustar preços e ofertas para melhorar conversão
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Expandir Ofertas Premium</p>
                    <p className="text-xs text-muted-foreground">
                      Criar mais pacotes para clientes premium
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Promover Harmonização</p>
                    <p className="text-xs text-muted-foreground">
                      Aumentar visibilidade deste tratamento em alta
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">A/B Test Horários</p>
                    <p className="text-xs text-muted-foreground">
                      Testar diferentes horários para cada segmento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}