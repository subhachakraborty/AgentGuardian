import { useActivityStore } from '../../stores/activityStore';
import { useAuth0 } from '@auth0/auth0-react';
import { ShieldAlert, X, Fingerprint } from 'lucide-react';

export function StepUpModal() {
  const { stepUpModal, hideStepUpModal } = useActivityStore();

  if (!stepUpModal) return null;

  const { loginWithRedirect } = useAuth0();

  const handleMFA = () => {
    loginWithRedirect({
      appState: { stepUp: true, jobId: stepUpModal.jobId },
      authorizationParams: {
        acr_values: 'http://schemas.openid.net/pape/policies/2007/06/multi-factor'
      }
    });
  };

  const handleCancel = () => {
    // TODO: Call deny endpoint for the pending action
    hideStepUpModal();
  };

  return (
    <div className="stepup-overlay" onClick={handleCancel}>
      <div className="stepup-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Verification Required</h2>
              <p className="text-sm text-text-muted">High-risk action detected</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
          <p className="text-sm text-red-800">
            This action requires Multi-Factor Authentication. Complete verification to authorize the agent to proceed.
          </p>
        </div>

        {/* MFA Button */}
        <div className="space-y-3">
          <button onClick={handleMFA} className="w-full btn bg-red-600 text-white hover:bg-red-700 py-3 text-base">
            <Fingerprint className="w-5 h-5" />
            Complete Verification
          </button>

          <button onClick={handleCancel} className="w-full btn-ghost py-3 text-red-600 hover:text-red-700">
            Cancel — Deny This Action
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-text-muted text-center mt-4">
          The agent will wait until MFA is completed or this action is cancelled.
        </p>
      </div>
    </div>
  );
}
