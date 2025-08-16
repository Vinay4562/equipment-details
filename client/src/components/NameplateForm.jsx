import React, { useState } from 'react'
import { createEquipment } from '../api'

export default function NameplateForm({ selection }){
  const [title, setTitle] = useState('')
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [fields, setFields] = useState({})

  const handleChange = (k,v)=> setFields(prev=>({ ...prev, [k]: v }))

  const specFields = {
    CT: [
      ['ct.ratedVoltageKV','Rated Voltage (kV)'],
      ['ct.ratedCurrentA','Rated Current (A)'],
      ['ct.ratio','Ratio (e.g., 2000/1A)'],
      ['ct.accuracyMetering','Accuracy Metering (e.g., 0.2S)'],
      ['ct.accuracyProtection','Accuracy Protection (e.g., 5P20)'],
      ['ct.burdenVA','Burden (VA)'],
      ['ct.shortTimeCurrentKA_3s','Short Time Current (kA/3s)'],
      ['ct.manufacturer','Manufacturer'],
      ['ct.model','Model'],
      ['ct.serialNo','Serial No'],
      ['ct.year','Year'],
    ],
    CVT: [
      ['cvt.ratedVoltageKV','Rated Voltage (kV)'],
      ['cvt.secondaryVoltageV','Secondary Voltage (V)'],
      ['cvt.accuracyMetering','Accuracy Metering'],
      ['cvt.accuracyProtection','Accuracy Protection'],
      ['cvt.burdenVA','Burden (VA)'],
      ['cvt.plccCoupling','PLCC Coupling (true/false)'],
      ['cvt.manufacturer','Manufacturer'],
      ['cvt.serialNo','Serial No'],
      ['cvt.year','Year'],
    ],
    ICT: [
      ['ict.powerMVA','Power (MVA)'],
      ['ict.primaryKV','Primary (kV)'],
      ['ict.secondaryKV','Secondary (kV)'],
      ['ict.tertiaryKV','Tertiary (kV)'],
      ['ict.vectorGroup','Vector Group'],
      ['ict.impedancePercent','Impedance (%)'],
      ['ict.cooling','Cooling (ONAN/ONAF)'],
      ['ict.manufacturer','Manufacturer'],
      ['ict.serialNo','Serial No'],
      ['ict.year','Year'],
    ],
    PT: [
      ['pt.ratedVoltageKV','Rated Voltage (kV)'],
      ['pt.ratedCurrentA','Rated Current (A)'],
      ['pt.ratio','Ratio (e.g., 2000/1A)'],
      ['pt.accuracyMetering','Accuracy Metering (e.g., 0.2S)'],
      ['pt.accuracyProtection','Accuracy Protection (e.g., 5P20)'],
      ['pt.burdenVA','Burden (VA)'],
      ['pt.shortTimeCurrentKA_3s','Short Time Current (kA/3s)'],
      ['pt.manufacturer','Manufacturer'],
      ['pt.model','Model'],
      ['pt.serialNo','Serial No'],
      ['pt.year','Year'],
    ],
    CB: [
      ['cb.ratedVoltageKV','Rated Voltage (kV)'],
      ['cb.ratedCurrentA','Rated Current (A)'],
      ['cb.type','Type (e.g., VCB, ACB)'],
      ['cb.manufacturer','Manufacturer'],
      ['cb.model','Model'],
      ['cb.serialNo','Serial No'],
      ['cb.year','Year'],
    ],
    ISOLATOR: [
      ['isolator.ratedVoltageKV','Rated Voltage (kV)'],
      ['isolator.ratedCurrentA','Rated Current (A)'],
      ['isolator.type','Type (e.g., Disconnecting)'],
      ['isolator.manufacturer','Manufacturer'],
      ['isolator.model','Model'],
      ['isolator.serialNo','Serial No'],
      ['isolator.year','Year'],
    ],
    LA: [
      ['la.ratedVoltageKV','Rated Voltage (kV)'],
      ['la.energyAbsorptionJ','Energy Absorption (J)'],
      ['la.manufacturer','Manufacturer'],
      ['la.model','Model'],
      ['la.serialNo','Serial No'],
      ['la.year','Year'],
    ],
    BUSBAR: [
      ['busbar.ratedVoltageKV','Rated Voltage (kV)'],
      ['busbar.ratedCurrentA','Rated Current (A)'],
      ['busbar.material','Material (e.g., Copper, Aluminum)'],
      ['busbar.manufacturer','Manufacturer'],
      ['busbar.model','Model'],
      ['busbar.serialNo','Serial No'],
      ['busbar.year','Year'],
    ],
    WAVETRAP: [
      ['wavetrap.ratedVoltageKV','Rated Voltage (kV)'],
      ['wavetrap.frequencyHz','Frequency (Hz)'],
      ['wavetrap.impedanceOhm','Impedance (Ω)'],
      ['wavetrap.manufacturer','Manufacturer'],
      ['wavetrap.model','Model'],
      ['wavetrap.serialNo','Serial No'],
      ['wavetrap.year','Year'],
    ],
  }

  const activeFields = specFields[selection.equipmentType] || [['title','Title'], ['attrs[0].key','Key'],['attrs[0].value','Value']]

  const submit = async (e)=>{
    e.preventDefault()
    try {
      setSaving(true); setMessage('')
      const form = new FormData()
      form.append('voltage', selection.voltage)
      form.append('feederId', selection.feederId)
      form.append('equipmentType', selection.equipmentType)
      form.append('title', title)
      form.append('payload', JSON.stringify(nestFields(fields)))
      if (image) form.append('image', image)
      const res = await createEquipment(form)
      setMessage('Saved ✅')
      setTitle(''); setImage(null); setFields({})
    } catch (err){
      setMessage(err?.response?.data?.error || 'Error saving')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Title / Position</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="e.g., CT for 400kV MAHESHWARAM-1 Bay" className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {activeFields.map(([key,label])=> (
          <div key={key}>
            <label className="block text-sm mb-1">{label}</label>
            <input onChange={e=>handleInputChange(key, e.target.value, handleChange)} placeholder={label} className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm mb-1">Equipment Image</label>
        <input type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0]||null)} className="w-full" />
      </div>
      <div className="flex items-center gap-3">
        <button disabled={saving} className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black disabled:opacity-50">{saving? 'Saving…':'Save Nameplate'}</button>
        {message && <span className="text-sm opacity-80">{message}</span>}
      </div>
    </form>
  )
}

function handleInputChange(path, value, cb){
  // Convert "true/false" to booleans, numbers if numeric
  let v = value
  if (value === 'true') v = true
  else if (value === 'false') v = false
  else if (!isNaN(Number(value)) && value.trim() !== '') v = Number(value)
  cb(path, v)
}

function nestFields(flat){
  // Convert {'ct.ratedVoltageKV': 400} -> { ct: { ratedVoltageKV: 400 } }
  const out = {}
  for (const [k,v] of Object.entries(flat)){
    const parts = k.replace(/\[(\d+)\]/g, '.$1').split('.')
    let cur = out
    for (let i=0;i<parts.length;i++){
      const p = parts[i]
      if (i === parts.length-1){ cur[p] = v }
      else { cur[p] = cur[p] || {}; cur = cur[p] }
    }
  }
  return out
}