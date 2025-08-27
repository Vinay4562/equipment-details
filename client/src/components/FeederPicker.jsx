import React, { useEffect, useState } from 'react'
import { fetchFeeders, seedFeeders } from '../api'
import LoadingSpinner from './LoadingSpinner.jsx'

const VOLTAGES = ['400KV','220KV','ICT']

// Equipment types by voltage level
const getEquipmentTypes = (voltage) => {
  if (voltage === 'ICT') {
    return ['ICT', 'CVT', 'LA', 'CT', 'CB']
  } else {
    // For 400KV and 220KV
    return ['CT', 'CVT', 'CB', 'LA', 'PT', 'WAVETRAP', 'ISOLATOR']
  }
}

export default function FeederPicker({ onChange, value }){
  const [voltage, setVoltage] = useState(value?.voltage || '400KV')
  const [feeders, setFeeders] = useState([])
  const [feederId, setFeederId] = useState(value?.feederId || '')
  const [equipmentType, setEquipmentType] = useState(value?.equipmentType || 'CT')
  const [loadingFeeders, setLoadingFeeders] = useState(false)
  const [seeding, setSeeding] = useState(false)

  // Get available equipment types for current voltage
  const availableTypes = getEquipmentTypes(voltage)

  useEffect(()=>{ 
    (async()=>{
      setLoadingFeeders(true)
      try {
        const res = await fetchFeeders(voltage)
        setFeeders(res.data)
        if (!res.data.find(f=>f._id===feederId)) setFeederId(res.data[0]?._id||'')
      } catch (error) {
        console.error('Error fetching feeders:', error)
      } finally {
        setLoadingFeeders(false)
      }
    })() 
  },[voltage])

  // Reset equipment type if current selection is not available for new voltage
  useEffect(() => {
    if (!availableTypes.includes(equipmentType)) {
      setEquipmentType(availableTypes[0] || 'CT')
    }
  }, [voltage, availableTypes, equipmentType])

  useEffect(()=>{ onChange && onChange({ voltage, feederId, equipmentType }) },[voltage, feederId, equipmentType])

  const handleSeedFeeders = async () => {
    setSeeding(true)
    try {
      await seedFeeders()
      const res = await fetchFeeders(voltage)
      setFeeders(res.data)
    } catch (error) {
      console.error('Error seeding feeders:', error)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-3">
      <div>
        <label className="block text-sm mb-1">Voltage Level</label>
        <select value={voltage} onChange={e=>setVoltage(e.target.value)} className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
          {VOLTAGES.map(v=> <option key={v} value={v}>{v}</option>)}
        </select>
        <button 
          className="text-xs underline mt-1 disabled:opacity-50" 
          onClick={handleSeedFeeders}
          disabled={seeding}
        >
          {seeding ? 'Seeding...' : 'Seed defaults'}
        </button>
      </div>
      <div>
        <label className="block text-sm mb-1">Feeder</label>
        {loadingFeeders ? (
          <div className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
            <LoadingSpinner size="sm" text="Loading feeders..." className="p-2" />
          </div>
        ) : (
          <select value={feederId} onChange={e=>setFeederId(e.target.value)} className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
            {feeders.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        )}
      </div>
      <div>
        <label className="block text-sm mb-1">Equipment Type</label>
        <select value={equipmentType} onChange={e=>setEquipmentType(e.target.value)} className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
          {availableTypes.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  )
}