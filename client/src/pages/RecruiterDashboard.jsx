import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/jobs/my-jobs')
      .then(res => setJobs(res.data.jobs))
      .catch(err => setError(err.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">

        {/* Pending Banner */}
        {user?.status === 'pending' && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
            Your account is awaiting admin approval. You cannot post jobs yet.
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Job Posts</h1>
          {user?.status !== 'pending' && (
            <button
              onClick={() => navigate('/recruiter/jobs/create')}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              + Create Job
            </button>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Empty State */}
        {jobs.length === 0 && !error && (
          <p className="text-gray-500">You haven't posted any jobs yet.</p>
        )}

        {/* Jobs List */}
        <div className="grid gap-4">
          {jobs.map(job => (
            <div key={job._id} className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                <p className="text-gray-500">{job.company}</p>
                <div className="flex gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{job.category}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {job.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{job.applicantCount}</p>
                <p className="text-gray-400 text-sm">applicants</p>
                <button
                  onClick={() => navigate(`/recruiter/jobs/${job._id}/edit`)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}