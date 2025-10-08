import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Cookies from 'js-cookie';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const SessionTimeoutTracker = ({ expiryTime, onLogout }) => {
  const queryClient = useQueryClient();


  const isTokenPresent = () => {
    return !!Cookies.get('token');
  };


  const validateExpiryTime = (expiryTime) => {

    if (!expiryTime) {
      onLogout();
      return null;
    }
    
    try {
      const expiryDate = new Date(expiryTime);
      return isNaN(expiryDate.getTime()) ? null : expiryDate;
    } catch {
      onLogout();
      return null;
    }
  };


  const calculateTimeUntilExpiry = (expiryDate) => {
    const now = new Date();
    return expiryDate - now;
  };


  React.useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      

      const clonedResponse = response.clone();
      
      try {
        const data = await clonedResponse.json();

        if (data?.message === 'Unauthenticated.' && isTokenPresent()) {
          console.log('Authentication error detected in API response, logging out...');
          onLogout();
        }
      } catch (error) {

      }
      
      return response;
    };

 
    return () => {
      window.fetch = originalFetch;
    };
  }, [onLogout]);

 
  React.useEffect(() => {
    const checkCookieChange = () => {
    
      queryClient.invalidateQueries({ queryKey: ['session-validation'] });
    };

 
    const interval = setInterval(checkCookieChange, 1000);

    return () => clearInterval(interval);
  }, [queryClient]);


  const { data: sessionStatus } = useQuery({
    queryKey: ['session-validation', expiryTime],
    queryFn: () => {
  
      if (!isTokenPresent()) {
        return { status: 'no-token', countdown: 0 };
      }


      const expiryDate = validateExpiryTime(expiryTime);
      if (!expiryDate) {
        return { status: 'expired', countdown: 0 };
      }

      const timeUntilExpiry = calculateTimeUntilExpiry(expiryDate);
      const fiveMinutes = 5 * 60 * 1000;


      if (timeUntilExpiry <= 0) {
        onLogout();
        return { status: 'expired', countdown: 0 };
      }


      if (timeUntilExpiry <= fiveMinutes) {
        return { 
          status: 'expiring', 
          countdown: Math.floor(timeUntilExpiry / 1000)
        };
      }


      return { status: 'valid', countdown: null };
    },
    refetchInterval: (query) => {
      const state = query.state.data;
      

      if (state?.status === 'expiring') {
        return 1000;
      }
      

      if (state?.status === 'valid') {
        return 30000;
      }
      

      return false;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });


  React.useEffect(() => {
    if (sessionStatus?.status === 'expired' && isTokenPresent()) {
      onLogout();
    }
  }, [sessionStatus?.status, onLogout]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  if (sessionStatus?.status !== 'expiring' || !isTokenPresent()) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-slide-down">
      <div className="mx-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-300">
          <div 
            className="h-1 bg-red-600 rounded-tl-lg" 
            style={{ 
              width: `${(sessionStatus.countdown / 300) * 100}%`,
              transition: 'width 1s linear'
            }} 
          />
          <div className="p-2">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 rounded-full p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-800 text-sm">
                  Session timeout in{' '}
                  <span className="text-red-600 font-bold font-mono">
                    {formatTime(sessionStatus.countdown)}
                  </span>
                </div>
                <div className="text-gray-600 text-xs mt-1">
                  Save your work to prevent data loss
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutTracker;