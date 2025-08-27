import React, { useEffect, useState } from 'react'
import FeederPicker from '../components/FeederPicker.jsx'
import EquipmentCard from '../components/EquipmentCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { listEquipment, deleteEquipment, updateEquipment, api, ENTRY_USERNAME, resolveUploadUrl } from '../api.js'

export default function ViewerPage() {
  const [selection, setSelection] = useState({})
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editImage, setEditImage] = useState(null)
  const [editPayload, setEditPayload] = useState({})
  const [savingEdit, setSavingEdit] = useState(false)
  const [signedIn, setSignedIn] = useState(!!localStorage.getItem('authToken'))
  const [fullImageUrl, setFullImageUrl] = useState(null)
  const [loadingEquipment, setLoadingEquipment] = useState(false)

  useEffect(() => {
    (async () => {
      if (!selection.feederId) return
      setLoadingEquipment(true)
      try {
        const res = await listEquipment({
          feederId: selection.feederId,
          equipmentType: selection.equipmentType,
          q
        })
        setItems(res.data.items)
      } catch (error) {
        console.error('Error loading equipment:', error)
      } finally {
        setLoadingEquipment(false)
      }
    })()
  }, [selection, q])

  // Keep signed-in state in sync across tabs and on sign-in/out
  useEffect(() => {
    const sync = () => setSignedIn(!!localStorage.getItem('authToken'))
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])



  // Exit edit mode if signed out
  useEffect(() => {
    if (!signedIn && isEditing) setIsEditing(false)
  }, [signedIn, isEditing])

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
      setSignedIn(true)
      return true
    } catch {
      alert('Authentication failed.')
      return false
    }
  }

  const getTypeKeyAndData = (item) => {
    const type = item?.equipmentType
    const key = type ? type.toLowerCase() : null
    const data = key ? item[key] || {} : {}
    return { key, data }
  }

  const startEdit = (item) => {
    const { key, data } = getTypeKeyAndData(item)
    setEditTitle(item.title || '')
    setEditImage(null)
    setEditPayload(JSON.parse(JSON.stringify(data || {})))
    setIsEditing(true)
  }

  const setNestedValue = (obj, path, value) => {
    const parts = path.split('.')
    let cur = obj
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]
      if (typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {}
      cur = cur[p]
    }
    cur[parts[parts.length - 1]] = value
  }

  const numericPaths = new Set([
    // ICT numeric fields
    'powerMVA','primaryKV','secondaryKV','tertiaryKV','numPhases','frequencyHz',
    'ratedVoltageAtNoLoad.hv','ratedVoltageAtNoLoad.iv','ratedVoltageAtNoLoad.lv',
    'ratedLineCurrent.hv','ratedLineCurrent.iv','ratedLineCurrent.lv',
    'temperature.maxTempRiseOilC','temperature.maxTempRiseWindingC','temperature.overAmbientTempC',
    'mass.coreAndWindingsKg','mass.totalMassKg','mass.transportMassKg','mass.untankingMassKg','mass.oilVolumeLiters',
    'impedanceVoltage.baseMVA',
    'impedanceVoltage.guaranteed.hv_iv','impedanceVoltage.guaranteed.hv_lv','impedanceVoltage.guaranteed.iv_lv',
    'impedanceVoltage.measured.hv_iv','impedanceVoltage.measured.hv_lv','impedanceVoltage.measured.iv_lv',
    'losses.noLoadKW','losses.loadKW','losses.coolerKW',
    'impedancePercent'
  ])

  const onEditField = (path, value) => {
    const vStr = String(value)
    let v = vStr
    // Boolean
    if (vStr === 'true') v = true
    else if (vStr === 'false') v = false
    else {
      // Numeric if path matches known numeric field (accept units)
      if (numericPaths.has(path)) {
        const m = vStr.match(/-?\d+(?:\.\d+)?/)
        if (m) v = Number(m[0])
      } else if (!isNaN(Number(vStr)) && vStr.trim() !== '') {
        v = Number(vStr)
      }
    }
    setEditPayload(prev => {
      const copy = JSON.parse(JSON.stringify(prev))
      setNestedValue(copy, path, v)
      return copy
    })
  }

  const saveEdit = async () => {
    const ok = await ensureAuth()
    if (!ok) return
    try {
      setSavingEdit(true)
      const form = new FormData()
      if (editTitle && editTitle !== selectedItem.title) form.append('title', editTitle)
      const { key } = getTypeKeyAndData(selectedItem)
      if (key) form.append('payload', JSON.stringify({ [key]: editPayload }))
      if (editImage) form.append('image', editImage)
      const res = await updateEquipment(selectedItem._id, form)
      // Update local list and selected item
      setItems(prev => prev.map(i => i._id === res.data._id ? res.data : i))
      setSelectedItem(res.data)
      setIsEditing(false)
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to update equipment')
    } finally {
      setSavingEdit(false)
    }
  }

  const renderEquipmentDetails = (item) => {
    const type = item.equipmentType

    // Field labels mapping for better display
    const fieldLabels = {
      // CT fields (new detailed)
      manufacturer: 'Manufacturer',
      type: 'Type',
      serialNo: 'Serial No.',
      year: 'Year of Manufacturing',
      highestSystemVoltageKV: 'Highest System Voltage (HSV) (kV)',
      frequencyHz: 'Frequency (Hz)',
      referenceStandard: 'Reference Standard / Specification',
      basicInsulationLevelKVp: 'BIL (kVp)',
      insulationLevel: 'Insulation Level (I.L.)',
      ithKA_1s: 'Ith (kA/1s)',
      idynKA: 'Idyn (kA)',
      ratedThermalCurrentA: 'Rated Thermal Current (A)',
      ratedContinuousCurrentA: 'Rated Continuous Current (A)',
      ratedExtendedPrimaryCurrentA: 'Rated Extended Primary Current (A)',
      ratedPrimaryCurrentA: 'Rated Primary Current (A)',
      ratedSecondaryCurrentA: 'Rated Secondary Current (A)',
      ratio: 'Primary/Secondary Ratio',
      ratioOutput2000to1: '2000/1 Ratio Output (if special)',
      outputVA: 'Output (VA)',
      ratedBurdenVA: 'Rated Burden (VA)',
      accuracyClass: 'Accuracy Class',
      isfOrAlf: 'I.S.F / ALF',
      creepageDistanceMm: 'Total Creepage Distance (mm)',
      cores: 'Cores / Compensating Core',
      primaryConnection: 'Primary Connection',
      secondaryConnection: 'Secondary Connection',
      resistanceAt75C_Ohm: 'Resistance at 75°C (Ω)',
      kneePointVoltageVk: 'Knee Point Voltage (Vk)',
      excitationCurrentAtVk_mA: 'Excitation Current at Vk (mA)',
      oilWeightKg: 'Oil Weight (kg)',
      totalWeightKg: 'Total Weight (kg)',
      soNo: 'S.O. No.',
      // legacy labels
      ratedVoltageKV: 'Rated Voltage (kV)',
      ratedCurrentA: 'Rated Current (A)',
      accuracyMetering: 'Accuracy Metering',
      accuracyProtection: 'Accuracy Protection',
      burdenVA: 'Burden (VA)',
      shortTimeCurrentKA_3s: 'Short Time Current (kA/3s)',
      model: 'Model',
      
      // CVT fields
      secondaryVoltageV: 'Secondary Voltage (V)',
      plccCoupling: 'PLCC Coupling',
      
      // ICT fields (basic)
      type: 'Type',
      manufacturer: 'Manufacturer',
      model: 'Model',
      makersSerialNo: "Maker's Serial No.",
      serialNo: 'Serial No',
      year: 'Year of Manufacture',
      connectionSymbol: 'Connection Symbol',
      vectorGroup: 'Vector Group',
      cooling: 'Type of Cooling',
      powerMVA: 'Rated Power (MVA)',
      primaryKV: 'HV (kV)',
      secondaryKV: 'IV (kV)',
      tertiaryKV: 'LV (kV)',
      numPhases: 'No. of Phases',
      frequencyHz: 'Frequency (Hz)',
      diagramDrgNo: 'Diagram Drg. No.',
      ogaDrawingNo: 'OGA Drawing No.',
      impedancePercent: 'Impedance (%)',
      
      // PT fields
      specification: 'Specification',
      soNo: 'S.O. No.',
      highestSystemVoltageKV: 'Highest System Voltage (HSV) (kV)',
      voltageFactor: 'Voltage Factor',
      creepageDistanceMm: 'Creepage Distance (mm)',
      totalWeightKg: 'Total Weight (kg)',
      oilWeightKg: 'Oil Weight (kg)',
      secondaryVoltages: 'Secondary Voltages',
      ratedBurdenVA: 'Rated Burden (VA)',
      accuracyClass: 'Accuracy Class',
      primaryVoltageKV: 'Primary Voltage (kV)',
      
      // ICT nested labels
      ratedVoltageAtNoLoad: 'Rated Voltage at No Load',
      'ratedVoltageAtNoLoad.hv': 'Rated Voltage at No Load - HV (kV)',
      'ratedVoltageAtNoLoad.iv': 'Rated Voltage at No Load - IV (kV)',
      'ratedVoltageAtNoLoad.lv': 'Rated Voltage at No Load - LV (kV)',
      ratedLineCurrent: 'Rated Line Current',
      'ratedLineCurrent.hv': 'Rated Line Current - HV (A)',
      'ratedLineCurrent.iv': 'Rated Line Current - IV (A)',
      'ratedLineCurrent.lv': 'Rated Line Current - LV (A)',
      temperature: 'Temperature',
      'temperature.maxTempRiseOilC': 'Max. Temperature Rise (Oil) (°C)',
      'temperature.maxTempRiseWindingC': 'Max. Temperature Rise (Winding) (°C)',
      'temperature.overAmbientTempC': 'Over Ambient Temperature (°C)',
      mass: 'Mass',
      'mass.coreAndWindingsKg': 'Mass of Core & Windings (kg)',
      'mass.totalMassKg': 'Total Mass (kg)',
      'mass.transportMassKg': 'Transport Mass (kg)',
      'mass.untankingMassKg': 'Untanking Mass (kg)',
      'mass.oilVolumeLiters': 'Volume of Oil (liters)',
      impedanceVoltage: 'Impedance Voltage (base MVA)',
      'impedanceVoltage.baseMVA': 'Impedance Base (MVA)',
      'impedanceVoltage.guaranteed.hv_iv': 'Impedance Voltage Guaranteed HV–IV (%)',
      'impedanceVoltage.guaranteed.hv_lv': 'Impedance Voltage Guaranteed HV–LV (%)',
      'impedanceVoltage.guaranteed.iv_lv': 'Impedance Voltage Guaranteed IV–LV (%)',
      'impedanceVoltage.measured.hv_iv': 'Impedance Voltage Measured HV–IV (%)',
      'impedanceVoltage.measured.hv_lv': 'Impedance Voltage Measured HV–LV (%)',
      'impedanceVoltage.measured.iv_lv': 'Impedance Voltage Measured IV–LV (%)',
      losses: 'Losses',
      'losses.noLoadKW': 'No-Load Loss (kW)',
      'losses.loadKW': 'Load Loss (kW)',
      'losses.coolerKW': 'Cooler Loss (kW)',
      insulationLevel: 'Insulation level',
      'insulationLevel.hv': 'Insulation level - HV',
      'insulationLevel.iv': 'Insulation level - IV',
      'insulationLevel.lv': 'Insulation level - LV',
      'insulationLevel.n': 'Insulation level - N',
      
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

    const renderKVGroup = (group, baseKey) => {
      if (!group) return null
      return (
        <>
          {['hv','iv','lv'].map(phase => group[phase] !== undefined && (
            <div key={`${baseKey}.${phase}`} className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block text-sm">
                {fieldLabels[`${baseKey}.${phase}`] || `${baseKey}.${phase}`}:
              </span>
              <span className="text-gray-900 mt-1 block">{group[phase]}</span>
            </div>
          ))}
        </>
      )
    }

    const renderObject = (obj, parentKey = '') => {
      return Object.entries(obj).flatMap(([k, v]) => {
        const keyPath = parentKey ? `${parentKey}.${k}` : k
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          if (['ratedVoltageAtNoLoad','ratedLineCurrent'].includes(k)) {
            return renderKVGroup(v, keyPath)
          }
          return Object.entries(v).map(([ck, cv]) => (
            <div key={`${keyPath}.${ck}`} className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block text-sm">
                {fieldLabels[`${keyPath}.${ck}`] || `${k}.${ck}`}:
              </span>
              <span className="text-gray-900 mt-1 block">{formatValue(`${keyPath}.${ck}`, cv)}</span>
            </div>
          ))
        }
        return (
          <div key={keyPath} className="bg-gray-50 p-3 rounded-lg">
            <span className="font-semibold text-gray-700 block text-sm">{fieldLabels[keyPath] || k}:</span>
            <span className="text-gray-900 mt-1 block">{formatValue(keyPath, v)}</span>
          </div>
        )
      })
    }

    if (equipmentData) {
      details = (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
            {type} Specifications
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderObject(equipmentData)}
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
      {loadingEquipment ? (
        <LoadingSpinner text="Loading equipment..." />
      ) : items.length === 0 ? (
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
                    className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm cursor-zoom-in"
                    onClick={() => setFullImageUrl(resolveUploadUrl(selectedItem.imageUrl))}
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
              {!isEditing && renderEquipmentDetails(selectedItem)}

              {/* Edit Form */}
              {isEditing && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Edit Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Title / Position</label>
                      <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Replace Image</label>
                      <input type="file" accept="image/*" onChange={e=>setEditImage(e.target.files?.[0]||null)} className="w-full" />
                    </div>
                  </div>

                  {/* Auto-generate inputs from current equipment subdocument */}
                  {(() => {
                    const { data } = getTypeKeyAndData(selectedItem)
                    const entries = []
                    const walk = (obj, parent='') => {
                      Object.entries(obj || {}).forEach(([k,v]) => {
                        const keyPath = parent ? `${parent}.${k}` : k
                        if (v && typeof v === 'object' && !Array.isArray(v)) return walk(v, keyPath)
                        entries.push([keyPath, v])
                      })
                    }
                    walk(editPayload && Object.keys(editPayload).length ? editPayload : data)
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {entries.map(([k,v]) => (
                          <div key={k}>
                            <label className="block text-sm mb-1">{k}</label>
                            <input defaultValue={v ?? ''} onChange={e=>onEditField(k, e.target.value)} className="w-full border rounded-xl px-3 py-2" />
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  <div className="flex gap-3">
                    <button disabled={savingEdit} onClick={saveEdit} className="px-6 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">{savingEdit ? 'Saving…' : 'Save Changes'}</button>
                    <button disabled={savingEdit} onClick={()=>setIsEditing(false)} className="px-6 py-2 rounded-lg border">Cancel</button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                {signedIn && (
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
                )}
                <div className="flex gap-3">
                  <button
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                    onClick={() => setSelectedItem(null)}
                  >
                    Close
                  </button>
                  {signedIn && !isEditing ? (
                    <button
                      className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      onClick={() => startEdit(selectedItem)}
                    >
                      Edit Equipment
                    </button>
                  ) : isEditing ? (
                    <button
                      className="px-6 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
                      onClick={()=>setIsEditing(false)}
                    >
                      Exit Edit
                    </button>
                  ) : null}
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {fullImageUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullImageUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/90 hover:text-white text-3xl bg-black/40 rounded-full w-10 h-10 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); setFullImageUrl(null) }}
            aria-label="Close image"
            title="Close"
          >✖</button>
          <img
            src={fullImageUrl}
            alt="Full size"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}