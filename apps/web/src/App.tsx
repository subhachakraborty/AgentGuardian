import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { setTokenGetter, apiClient } from './api/client';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Permissions } from './pages/Permissions';
import { Connections } from './pages/Connections';
import { AuditLog } from './pages/AuditLog';
import { Callback } from './pages/Callback';
import { StepUpTrigger } from './pages/StepUpTrigger';
import { StepUpComplete } from './pages/StepUpComplete';
import { Shield, ArrowRight } from 'lucide-react';

function ProtectedLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/audit" element={<AuditLog />} />
        </Routes>
      </main>
    </div>
  );
}

function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen gradient-brand flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mx-auto mb-6 flex items-center justify-center shadow-2xl border border-white/20">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Agent Guardian</h1>
          <p className="text-white/60 mt-3 text-lg">A Trust Layer for AI Agents</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Welcome back</h2>
          <p className="text-text-muted text-sm mb-6">
            Sign in to manage your AI agent's permissions, approve pending actions,
            and review the complete audit trail.
          </p>

          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-brand text-white py-3 px-6 rounded-xl font-semibold text-sm
                       hover:bg-brand-light transition-all duration-200 shadow-lg hover:shadow-xl
                       flex items-center justify-center gap-2 group"
          >
            Sign In with Auth0
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text-muted text-center">
              Secured by Auth0 · Token Vault · MFA
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { emoji: '🟢', label: 'Auto Execute', desc: 'Safe actions run silently' },
            { emoji: '🟡', label: 'Nudge Approve', desc: '60s veto window' },
            { emoji: '🔴', label: 'Step-Up MFA', desc: 'High-risk requires MFA' },
          ].map(({ emoji, label, desc }) => (
            <div key={label} className="text-center">
              <div className="text-2xl mb-2">{emoji}</div>
              <p className="text-white text-xs font-semibold">{label}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  // Set up the API client's token getter, then immediately seed the user in the DB
  useEffect(() => {
    if (isAuthenticated) {
      setTokenGetter(getAccessTokenSilently);
      // Call /auth/me to find-or-create the user record in our DB.
      // Without this, routes like /connections return 404 "User not found"
      // because the user row only gets created when /auth/me is hit.
      apiClient.get('/auth/me').catch((err) => {
        console.warn('Failed to seed user profile:', err?.response?.data ?? err.message);
      });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading Agent Guardian...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/callback" element={<Callback />} />
      <Route path="/step-up" element={<StepUpTrigger />} />
      <Route path="/step-up-complete" element={<StepUpComplete />} />
      {isAuthenticated ? (
        <Route path="/*" element={<ProtectedLayout />} />
      ) : (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}
