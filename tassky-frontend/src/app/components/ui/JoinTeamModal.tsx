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

    if (!inviteCode.trim()) {
      setError('Invite code is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onJoinTeam(inviteCode.trim());
    } catch (err) {
      setError('Failed to join team. Please check your invite code.' + err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg p-6 w-full max-w-md z-10">
        <h2 className="text-xl font-bold mb-4">Join Team</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

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
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Enter team invite code"
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
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
