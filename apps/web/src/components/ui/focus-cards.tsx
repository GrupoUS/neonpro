import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

// Minimal FocusCards grid for quick actions
export interface FocusCardItem {
  title: string;
  description?: string;
  action?: () => void;
  icon?: React.ReactNode | string;
}

export interface FocusCardsProps {
  cards: FocusCardItem[];
}

export function FocusCards({ cards }: FocusCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((c, i) => (
        <Card
          key={i}
          className='hover:shadow-md transition-shadow cursor-pointer'
          onClick={c.action}
        >
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{c.title}</CardTitle>
            {typeof c.icon === 'string' ? <span aria-hidden>{c.icon}</span> : (
              c.icon
            )}
          </CardHeader>
          {c.description && (
            <CardContent>
              <p className='text-sm text-muted-foreground'>{c.description}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

export default FocusCards;
