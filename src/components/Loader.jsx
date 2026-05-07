import { Loader2 } from 'lucide-react'

// Reusable loading spinner component
const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const loader = (
    <Loader2 
      className={`animate-spin text-primary-500 ${sizeClasses[size]}`} 
    />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {loader}
      </div>
    )
  }

  return loader
}

export default Loader
