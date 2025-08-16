import React from "react";

export default function Shell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200/60 dark:border-gray-800 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            400KVShankarpally — Equipment Nameplate Details Manager
          </h1>
          <span className="text-sm opacity-80">400KV • 220KV • ICTs</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 pb-10 pt-6 text-sm opacity-70">
        Built with ♥ for operations & maintenance
      </footer>
    </div>
  );
}
