import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    type: 'full-time',
    salary: '',
    totalSlots: '',
  });
  const [requirements, setRequirements] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdJob, setCreatedJob] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setRequirements([...requirements, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    api.post('/jobs', { ...formData, requirements })
      .then(res => setCreatedJob(res.data.job))
      .catch(err => setError(err.response?.data?.message || 'Something went wrong'))
      .finally(() => setLoading(false));
  };

  if (createdJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Created!</h2>
          <p className="text-gray-500 mb-4">AI assigned category:</p>
          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
            {createdJob.category}
          </span>
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="mt-6 block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Job</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input name="title" value={formData.title} onChange={handleChange} placeholder="Job Title" required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <input name="company" value={formData.company} onChange={handleChange} placeholder="Company" required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required rows={4}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <select name="type" value={formData.type} onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
          </select>

          <input name="salary" value={formData.salary} onChange={handleChange} placeholder="Salary (optional)"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />

          <input name="totalSlots" value={formData.totalSlots} onChange={handleChange} placeholder="Total Slots" required type="number"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />

          {/* Requirements Tag Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {requirements.map((req, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {req}
                  <button type="button" onClick={() => removeTag(i)} className="text-blue-400 hover:text-red-500 font-bold">×</button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a requirement and press Enter"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Spinner /> : 'Create Job'}
          </button>

        </form>
      </div>
    </div>
  );
}