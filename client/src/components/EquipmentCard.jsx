import React, { useEffect, useState } from 'react'
import { api, deleteEquipment, ENTRY_USERNAME, resolveUploadUrl } from '../api'

export default function EquipmentCard({ item, onClick, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const [signedIn, setSignedIn] = useState(!!localStorage.getItem('authToken'))

  const fields = (() => {
    switch (item.equipmentType) {
      case 'CT':
        return [
          ['Manufacturer', item.ct?.manufacturer],
          ['Type', item.ct?.type],
          ['Ratio', item.ct?.ratio],
          ['Accuracy Class', item.ct?.accuracyClass || item.ct?.accuracyMetering],
          ['Burden', item.ct?.ratedBurdenVA ? `${item.ct.ratedBurdenVA} VA` : (item.ct?.burdenVA ? `${item.ct.burdenVA} VA` : null)],
        ]
      case 'CVT':
        return [
          ['Rated Voltage', item.cvt?.ratedVoltageKV ? `${item.cvt.ratedVoltageKV} kV` : null],
          ['Secondary', item.cvt?.secondaryVoltageV],
          ['Accuracy', item.cvt?.accuracyMetering],
          ['PLCC', item.cvt?.plccCoupling ? 'Yes' : 'No'],
        ]
      case 'ICT':
        return [
          ['Manufacturer', item.ict?.manufacturer],
          ['Type', item.ict?.type],
          ['Power', item.ict?.powerMVA ? `${item.ict.powerMVA} MVA` : null],
          ['Vector', item.ict?.vectorGroup],
          ['Cooling', item.ict?.cooling],
          ['HV', item.ict?.primaryKV ? `${item.ict.primaryKV} kV` : (item.ict?.ratedVoltageAtNoLoad?.hv ? `${item.ict.ratedVoltageAtNoLoad.hv} kV` : null)],
          ['IV', item.ict?.secondaryKV ? `${item.ict.secondaryKV} kV` : (item.ict?.ratedVoltageAtNoLoad?.iv ? `${item.ict.ratedVoltageAtNoLoad.iv} kV` : null)],
          ['LV', item.ict?.tertiaryKV ? `${item.ict.tertiaryKV} kV` : (item.ict?.ratedVoltageAtNoLoad?.lv ? `${item.ict.ratedVoltageAtNoLoad.lv} kV` : null)],
        ]
      case 'PT':
        return [
          ['Type', item.pt?.type],
          ['Primary Voltage', item.pt?.primaryVoltageKV ? `${item.pt.primaryVoltageKV} kV` : null],
          ['Accuracy Class', item.pt?.accuracyClass],
          ['Rated Burden', item.pt?.ratedBurdenVA ? `${item.pt.ratedBurdenVA} VA` : null],
        ]
      case 'CB':
        return [
          ['Rated Voltage', item.cb?.ratedVoltageKV ? `${item.cb.ratedVoltageKV} kV` : null],
          ['Rated Current', item.cb?.ratedCurrentA ? `${item.cb.ratedCurrentA} A` : null],
          ['Type', item.cb?.type],
          ['Manufacturer', item.cb?.manufacturer],
        ]
      case 'ISOLATOR':
        return [
          ['Rated Voltage', item.isolator?.ratedVoltageKV ? `${item.isolator.ratedVoltageKV} kV` : null],
          ['Rated Current', item.isolator?.ratedCurrentA ? `${item.isolator.ratedCurrentA} A` : null],
          ['Type', item.isolator?.type],
          ['Manufacturer', item.isolator?.manufacturer],
        ]
      case 'LA':
        return [
          ['Rated Voltage', item.la?.ratedVoltageKV ? `${item.la.ratedVoltageKV} kV` : null],
          ['Energy Absorption', item.la?.energyAbsorptionJ ? `${item.la.energyAbsorptionJ} J` : null],
          ['Manufacturer', item.la?.manufacturer],
          ['Model', item.la?.model],
        ]
      case 'BUSBAR':
        return [
          ['Rated Voltage', item.busbar?.ratedVoltageKV ? `${item.busbar.ratedVoltageKV} kV` : null],
          ['Rated Current', item.busbar?.ratedCurrentA ? `${item.busbar.ratedCurrentA} A` : null],
          ['Material', item.busbar?.material],
          ['Manufacturer', item.busbar?.manufacturer],
        ]
      case 'WAVETRAP':
        return [
          ['Rated Voltage', item.wavetrap?.ratedVoltageKV ? `${item.wavetrap.ratedVoltageKV} kV` : null],
          ['Frequency', item.wavetrap?.frequencyHz ? `${item.wavetrap.frequencyHz} Hz` : null],
          ['Impedance', item.wavetrap?.impedanceOhm ? `${item.wavetrap.impedanceOhm} Ω` : null],
          ['Manufacturer', item.wavetrap?.manufacturer],
        ]
      default:
        return item.attrs?.slice(0, 3)?.map(a => [a.key, a.value]) || []
    }
  })()

  // Resolve uploaded image URL across environments
  const imageSrc = item.imageUrl ? resolveUploadUrl(item.imageUrl) : "/images/placeholder.svg"

  const ensureAuthForDelete = async () => {
    // If token exists, assume valid and proceed
    const token = localStorage.getItem('authToken')
    if (token) return true
    // Ask for sign-in password
    const pwd = prompt('Enter sign-in password to delete this equipment:')
    if (!pwd) return false
    try {
      const res = await api.post('/auth/login', { username: ENTRY_USERNAME, password: pwd })
      localStorage.setItem('authToken', res.data.token)
      return true
    } catch (e) {
      alert('Authentication failed. Deletion cancelled.')
      return false
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return

    try {
      setDeleting(true)
      const ok = await ensureAuthForDelete()
      if (!ok) return
      await deleteEquipment(item._id)
      onDelete && onDelete(item._id)
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('Failed to delete equipment. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // Keep signed-in state in sync across tabs and on sign-in/out
  useEffect(() => {
    const sync = () => setSignedIn(!!localStorage.getItem('authToken'))
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])



  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-full text-left cursor-pointer focus:outline-none"
      >
        <div className="rounded-2xl border border-blue-500/30 bg-black/60 shadow-lg p-4 relative">
          {imageSrc && (
            <div className="relative">
              <img
                src={imageSrc}
                alt={item.title}
                className="w-full h-40 object-cover rounded-lg border border-blue-500/20 mb-3"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.png"
                }}
              />
              {/* Transparent small label */}
              <div className="absolute top-2 left-2 text-white text-[10px] font-semibold bg-black/50 px-2 py-1 rounded">
                {item.voltage} • {item.feederName} • {item.equipmentType}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">{item.title}</h3>

            <dl className="grid grid-cols-2 gap-2 text-sm">
              {fields.filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-blue-300 opacity-80">{k}</dt>
                  <dd className="text-white font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </button>
      
      {/* Delete Button (only when signed in) */}
      {signedIn && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
          title="Delete Equipment"
        >
          {deleting ? '⏳' : '🗑️'}
        </button>
      )}
    </div>
  )
}