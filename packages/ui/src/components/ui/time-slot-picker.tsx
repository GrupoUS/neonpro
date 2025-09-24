'use client'

import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

export interface TimeSlotPickerProps {
  value: number // minutes
  onChange: (minutes: number) => void
  min?: number // default 15
  max?: number // default 480
  step?: number // default 15
  placeholder?: string
  id?: string
  'aria-describedby'?: string
}

function labelFor(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

export function TimeSlotPicker({
  value,
  onChange,
  min = 15,
  max = 480,
  step = 15,
  placeholder = 'Selecione a duração',
  id,
  ...rest
}: TimeSlotPickerProps) {
  const options = React.useMemo(() => {
    const out: number[] = []
    for (let v = min; v <= max; v += step) out.push(v)
    return out
  }, [min, max, step])

  return (
    <Select
      value={String(value)}
      onValueChange={v => onChange(parseInt(v, 10))}
    >
      <SelectTrigger id={id} aria-describedby={rest['aria-describedby']}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(v => (
          <SelectItem key={v} value={String(v)}>
            {labelFor(v)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
