"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Info, AlertOctagon, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <AlertOctagon className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case "info":
      default:
        return <Info className="w-6 h-6 text-brand-primary" />;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/10";
      case "warning":
        return "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/10";
      case "info":
      default:
        return "bg-brand-primary hover:bg-brand-primary/90 text-brand-btn-text shadow-lg shadow-indigo-500/10";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-bg-card border border-border-card rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 transform scale-100 transition-all duration-300 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-text-muted hover:text-text-title hover:bg-bg-accent transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-xl bg-bg-accent border border-border-accent shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 space-y-1.5">
            <h3 className="font-extrabold text-text-title text-base tracking-tight">{title}</h3>
            <p className="text-text-muted text-xs leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-text-body bg-bg-input border border-border-input hover:bg-bg-accent rounded-xl transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${getConfirmButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
