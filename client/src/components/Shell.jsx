import React from "react";
import { useNavigate } from 'react-router-dom'

export default function Shell({ children }) {
  const navigate = useNavigate()
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken')

  const onSignOut = () => {
    try { localStorage.removeItem('authToken') } catch {}
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200/60 dark:border-gray-800 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight">
            400KVShankarpally — Equipment Nameplate Details Manager
          </h1>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs sm:text-sm opacity-80">400KV • 220KV • ICTs</span>
            {hasToken && (
              <button
                onClick={onSignOut}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 shadow-md hover:shadow-lg transition"
                title="Sign out"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-3 sm:px-4 pb-8 sm:pb-10 pt-4 sm:pt-6 text-xs sm:text-sm opacity-70">
        Built with ♥ for operations & maintenance
      </footer>
    </div>
  );
}
