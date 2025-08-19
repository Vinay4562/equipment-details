import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="relative overflow-hidden animate-fadeIn">
      {/* Background decorative gradients */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          Welcome to Equipment Nameplate Manager
        </h2>
        <p className="max-w-2xl mx-auto text-base sm:text-lg opacity-80">
          Capture and browse equipment nameplate details for 400KV, 220KV and ICTs with a smooth, modern experience.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          to="/entry/form"
          className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-0.5"
        >
          Enter Nameplate Details
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
        <Link
          to="/viewer"
          className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold bg-white/10 text-gray-100 border border-white/15 hover:bg-white/20 hover:text-white transition-transform transform hover:-translate-y-0.5"
        >
          View Nameplate Details
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </div>
  )
}