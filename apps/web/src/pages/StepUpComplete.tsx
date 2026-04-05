import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { apiClient } from '../api/client';

export function StepUpComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const jobId = searchParams.get('jobId');
  const [error, setError] = useState<string | null>(null);
  const executionStarted = useRef(false);

  useEffect(() => {
    if (!jobId || executionStarted.current) {
      if (!jobId) navigate('/');
      return;
    }
    executionStarted.current = true;

    // We also MUST bypass the cache because the Auth0 SPA SDK cache key doesn't group by acr_values.
    getAccessTokenSilently({
      authorizationParams: {
        acr_values: 'http://schemas.openid.net/pape/policies/2007/06/multi-factor'
      },
      cacheMode: 'off'
    })
    .then(async (token) => {
      const idTokenClaims = await getIdTokenClaims();
      const idTokenStr = idTokenClaims?.__raw || '';
      return apiClient.post(`/agent/action/${jobId}/step-up`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'x-id-token': idTokenStr
        }
      });
    })
    .then(() => {
      navigate('/');
    })
    .catch((err) => {
      setError(err?.response?.data?.message ?? err.message);
    });
  }, [jobId, navigate, getAccessTokenSilently]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="card p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Verification Error</h2>
          <p className="text-text-muted">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-text-muted">Completing verification...</p>
      </div>
    </div>
  );
}
