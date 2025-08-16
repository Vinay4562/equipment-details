import React from 'react'
export default function EmptyState({ title='No items', subtitle='Try adjusting filters or add new entries.' }){
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="opacity-70">{subtitle}</p>
    </div>
  )
}