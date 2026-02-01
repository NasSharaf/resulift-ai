'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  companyName: string | null;
  jobTitle: string | null;
  applicationStatus: string;
  appliedAt: string | null;
  atsScoreBefore: number | null;
  atsScoreAfter: number | null;
  atsImprovement: number | null;
  notes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: 'generated', label: 'Generated', color: 'bg-gray-100 text-gray-800' },
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'offer', label: 'Offer', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (id: string, field: string, value: any) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      // Optimistic update
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, [field]: value } : app))
      );
    } catch (err) {
      console.error('Failed to update:', err);
      // Revert on error
      fetchApplications();
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete application');
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await fetch(`/api/applications/export?format=${format}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-applications-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Failed to export applications');
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="pt-20 px-6 max-w-7xl mx-auto">
        <div className="text-center py-12">Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 px-6 max-w-7xl mx-auto">
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="pt-7 px-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
          >
            Export CSV
          </button>
          {applications.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete all applications?')) {
                  Promise.all(applications.map(app => deleteApplication(app.id)))
                    .then(() => fetchApplications());
                }
              }}
              className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
            >
              Delete All
            </button>
          )}
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">No applications yet</p>
          <p className="text-gray-500 text-sm">
            Applications will automatically appear here when you generate tailored resumes
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    ATS Before
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    ATS After
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Improvement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={app.companyName || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setApplications(prev =>
                            prev.map(a => (a.id === app.id ? { ...a, companyName: value } : a))
                          );
                        }}
                        onBlur={(e) => updateApplication(app.id, 'companyName', e.target.value)}
                        className="w-full border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm"
                        placeholder="Company name"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={app.jobTitle || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setApplications(prev =>
                            prev.map(a => (a.id === app.id ? { ...a, jobTitle: value } : a))
                          );
                        }}
                        onBlur={(e) => updateApplication(app.id, 'jobTitle', e.target.value)}
                        className="w-full border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm"
                        placeholder="Job title"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={app.applicationStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          // Auto-fill applied date when status changes to "applied"
                          if (newStatus === 'applied' && !app.appliedAt) {
                            updateApplication(app.id, 'appliedAt', new Date().toISOString());
                          }
                          updateApplication(app.id, 'applicationStatus', newStatus);
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(app.applicationStatus)}`}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="date"
                        value={app.appliedAt ? new Date(app.appliedAt).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const value = e.target.value ? new Date(e.target.value).toISOString() : null;
                          updateApplication(app.id, 'appliedAt', value);
                        }}
                        className="border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.atsScoreBefore || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.atsScoreAfter || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.atsImprovement !== null ? (
                        <span className={`font-semibold ${app.atsImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {app.atsImprovement > 0 ? '+' : ''}{app.atsImprovement}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={app.notes || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setApplications(prev =>
                            prev.map(a => (a.id === app.id ? { ...a, notes: value } : a))
                          );
                        }}
                        onBlur={(e) => updateApplication(app.id, 'notes', e.target.value)}
                        className="w-full border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm"
                        placeholder="Add notes..."
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => deleteApplication(app.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
