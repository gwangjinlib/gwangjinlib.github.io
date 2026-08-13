import React, { useState } from 'react';
import { Lock, X, AlertTriangle } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  isDanger?: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  title,
  description = '작성 시 입력한 비밀번호를 입력해주세요.',
  confirmLabel = '확인',
  isDanger = false,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onConfirm(password);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 overflow-hidden transform transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-700'}`}>
              {isDanger ? <AlertTriangle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={() => {
              setPassword('');
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-sm text-slate-600">{description}</p>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPassword('');
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-all ${
                isDanger
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
