import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import SkillChip from '../components/SkillChip';

export default function ApplicantsPage() {
  const { jobId } = useParams();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}/applicants`);
        setApplications(res.data.applications || []);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load applicants.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const res = await api.patch(
        `/applications/${applicationId}/status`,
        { status: newStatus }
      );

      const updatedApplication = res.data.application;

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? updatedApplication : app
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message || 'Failed to update status.'
      );
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="px-6 py-8 text-red-600 font-medium">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Applicants
        </h1>
        <p className="text-gray-600">
          No applicants yet for this job.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Applicants
      </h1>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Name
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Email
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Skills
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {applications.map((application) => (
              <tr
                key={application._id}
                className="border-b border-gray-100"
              >
                <td className="px-4 py-4">
                  {application.user?.name || 'N/A'}
                </td>

                <td className="px-4 py-4">
                  {application.user?.email || 'N/A'}
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {application.user?.skills &&
                    application.user.skills.length > 0 ? (
                      application.user.skills.map((skill, index) => (
                        <SkillChip
                          key={index}
                          skill={skill}
                        />
                      ))
                    ) : (
                      <span className="text-gray-400">
                        No skills
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <select
                    value={application.status}
                    onChange={(e) =>
                      handleStatusChange(
                        application._id,
                        e.target.value
                      )
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="pending">
                      pending
                    </option>
                    <option value="shortlisted">
                      shortlisted
                    </option>
                    <option value="rejected">
                      rejected
                    </option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}