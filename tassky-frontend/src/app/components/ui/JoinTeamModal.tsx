import { AlertCircle } from 'lucide-react';
import React from 'react';

interface JoinTeamModalProps {
  onClose: () => void;
  onJoinTeam: (inviteCode: string) => void;
}

export default function JoinTeamModal({
  onClose,
  onJoinTeam,
}: JoinTeamModalProps) {
  const [inviteCode, setInviteCode] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inviteCode.trim()) {
      setError('Invite code is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onJoinTeam(inviteCode.trim());
      console.log('results:', result);

      if (result === true) {
        onClose();
      } else {
        // Parent indicated failure without throwing
        setError('Failed to join team. Please try again.');
      }
    } catch (err) {
      // Handle different error types
      let errorMessage = 'Failed to join team. Please check your invite code.';

      if (err?.response?.status === 404) {
        errorMessage = 'Invalid invite code. Please check and try again.';
      } else if (err?.response?.status === 409) {
        errorMessage = 'You are already a member of this team.';
      } else if (err?.response?.status === 403) {
        errorMessage = 'This invite code has expired or is no longer valid.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteCode(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent closing if currently submitting
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={handleBackdropClick}
      ></div>
      <div className="bg-white rounded-lg p-6 w-full max-w-md z-10">
        <h2 className="text-xl font-bold mb-4">Join Team</h2>

        {/* Error Display with Animation */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            error ? 'max-h-20 mb-4 opacity-100' : 'max-h-0 mb-0 opacity-0'
          }`}
        >
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="inviteCode"
              className="block text-gray-700 font-medium mb-2"
            >
              Invite Code*
            </label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-violet-500 focus:ring-violet-200'
              }`}
              placeholder="Enter team invite code"
              disabled={isSubmitting}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Ask your team admin for the invite code
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 disabled:bg-violet-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              disabled={isSubmitting || !inviteCode.trim()}
            >
              {isSubmitting ? 'Joining...' : 'Join Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
