import { Brain } from 'lucide-react';
import Index from './pages/Index';

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const _navItems = [
  {
    title: 'Home',
    to: '/',
    icon: <HomeIcon className='h-4 w-4' />,
    page: <Index />,
  },
  {
    title: 'AI Chat',
    to: '/ai-chat',
    icon: <MessageSquare className='h-4 w-4' />,
  },
  {
    title: 'AI Demo',
    to: '/ai-chat-demo',
    icon: <Brain className='h-4 w-4' />,
  },
  {
    title: 'Assinatura',
    to: '/subscription',
    icon: <Crown className='h-4 w-4' />,
  },
];
