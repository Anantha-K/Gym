import Link from "next/link"
import StatusDot from "./statusDot"

const StudentCard = ({ name, membershipType, status, subscriptionEndDate, id }: {
  id: string,
  name: string,
  membershipType: string,
  status: 'Active' | 'Expired' | 'Suspended',
  subscriptionEndDate: string
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50'
      case 'Expired': return 'text-red-600 bg-red-50'
      case 'Suspended': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'Premium': return 'text-purple-700 bg-purple-100 border-purple-200'
      case 'Basic': return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'Student': return 'text-emerald-700 bg-emerald-100 border-emerald-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const calculateDaysRemaining = (endDate: string | number) => {
    const end = new Date(endDate).getTime()
    const now = Date.now()
    const diff = end - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const daysRemaining = calculateDaysRemaining(subscriptionEndDate)

  return (
    <Link href={`./students/${id}`}>
      <div className="bg-white min-w-[22vw] rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 h-full">
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg text-gray-900 truncate pr-2">
                {name}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusDot status={status} />
              </div>
            </div>

            <div className="space-y-3 space-x-5">
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getMembershipColor(membershipType)}`}>
                {membershipType}
              </div>
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {status}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            {daysRemaining >= 0 ?
              <p className="text-sm text-gray-600">
                <span className="font-medium">Ends in:</span>{' '}
                <span className="text-gray-900 font-semibold">
                  {daysRemaining} days
                </span>
              </p> :
              <p className="text-sm text-gray-600">
                <span className="font-medium">Ended</span>{' '}
                <span className="text-gray-900 font-semibold">
                  {Math.abs(daysRemaining)} days ago
                </span>
              </p>
            }
          </div>
        </div>
      </div>
    </Link>
  )
}

export default StudentCard