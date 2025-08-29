import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PricingTable from '@/components/pricing-table'

const PricingPage = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1) // Goes back to the previous page
  }

  return (
    <div className='w-full h-full'>
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200 bg-white">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Pricing Plans</h1>
      </div>
      
      {/* Pricing Table */}
      <div className="p-6">
        <PricingTable />
      </div>
    </div>
  )
}

export default PricingPage