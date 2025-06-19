import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  trend: 'up' | 'down' | 'neutral'
}

export function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn(
          "text-xs",
          trend === 'up' && "text-green-600",
          trend === 'down' && "text-red-600",
          trend === 'neutral' && "text-muted-foreground"
        )}>
          {change}
        </p>
      </CardContent>
    </Card>
  )
}
