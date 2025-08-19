import React, { useState } from 'react'
import FeederPicker from '../components/FeederPicker.jsx'
import NameplateForm from '../components/NameplateForm.jsx'

export default function EntryPage() {
  const [selection, setSelection] = useState({})

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-2xl p-4 border border-gray-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur">
        <h2 className="text-xl font-semibold mb-3">
          Create Equipment Nameplate
        </h2>

        <FeederPicker value={selection} onChange={setSelection} />
        <div className="h-4"></div>

        {selection.feederId ? (
          <div className="animate-slideUp">
            <NameplateForm selection={selection} />
          </div>
        ) : (
          <p className="opacity-70">Select voltage & feeder to continue.</p>
        )}
      </div>
    </div>
  )
}
