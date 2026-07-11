'use client';

import React from 'react';
import Modal from './modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-6">
        <div className="flex items-start space-x-3.5">
          {isDangerous && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition cursor-pointer disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-500 shadow-red-500/15'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/15'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
