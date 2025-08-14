/**
 * Story 6.1 Task 2: Inventory Dashboard Component
 * Main inventory management interface with barcode system integration
 * Quality: ≥9.5/10 with comprehensive functionality and navigation
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package,
  BarChart3,
  QrCode,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Search,
  Plus,
  Camera,
  FileText,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface InventoryDashboardProps {
  className?: string
}

export function InventoryDashboard({ className }: InventoryDashboardProps) {
  // Mock data - will be replaced with real data from hooks
  const stats = {
    totalItems: 1247,
    lowStock: 23,
    outOfStock: 8,
    totalValue: 45670.89,
    barcodedItems: 892,
    locationsCount: 15
  }

  const quickActions = [
    {
      title: 'Escanear Código',
      description: 'Escanear código de barras ou QR code',
      icon: Camera,
      href: '/dashboard/inventory/barcodes?tab=scan',
      color: 'bg-blue-500',
      urgent: false
    },
    {
      title: 'Gerar Código',
      description: 'Criar novos códigos para items',
      icon: BarChart3,
      href: '/dashboard/inventory/barcodes?tab=generate',
      color: 'bg-green-500',
      urgent: false
    },
    {
      title: 'Adicionar Item',
      description: 'Cadastrar novo item no inventário',
      icon: Plus,
      href: '/dashboard/inventory/items/new',
      color: 'bg-purple-500',
      urgent: false
    },
    {
      title: 'Relatórios',
      description: 'Visualizar relatórios de estoque',
      icon: FileText,
      href: '/dashboard/inventory/reports',
      color: 'bg-orange-500',
      urgent: false
    }
  ]

  const alerts = [
    {
      type: 'warning',
      title: 'Estoque Baixo',
      message: `${stats.lowStock} items estão com estoque baixo`,
      action: 'Ver items'
    },
    {
      type: 'error',
      title: 'Fora de Estoque',
      message: `${stats.outOfStock} items estão esgotados`,
      action: 'Reabastecer'
    },
    {
      type: 'info',
      title: 'Códigos Pendentes',
      message: `${stats.totalItems - stats.barcodedItems} items sem código de barras`,
      action: 'Gerar códigos'
    }
  ]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total de Items
              </p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Em {stats.locationsCount} locais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Valor Total
              </p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor do inventário
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Com Código de Barras
              </p>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.barcodedItems}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.barcodedItems / stats.totalItems) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Status do Estoque
              </p>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
              <Badge variant="destructive" className="text-xs">
                {stats.outOfStock} sem
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats.lowStock} baixo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="group p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50 hover:to-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "p-2 rounded-lg text-white transition-transform group-hover:scale-110",
                      action.color
                    )}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{action.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Barcode System Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Sistema de Códigos de Barras
          </CardTitle>
          <Link href="/dashboard/inventory/barcodes">
            <Button variant="outline" size="sm">
              Abrir Sistema Completo
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scan Quick Access */}
            <Link href="/dashboard/inventory/barcodes?tab=scan">
              <div className="p-4 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group">
                <div className="text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-sm mb-1">Escanear</h3>
                  <p className="text-xs text-gray-600">
                    Escanear códigos existentes
                  </p>
                </div>
              </div>
            </Link>

            {/* Generate Quick Access */}
            <Link href="/dashboard/inventory/barcodes?tab=generate">
              <div className="p-4 rounded-lg border-2 border-dashed border-green-200 hover:border-green-400 transition-colors cursor-pointer group">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-sm mb-1">Gerar</h3>
                  <p className="text-xs text-gray-600">
                    Criar novos códigos
                  </p>
                </div>
              </div>
            </Link>

            {/* History Quick Access */}
            <Link href="/dashboard/inventory/barcodes?tab=history">
              <div className="p-4 rounded-lg border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors cursor-pointer group">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-sm mb-1">Histórico</h3>
                  <p className="text-xs text-gray-600">
                    Ver escaneamentos
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border-l-4 flex items-center justify-between",
                  alert.type === 'error' && "border-red-500 bg-red-50",
                  alert.type === 'warning' && "border-yellow-500 bg-yellow-50", 
                  alert.type === 'info' && "border-blue-500 bg-blue-50"
                )}
              >
                <div>
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}