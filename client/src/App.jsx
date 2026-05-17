import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import RoleRoute from './components/RoleRoute'
import JobListPage from './pages/JobListPage'
import JobDetailPage from './pages/JobDetailPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import PendingRecruitersPage from './pages/PendingRecruitersPage'
import RecommendedJobsPage from './pages/RecommendedJobsPage'
import SavedJobsPage from './pages/SavedJobsPage'
import MyApplicationsPage from './pages/MyApplicationsPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<div>HomePage — coming soon (Hassan)</div>} />
          <Route path="/login" element={<div>LoginPage</div>} />
          <Route path="/register" element={<div>RegisterPage</div>} />
          <Route path="/forgot-password" element={<div>ForgotPasswordPage</div>} />
          <Route path="/reset-password/:token" element={<div>ResetPasswordPage</div>} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* Job Seeker Routes */}
          <Route path="/jobs/recommended" element={
            <RoleRoute roles={['jobSeeker']}>
              <RecommendedJobsPage />
            </RoleRoute>
          } />
          <Route path="/jobs/saved" element={
            <RoleRoute roles={['jobSeeker']}>
              <SavedJobsPage />
            </RoleRoute>
          } />
          <Route path="/profile" element={
            <RoleRoute roles={['jobSeeker']}>
              <div>ProfilePage</div>
            </RoleRoute>
          } />
          <Route path="/profile/edit" element={
            <PrivateRoute>
              <div>EditProfilePage</div>
            </PrivateRoute>
          } />
          <Route path="/profile/change-password" element={
            <PrivateRoute>
              <ChangePasswordPage />
            </PrivateRoute>
          } />
          <Route path="/applications/my" element={
            <RoleRoute roles={['jobSeeker']}>
              <MyApplicationsPage />
            </RoleRoute>
          } />

          {/* Recruiter Routes */}
          <Route path="/recruiter/dashboard" element={
            <RoleRoute roles={['recruiter']}>
              <div>RecruiterDashboard</div>
            </RoleRoute>
          } />
          <Route path="/recruiter/jobs/create" element={
            <RoleRoute roles={['recruiter']}>
              <div>CreateJobPage</div>
            </RoleRoute>
          } />
          <Route path="/recruiter/jobs/:id/edit" element={
            <RoleRoute roles={['recruiter']}>
              <div>EditJobPage</div>
            </RoleRoute>
          } />
          <Route path="/recruiter/applicants/:jobId" element={
            <RoleRoute roles={['recruiter']}>
              <div>ApplicantsPage</div>
            </RoleRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <RoleRoute roles={['admin']}>
              <div>AdminDashboard</div>
            </RoleRoute>
          } />
          <Route path="/admin/recruiters" element={
            <RoleRoute roles={['admin']}>
              <PendingRecruitersPage />
            </RoleRoute>
          } />
          <Route path="/admin/jobs" element={
            <RoleRoute roles={['admin']}>
              <div>AdminJobsPage</div>
            </RoleRoute>
          } />
          <Route path="/admin/users" element={
            <RoleRoute roles={['admin']}>
              <div>AdminUsersPage</div>
            </RoleRoute>
          } />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App