import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import EntryPage from "./components/EntryPage.jsx";
import ViewerPage from './pages/ViewerPage.jsx'
import Shell from './components/Shell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SignIn from './pages/SignIn.jsx'
import ProtectedEntry from './components/ProtectedEntry.jsx'

export default function App() {
  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-semibold tracking-wide shadow-md transition-all duration-300 
    ${isActive 
      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white scale-105 shadow-lg'
      : 'bg-white/10 text-gray-200 hover:bg-white/20 hover:text-white'}`

  return (
    <BrowserRouter>
      <Shell>
        {/* Navbar */}
        <nav className="flex gap-4 p-4 justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-lg">
          <NavLink to="/" end className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/entry/form" className={navLinkClasses}>
            Entry
          </NavLink>
          <NavLink to="/viewer" className={navLinkClasses}>
            Viewer
          </NavLink>
        </nav>

        {/* Pages */}
        <div className="p-6 mt-6 bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/signin" element={<SignIn />} />

            {/* Protected entry routes */}
            <Route path="/entry" element={<ProtectedEntry /> }>
              <Route index element={<Dashboard />} />
              <Route path="form" element={<EntryPage />} />
            </Route>

            <Route path="/viewer" element={<ViewerPage />} />
          </Routes>
        </div>
      </Shell>
    </BrowserRouter>
  )
}
