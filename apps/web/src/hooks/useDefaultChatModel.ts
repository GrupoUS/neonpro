import { useAuth } from '@/hooks/useAuth';
import { fetchDefaultChatModel } from '@/services/chat-settings.service';
import { useEffect, useState } from 'react';

/**
 * Hook to hydrate default chat model from server with localStorage fallback
 */
export function useDefaultChatModel() {
  const { user } = useAuth();
  const [defaultModel, setDefaultModel] = useState<.*>(() => {
    if (typeof window === 'undefined') return 'gpt-5-mini';
    return localStorage.getItem('neonpro-default-chat-model') || 'gpt-5-mini';
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      const serverModel = await fetchDefaultChatModel(user.id);
      if (mounted && serverModel) {
        setDefaultModel(serverModel);
        try {
          localStorage.setItem('neonpro-default-chat-model', serverModel);
        } catch {}
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return { defaultModel, setDefaultModel };
}
