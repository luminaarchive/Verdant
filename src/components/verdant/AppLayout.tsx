'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { OnboardingModal } from './OnboardingModal'
import { PaywallModal } from './PaywallModal'

interface AppLayoutContextValue {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const AppLayoutContext = createContext<AppLayoutContextValue>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
})

export function useAppLayout() {
  return useContext(AppLayoutContext)
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AppLayoutContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div
        style={{
          background: 'var(--bg-main)',
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'none',
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 30,
            }}
          />
        )}

        <Sidebar />

        {/* Main content */}
        <div
          className="main-with-sidebar"
          style={{
            marginLeft: 'var(--sidebar-w)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <TopBar />
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {children}
          </main>
        </div>
      </div>
      <OnboardingModal />
      <PaywallModal />
    </AppLayoutContext.Provider>
  )
}
