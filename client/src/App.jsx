import AdminJobsPage from './pages/AdminJobsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import RoleRoute from './components/RoleRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import JobListPage from './pages/JobListPage'
import JobDetailPage from './pages/JobDetailPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import PendingRecruitersPage from './pages/PendingRecruitersPage'
import RecommendedJobsPage from './pages/RecommendedJobsPage'
import SavedJobsPage from './pages/SavedJobsPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import RecruiterDashboard from './pages/RecruiterDashboard'
import CreateJobPage from './pages/CreateJobPage'
import EditJobPage from './pages/EditJobPage'
import AdminDashboard from './pages/AdminDashboard'
import ApplicantsPage from './pages/ApplicantsPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
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
              <ProfilePage />
            </RoleRoute>
          } />
          <Route path="/profile/edit" element={
            <PrivateRoute>
              <EditProfilePage />
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
              <RecruiterDashboard />
            </RoleRoute>
          } />
          <Route path="/recruiter/jobs/create" element={
            <RoleRoute roles={['recruiter']}>
              <CreateJobPage />
            </RoleRoute>
          } />
          <Route path="/recruiter/jobs/:id/edit" element={
            <RoleRoute roles={['recruiter']}>
              <EditJobPage />
            </RoleRoute>
          } />
          <Route path="/recruiter/applicants/:jobId" element={
            <RoleRoute roles={['recruiter']}>
              <ApplicantsPage />
            </RoleRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <RoleRoute roles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          } />
          <Route path="/admin/recruiters" element={
            <RoleRoute roles={['admin']}>
              <PendingRecruitersPage />
            </RoleRoute>
          } />
          <Route path="/admin/jobs" element={
            <RoleRoute roles={['admin']}>
              <AdminJobsPage />
            </RoleRoute>
          } />
          <Route path="/admin/users" element={
            <RoleRoute roles={['admin']}>
              <AdminUsersPage />
            </RoleRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App