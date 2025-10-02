import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

export interface EmergencyAlertProps {
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

export function EmergencyAlert(
  { title, description, variant = 'destructive' }: EmergencyAlertProps,
) {
  return (
    <Alert variant={variant}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
