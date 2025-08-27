import React from 'react'

// Loading spinner component with customizable size and text
const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
      {text && <span className={`ml-3 text-gray-500 ${textSizes[size]}`}>{text}</span>}
    </div>
  )
}

export default LoadingSpinner
