import { useAuth } from '../context/AuthContext'
import { getInitials, getAvatarColor } from '../utils/helpers'
import { User, Mail, Briefcase, CreditCard, Shield, Calendar, MapPin } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()

  if (!user) return null

  // Format date if created_at exists, otherwise fallback
  const joinDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <div className="page-container max-w-4xl">
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your personal information and account settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Identity Card */}
        <div className="card p-8 flex flex-col items-center text-center md:col-span-1">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-6 shadow-soft ${getAvatarColor(user.name)}`}>
            {getInitials(user.name)}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
          <p className="text-slate-400 mb-4">{user.designation || 'Team Member'}</p>
          
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            user.role === 'admin' 
              ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30' 
              : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
          }`}>
            {user.role === 'admin' ? (
              <><Shield className="w-3 h-3 mr-1.5" /> Admin</>
            ) : (
              <><User className="w-3 h-3 mr-1.5" /> Member</>
            )}
          </span>
        </div>

        {/* Profile Details Card */}
        <div className="card p-8 md:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-white/5 pb-4">
            Employee Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Full Name */}
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Full Name</span>
              </div>
              <p className="text-white font-medium pl-6">{user.name}</p>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Email Address</span>
              </div>
              <p className="text-white font-medium pl-6">{user.email}</p>
            </div>

            {/* Employee ID */}
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Employee ID</span>
              </div>
              <p className="text-white font-mono pl-6">{user.employee_id || 'Not assigned'}</p>
            </div>

            {/* Designation */}
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Designation</span>
              </div>
              <p className="text-white font-medium pl-6">{user.designation || 'Not specified'}</p>
            </div>

            {/* Role */}
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">System Role</span>
              </div>
              <p className="text-white font-medium pl-6 capitalize">{user.role}</p>
            </div>

            {/* Joined */}
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Joined</span>
              </div>
              <p className="text-white font-medium pl-6">{joinDate}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Profile
