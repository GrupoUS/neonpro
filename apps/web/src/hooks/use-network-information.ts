import { useEffect, useState } from 'react';

export interface NetworkInformation {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  type: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface UseNetworkInformationReturn {
  networkInfo: NetworkInformation | null;
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export function useNetworkInformation(): UseNetworkInformationReturn {
  const [networkInfo, setNetworkInfo] = useState<NetworkInformation | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(_() => {
    const updateNetworkInfo = () => {
      // Get connection information from navigator
      const connection = (navigator as any).connection
        || (navigator as any).mozConnection
        || (navigator as any).webkitConnection;

      if (connection) {
        const info: NetworkInformation = {
          effectiveType: connection.effectiveType || '4g',
          type: connection.type || 'unknown',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 50,
          saveData: connection.saveData || false,
        };
        setNetworkInfo(info);
      }
    };

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Initial setup
    updateNetworkInfo();
    updateOnlineStatus();

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  // Calculate connection quality based on network info
  const connectionQuality = (_() => {
    if (!networkInfo) return 'poor';

    if (networkInfo.effectiveType === '4g' && networkInfo.rtt < 100) {
      return 'excellent';
    } else if (
      networkInfo.effectiveType === '4g'
      || (networkInfo.effectiveType === '3g' && networkInfo.rtt < 200)
    ) {
      return 'good';
    } else if (networkInfo.effectiveType === '3g' || networkInfo.effectiveType === '2g') {
      return 'fair';
    } else {
      return 'poor';
    }
  })();

  const isSlowConnection = networkInfo
    ? (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g'
      || networkInfo.rtt > 500)
    : true;

  return {
    networkInfo,
    isOnline,
    isSlowConnection,
    connectionQuality,
  };
}
