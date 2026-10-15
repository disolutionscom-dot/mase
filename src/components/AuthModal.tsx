import React, { useState } from 'react';
import { Lock, ShieldCheck, X, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  mode: 'admin' | 'viewer';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onSubmit(password);
    if (!success) {
      setError(true);
    } else {
      setError(false);
      setPassword('');
      onClose();
    }
  };

  const title = mode === 'admin' ? 'Administrator Authentication' : 'Live Dashboard Access';
  const defaultHint = mode === 'admin' ? 'admin123' : 'mase2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8E4]">
          <div className="flex items-center gap-2 text-[#0A3D2C] font-bold text-sm">
            <Lock className="w-4 h-4 text-[#0B6E4F]" />
            <span>{title}</span>
          </div>
          <button
            onClick={() => {
              setError(false);
              setPassword('');
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Enter Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-[#F4F7F5] border border-[#CBD7D0] focus:border-[#0B6E4F] rounded-xl outline-none"
              autoFocus
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Default password: <code className="font-mono text-gray-600 bg-gray-100 px-1 py-0.5 rounded">{defaultHint}</code>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Incorrect password. Please try again.</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              className="flex-1 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
