import React, { useState } from 'react'
import { deleteEquipment } from '../api'

export default function EquipmentCard({ item, onClick, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const fields = (() => {
    switch (item.equipmentType) {
      case 'CT':
        return [
          ['Rated Voltage', item.ct?.ratedVoltageKV ? `${item.ct.ratedVoltageKV} kV` : null],
          ['Ratio', item.ct?.ratio],
          ['Accuracy (M)', item.ct?.accuracyMetering],
          ['Accuracy (P)', item.ct?.accuracyProtection],
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
          ['Power', item.ict?.powerMVA ? `${item.ict.powerMVA} MVA` : null],
          ['Vector', item.ict?.vectorGroup],
          ['Impedance', item.ict?.impedancePercent ? `${item.ict.impedancePercent}%` : null],
          ['Cooling', item.ict?.cooling],
        ]
      default:
        return item.attrs?.slice(0, 3)?.map(a => [a.key, a.value]) || []
    }
  })()

  // Backend URL for uploaded images
  const imageSrc = item.imageUrl
    ? `http://localhost:5000${item.imageUrl}` // Fixed URL construction
    : "/images/placeholder.svg" // fallback

  const handleDelete = async (e) => {
    e.stopPropagation() // Prevent card click when delete button is clicked
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return
    
    try {
      setDeleting(true)
      await deleteEquipment(item._id)
      onDelete && onDelete(item._id)
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('Failed to delete equipment. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

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
                  e.target.src = "/images/placeholder.png"
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
      
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
        title="Delete Equipment"
      >
        {deleting ? '⏳' : '🗑️'}
      </button>
    </div>
  )
}
