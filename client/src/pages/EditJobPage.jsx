import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function EditJobPage() {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(res => {
        const job = res.data.job;
        setFormData({
          title: job.title || '',
          company: job.company || '',
          description: job.description || '',
          location: job.location || '',
          type: job.type || 'full-time',
          salary: job.salary || '',
          totalSlots: job.totalSlots || '',
        });
        setRequirements(job.requirements || []);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load job'))
      .finally(() => setLoading(false));
  }, [id]);

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
    setSubmitting(true);
    setError('');
    setSuccess('');

    api.patch(`/jobs/${id}`, { ...formData, requirements })
      .then(() => setSuccess('Job updated successfully!'))
      .catch(err => setError(err.response?.data?.message || 'Something went wrong'))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Job</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

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

          <div className="flex gap-4">
            <button type="submit" disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <Spinner /> : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/recruiter/dashboard')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}