import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSearchParams } from 'react-router-dom';

export function StepUpTrigger() {
  const { loginWithRedirect, isLoading } = useAuth0();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    if (!isLoading && jobId) {
      loginWithRedirect({
        appState: { stepUp: true, jobId, returnTo: '/' },
        authorizationParams: {
          acr_values: 'http://schemas.openid.net/pape/policies/2007/06/multi-factor',
        },
      });
    }
  }, [isLoading, jobId, loginWithRedirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-text-muted">Initiating secure verification...</p>
      </div>
    </div>
  );
}
