import React, { useEffect, useState } from 'react'
import FeederPicker from '../components/FeederPicker.jsx'
import EquipmentCard from '../components/EquipmentCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { listEquipment, deleteEquipment, api, ENTRY_USERNAME, resolveUploadUrl } from '../api.js'

export default function ViewerPage() {
  const [selection, setSelection] = useState({})
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    (async () => {
      if (!selection.feederId) return
      const res = await listEquipment({
        feederId: selection.feederId,
        equipmentType: selection.equipmentType,
        q
      })
      setItems(res.data.items)
    })()
  }, [selection, q])

  const handleDelete = (deletedId) => {
    setItems(prev => prev.filter(item => item._id !== deletedId))
    if (selectedItem && selectedItem._id === deletedId) {
      setSelectedItem(null)
    }
  }

  const ensureAuth = async () => {
    const token = localStorage.getItem('authToken')
    if (token) return true
    const pwd = prompt('Enter sign-in password to proceed:')
    if (!pwd) return false
    try {
      const res = await api.post('/auth/login', { username: ENTRY_USERNAME, password: pwd })
      localStorage.setItem('authToken', res.data.token)
      return true
    } catch {
      alert('Authentication failed.')
      return false
    }
  }

  const renderEquipmentDetails = (item) => {
    const type = item.equipmentType

    // Field labels mapping for better display
    const fieldLabels = {
      // CT fields
      ratedVoltageKV: 'Rated Voltage (kV)',
      ratedCurrentA: 'Rated Current (A)',
      ratio: 'Ratio',
      accuracyMetering: 'Accuracy Metering',
      accuracyProtection: 'Accuracy Protection',
      burdenVA: 'Burden (VA)',
      shortTimeCurrentKA_3s: 'Short Time Current (kA/3s)',
      manufacturer: 'Manufacturer',
      model: 'Model',
      serialNo: 'Serial No',
      year: 'Year',
      
      // CVT fields
      secondaryVoltageV: 'Secondary Voltage (V)',
      plccCoupling: 'PLCC Coupling',
      
      // ICT fields
      powerMVA: 'Power (MVA)',
      primaryKV: 'Primary (kV)',
      secondaryKV: 'Secondary (kV)',
      tertiaryKV: 'Tertiary (kV)',
      vectorGroup: 'Vector Group',
      impedancePercent: 'Impedance (%)',
      cooling: 'Cooling',
      
      // CB fields
      type: 'Type',
      
      // LA fields
      energyAbsorptionJ: 'Energy Absorption (J)',
      
      // BUSBAR fields
      material: 'Material',
      
      // WAVETRAP fields
      frequencyHz: 'Frequency (Hz)',
      impedanceOhm: 'Impedance (Ω)'
    }

    const formatValue = (key, value) => {
      if (value === null || value === undefined) return 'N/A'
      if (key === 'plccCoupling') return value ? 'Yes' : 'No'
      return value.toString()
    }

    let details = null
    let equipmentData = null

    // Get equipment-specific data
    switch (type) {
      case 'CT':
        equipmentData = item.ct
        break
      case 'CVT':
        equipmentData = item.cvt
        break
      case 'ICT':
        equipmentData = item.ict
        break
      case 'PT':
        equipmentData = item.pt
        break
      case 'CB':
        equipmentData = item.cb
        break
      case 'ISOLATOR':
        equipmentData = item.isolator
        break
      case 'LA':
        equipmentData = item.la
        break
      case 'BUSBAR':
        equipmentData = item.busbar
        break
      case 'WAVETRAP':
        equipmentData = item.wavetrap
        break
      default:
        equipmentData = null
    }

    if (equipmentData) {
      details = (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
            {type} Specifications
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(equipmentData).map(([k, v]) => (
              <div key={k} className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-gray-700 block text-sm">
                  {fieldLabels[k] || k}:
                </span>
                <span className="text-gray-900 mt-1 block">
                  {formatValue(k, v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    } else if (item.attrs && item.attrs.length > 0) {
      details = (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Custom Attributes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {item.attrs.map((a, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-gray-700 block text-sm">
                  {a.key}:
                </span>
                <span className="text-gray-900 mt-1 block">
                  {a.value ?? 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return details
  }

  return (
    <div className="space-y-8 relative z-10">
      {/* Search + Feeder Section */}
      <div className="rounded-2xl p-4 border border-blue-400/40 bg-white shadow-md">
        <h2 className="text-2xl font-bold mb-4 tracking-wide text-blue-600">
          ⚡ View Equipment Nameplate Details:
        </h2>

        <FeederPicker value={selection} onChange={setSelection} />

        <div className="mt-5 flex items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Search title / feeder"
            className="w-full md:w-96 px-4 py-3 rounded-lg border border-blue-400/40 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Results */}
      {items.length === 0 ? (
        <EmptyState
          title="No nameplates found"
          subtitle="Try another feeder/equipment or add one in Entry tab."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <EquipmentCard 
              key={it._id}
              item={it} 
              onClick={() => setSelectedItem(it)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Popup Modal */}
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative text-gray-800 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
            >✖</button>

            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <h3 className="text-2xl font-bold mb-2">
                {selectedItem.title || 'Equipment Details'}
              </h3>
              <div className="flex flex-wrap gap-4 text-blue-100">
                <span className="bg-blue-500/30 px-3 py-1 rounded-full text-sm">
                  {selectedItem.equipmentType}
                </span>
                <span className="bg-blue-500/30 px-3 py-1 rounded-full text-sm">
                  {selectedItem.voltage} kV
                </span>
                <span className="bg-blue-500/30 px-3 py-1 rounded-full text-sm">
                  {selectedItem.feederName}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Equipment Image */}
              {selectedItem.imageUrl && (
                <div className="flex justify-center">
                  <img
                    src={resolveUploadUrl(selectedItem.imageUrl)}
                    alt={selectedItem.title}
                    className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-semibold text-gray-700 block text-sm">Feeder:</span>
                    <span className="text-gray-900 mt-1 block">{selectedItem.feederName}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-semibold text-gray-700 block text-sm">Equipment Type:</span>
                    <span className="text-gray-900 mt-1 block">{selectedItem.equipmentType}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-semibold text-gray-700 block text-sm">Voltage Level:</span>
                    <span className="text-gray-900 mt-1 block">{selectedItem.voltage || 'N/A'} kV</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-semibold text-gray-700 block text-sm">Created:</span>
                    <span className="text-gray-900 mt-1 block">
                      {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-semibold text-gray-700 block text-sm">Updated:</span>
                    <span className="text-gray-900 mt-1 block">
                      {selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-semibold text-gray-700 block text-sm">ID:</span>
                    <span className="text-gray-900 mt-1 block text-xs font-mono">{selectedItem._id}</span>
                  </div>
                </div>
              </div>

              {/* Equipment Specific Details */}
              {renderEquipmentDetails(selectedItem)}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  onClick={async () => {
                    if (!confirm(`Are you sure you want to delete "${selectedItem.title}"?`)) return
                    const ok = await ensureAuth()
                    if (!ok) return
                    try {
                      await deleteEquipment(selectedItem._id)
                      handleDelete(selectedItem._id)
                      setSelectedItem(null)
                    } catch (error) {
                      alert('Failed to delete equipment. Please try again.')
                    }
                  }}
                >
                  🗑️ Delete Equipment
                </button>
                <div className="flex gap-3">
                  <button
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                    onClick={() => setSelectedItem(null)}
                  >
                    Close
                  </button>
                  <button
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    onClick={() => {
                      // You can add edit functionality here if needed
                      console.log('Edit equipment:', selectedItem._id)
                    }}
                  >
                    Edit Equipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}