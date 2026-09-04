import { useState } from 'react';
import { Users as UsersIcon, Shield, Search, Filter, CheckCircle2, Clock, UserPlus, MoreVertical, Edit2, Key, AlertCircle } from 'lucide-react';

const INITIAL_USERS = [
  {
    id: 'u-1',
    name: 'Admin',
    email: 'admin@transactionguard.ai',
    role: 'Administrator',
    roleTitle: 'Platform Administrator',
    status: 'Active',
    lastActive: 'Just now',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200'
  },
  {
    id: 'u-2',
    name: 'Alex',
    email: 'analyst@transactionguard.ai',
    role: 'Risk Analyst',
    roleTitle: 'Risk Analyst',
    status: 'Active',
    lastActive: '10 mins ago',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200'
  },
  {
    id: 'u-3',
    name: 'Priya',
    email: 'reviewer@transactionguard.ai',
    role: 'Reviewer',
    roleTitle: 'Transaction Reviewer',
    status: 'Active',
    lastActive: '1 hour ago',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }
];

export default function Users() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const handleToggleStatus = (id) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
          showToast(`Updated ${u.name}'s status to ${newStatus}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UsersIcon className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">USER MANAGEMENT</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Manage demo accounts, permission groups, and role-based access for the TransactionGuard platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('Demo platform: User creation is preset with 3 verified demo roles')}
          className="btn-primary text-xs flex items-center gap-2 py-2 px-4 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Analyst</span>
        </button>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="p-3.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-2xl text-xs flex items-center gap-2 fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Users</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{users.length}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All active
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Administrators</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">1</div>
          <div className="text-[11px] text-slate-500 mt-1">Full platform authority</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Risk Analysts</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">1</div>
          <div className="text-[11px] text-slate-500 mt-1">Simulation & analytics</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Reviewers</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">1</div>
          <div className="text-[11px] text-slate-500 mt-1">Queue decision logging</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, or role..."
              className="input-field pl-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field text-xs py-2.5 w-full sm:w-44"
            >
              <option value="All">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Risk Analyst">Risk Analyst</option>
              <option value="Reviewer">Reviewer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-xs py-2.5 w-full sm:w-36"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shadow-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${u.badgeClass}`}>
                          {u.role.toUpperCase()}
                        </span>
                        <span className="text-slate-500 text-xs font-medium">{u.roleTitle}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 pulse-dot' : 'bg-slate-400'}`}></span>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.lastActive}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u.id)}
                          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-xs border border-slate-200"
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast(`Security credential reset dispatched for ${u.name}`)}
                          title="Reset Password / Security Key"
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
