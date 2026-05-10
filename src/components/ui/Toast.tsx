'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface Toast {
  id: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  icon?: string
}

interface ToastContextValue {
  toast: (message: string, options?: { type?: Toast['type']; icon?: string }) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, options?: { type?: Toast['type']; icon?: string }) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type: options?.type ?? 'success', icon: options?.icon }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type ?? ''}`}>
            {t.icon && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
