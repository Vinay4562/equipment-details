import React, { useState, useEffect } from 'react'
import { createEquipment } from '../api'
import LoadingSpinner from './LoadingSpinner.jsx'

export default function NameplateForm({ selection }){
  const [title, setTitle] = useState('')
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [signedIn, setSignedIn] = useState(!!localStorage.getItem('authToken'))

  const [fields, setFields] = useState({})

  const handleChange = (k,v)=> setFields(prev=>({ ...prev, [k]: v }))

  // Keep signed-in state in sync across tabs and on sign-in/out
  useEffect(() => {
    const sync = () => setSignedIn(!!localStorage.getItem('authToken'))
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])



  const specFields = {
    CT: [
      ['ct.manufacturer','Manufacturer'],
      ['ct.type','Type / Type Designation'],
      ['ct.serialNo','Serial No. / Sl. No. / Sr. No.'],
      ['ct.year','Year of Manufacturing'],
      ['ct.highestSystemVoltageKV','HSV / NSV / Rated System Voltage (kV)'],
      ['ct.frequencyHz','Frequency (Hz)'],
      ['ct.referenceStandard','Reference Standard / Specification'],
      ['ct.basicInsulationLevelKVp','BIL (kVp)'],
      ['ct.insulationLevel','Insulation Level (I.L.)'],
      ['ct.ithKA_1s','Ith (kA/1s)'],
      ['ct.idynKA','Idyn (kA)'],
      ['ct.ratedThermalCurrentA','Rated Thermal Current (A)'],
      ['ct.ratedContinuousCurrentA','Rated Continuous Current (A)'],
      ['ct.ratedExtendedPrimaryCurrentA','Rated Extended Primary Current (A)'],
      ['ct.ratedPrimaryCurrentA','Rated Primary Current (A)'],
      ['ct.ratedSecondaryCurrentA','Rated Secondary Current (A)'],
      ['ct.ratio','Primary/Secondary Ratio'],
      ['ct.ratioOutput2000to1','2000/1 Ratio Output (if special)'],
      ['ct.outputVA','Output (VA)'],
      ['ct.ratedBurdenVA','Rated Burden (VA)'],
      ['ct.accuracyClass','Accuracy Class'],
      ['ct.isfOrAlf','I.S.F / ALF'],
      ['ct.creepageDistanceMm','Normal/Nominal/Total Creepage Distance (mm)'],
      ['ct.cores','Cores / Compensating Core'],
      ['ct.primaryConnection','Primary Connection'],
      ['ct.secondaryConnection','Secondary Connection'],
      ['ct.resistanceAt75C_Ohm','Resistance at 75°C (Ω)'],
      ['ct.kneePointVoltageVk','Knee Point Voltage (Vk)'],
      ['ct.excitationCurrentAtVk_mA','Excitation/Magnetizing Current at Vk (mA)'],
      ['ct.oilWeightKg','Oil Weight (kg)'],
      ['ct.totalWeightKg','Total Weight (kg)'],
      ['ct.soNo','S.O. No.'],
      // legacy/compat
      ['ct.ratedVoltageKV','Rated Voltage (kV)'],
      ['ct.ratedCurrentA','Rated Current (A)'],
      ['ct.accuracyMetering','Accuracy Metering'],
      ['ct.accuracyProtection','Accuracy Protection'],
      ['ct.burdenVA','Burden (VA)'],
      ['ct.shortTimeCurrentKA_3s','Short Time Current (kA/3s)'],
      ['ct.model','Model'],
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
      // Basic
      ['ict.manufacturer','Manufacturer'],
      ['ict.type','Type'],
      ['ict.cooling','Type of Cooling'],
      ['ict.powerMVA','Rated Power (MVA)'],
      
      // Legacy voltage kV (optional)
      ['ict.primaryKV','HV (kV)'],
      ['ict.secondaryKV','IV (kV)'],
      ['ict.tertiaryKV','LV (kV)'],
      
      // Rated Voltage at No Load
      ['ict.ratedVoltageAtNoLoad.hv','Rated Voltage at No Load - HV (kV)'],
      ['ict.ratedVoltageAtNoLoad.iv','Rated Voltage at No Load - IV (kV)'],
      ['ict.ratedVoltageAtNoLoad.lv','Rated Voltage at No Load - LV (kV)'],
      
      // Rated Line Current
      ['ict.ratedLineCurrent.hv','Rated Line Current - HV (A)'],
      ['ict.ratedLineCurrent.iv','Rated Line Current - IV (A)'],
      ['ict.ratedLineCurrent.lv','Rated Line Current - LV (A)'],
      
      // Other ratings
      ['ict.numPhases','No. of Phases'],
      ['ict.frequencyHz','Frequency (Hz)'],
      
      // Drawings / identifiers
      ['ict.diagramDrgNo','Diagram Drg. No.'],
      ['ict.ogaDrawingNo','OGA Drawing No.'],
      ['ict.makersSerialNo','Maker\'s Serial No.'],
      ['ict.connectionSymbol','Connection Symbol'],
      ['ict.year','Year of Manufacture'],
      
      // Temperature rise
      ['ict.temperature.maxTempRiseOilC','Max. Temperature Rise (Oil) (°C)'],
      ['ict.temperature.maxTempRiseWindingC','Max. Temperature Rise (Winding) (°C)'],
      ['ict.temperature.overAmbientTempC','Over Ambient Temperature (°C)'],
      
      // Masses & oil
      ['ict.mass.coreAndWindingsKg','Mass of Core & Windings (kg)'],
      ['ict.mass.totalMassKg','Total Mass (kg)'],
      ['ict.mass.transportMassKg','Transport Mass (kg)'],
      ['ict.mass.untankingMassKg','Untanking Mass (kg)'],
      ['ict.mass.oilVolumeLiters','Volume of Oil (liters)'],
      
      // Impedance Voltage (315 MVA base at normal tap)
      ['ict.impedanceVoltage.baseMVA','Impedance Base (MVA)'],
      ['ict.impedanceVoltage.guaranteed.hv_iv','Impedance Voltage Guaranteed HV–IV (%)'],
      ['ict.impedanceVoltage.guaranteed.hv_lv','Impedance Voltage Guaranteed HV–LV (%)'],
      ['ict.impedanceVoltage.guaranteed.iv_lv','Impedance Voltage Guaranteed IV–LV (%)'],
      ['ict.impedanceVoltage.measured.hv_iv','Impedance Voltage Measured HV–IV (%)'],
      ['ict.impedanceVoltage.measured.hv_lv','Impedance Voltage Measured HV–LV (%)'],
      ['ict.impedanceVoltage.measured.iv_lv','Impedance Voltage Measured IV–LV (%)'],
      
      // Losses
      ['ict.losses.noLoadKW','No-Load Loss (kW)'],
      ['ict.losses.loadKW','Load Loss (kW)'],
      ['ict.losses.coolerKW','Cooler Loss (kW)'],
      
      // Insulation Level
      ['ict.insulationLevel.hv','Insulation Level - HV'],
      ['ict.insulationLevel.iv','Insulation Level - IV'],
      ['ict.insulationLevel.lv','Insulation Level - LV'],
      ['ict.insulationLevel.n','Insulation Level - N'],
      
      // Vector/Impedance (kept for quick view)
      ['ict.vectorGroup','Vector Group'],
      ['ict.impedancePercent','Impedance (%)'],
    ],
    PT: [
      ['pt.type','Type'],
      ['pt.specification','Specification'],
      ['pt.soNo','S.O. No.'],
      ['pt.manufacturer','Manufacture'],
      ['pt.year','Year of Manufacture'],
      ['pt.serialNo','Serial No.'],
      ['pt.highestSystemVoltageKV','Highest System Voltage (HSV) (kV)'],
      ['pt.frequencyHz','Frequency (Hz)'],
      ['pt.insulationLevel','Insulation Level'],
      ['pt.voltageFactor','Voltage Factor'],
      ['pt.creepageDistanceMm','Creepage Distance (mm)'],
      ['pt.totalWeightKg','Total Weight (kg)'],
      ['pt.oilWeightKg','Oil Weight (kg)'],
      ['pt.secondaryVoltages','Secondary Voltages'],
      ['pt.ratedBurdenVA','Rated Burden (VA)'],
      ['pt.accuracyClass','Accuracy Class'],
      ['pt.primaryVoltageKV','Primary Voltage (kV)'],
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
        <button disabled={saving} className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 flex items-center gap-2">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving…
            </>
          ) : (
            'Save Nameplate'
          )}
        </button>
        {message && <span className="text-sm opacity-80">{message}</span>}
      </div>
    </form>
  )
}

function handleInputChange(path, value, cb){
  // Convert booleans
  if (value === 'true') return cb(path, true)
  if (value === 'false') return cb(path, false)

  // For ICT: cast only known numeric fields; leave others (like insulationLevel) as strings
  const numericPrefixes = [
    'ict.powerMVA',
    'ict.primaryKV','ict.secondaryKV','ict.tertiaryKV',
    'ict.numPhases','ict.frequencyHz',
    'ict.ratedVoltageAtNoLoad.hv','ict.ratedVoltageAtNoLoad.iv','ict.ratedVoltageAtNoLoad.lv',
    'ict.ratedLineCurrent.hv','ict.ratedLineCurrent.iv','ict.ratedLineCurrent.lv',
    'ict.temperature.maxTempRiseOilC','ict.temperature.maxTempRiseWindingC','ict.temperature.overAmbientTempC',
    'ict.mass.coreAndWindingsKg','ict.mass.totalMassKg','ict.mass.transportMassKg','ict.mass.untankingMassKg','ict.mass.oilVolumeLiters',
    'ict.impedanceVoltage.baseMVA',
    'ict.impedanceVoltage.guaranteed.hv_iv','ict.impedanceVoltage.guaranteed.hv_lv','ict.impedanceVoltage.guaranteed.iv_lv',
    'ict.impedanceVoltage.measured.hv_iv','ict.impedanceVoltage.measured.hv_lv','ict.impedanceVoltage.measured.iv_lv',
    'ict.losses.noLoadKW','ict.losses.loadKW','ict.losses.coolerKW',
    'ict.impedancePercent',
    // Other equipment generic numeric fields
    'ct.ratedVoltageKV','ct.ratedCurrentA','ct.burdenVA','ct.shortTimeCurrentKA_3s',
    'cvt.ratedVoltageKV','cvt.burdenVA',
    // CT new numeric fields
    'ct.highestSystemVoltageKV','ct.basicInsulationLevelKVp','ct.ithKA_1s','ct.idynKA',
    'ct.ratedThermalCurrentA','ct.ratedContinuousCurrentA','ct.ratedExtendedPrimaryCurrentA',
    'ct.ratedPrimaryCurrentA','ct.ratedSecondaryCurrentA','ct.outputVA','ct.ratedBurdenVA',
    'ct.creepageDistanceMm','ct.resistanceAt75C_Ohm','ct.kneePointVoltageVk','ct.excitationCurrentAtVk_mA',
    'ct.oilWeightKg','ct.totalWeightKg',
    'pt.ratedVoltageKV','pt.ratedCurrentA','pt.burdenVA','pt.shortTimeCurrentKA_3s',
    // PT new numeric fields
    'pt.highestSystemVoltageKV','pt.frequencyHz','pt.creepageDistanceMm','pt.totalWeightKg','pt.oilWeightKg','pt.ratedBurdenVA','pt.primaryVoltageKV',
    'cb.ratedVoltageKV','cb.ratedCurrentA',
    'isolator.ratedVoltageKV','isolator.ratedCurrentA',
    'la.ratedVoltageKV','la.energyAbsorptionJ',
    'busbar.ratedVoltageKV','busbar.ratedCurrentA',
    'wavetrap.ratedVoltageKV','wavetrap.frequencyHz','wavetrap.impedanceOhm'
  ]

  const shouldBeNumber = numericPrefixes.some(prefix => path === prefix)

  let v = value
  if (shouldBeNumber) {
    // Extract first numeric token (handles values like "12.5% ±10%", "22600 kg", "50 °C")
    const match = String(value).match(/-?\d+(?:\.\d+)?/)
    if (match) v = Number(match[0])
  } else if (!isNaN(Number(value)) && String(value).trim() !== '') {
    // Plain numeric strings without units
    v = Number(value)
  }

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