import React, { useState } from 'react'
import FeederPicker from '../components/FeederPicker.jsx'
import NameplateForm from '../components/NameplateForm.jsx'

export default function EntryPage() {
  const [selection, setSelection] = useState({})

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h2 className="text-xl font-semibold mb-3">
          Create Equipment Nameplate
        </h2>

        <FeederPicker value={selection} onChange={setSelection} />
        <div className="h-4"></div>

        {selection.feederId ? (
          <NameplateForm selection={selection} />
        ) : (
          <p className="opacity-70">Select voltage & feeder to continue.</p>
        )}
      </div>
    </div>
  )
}
