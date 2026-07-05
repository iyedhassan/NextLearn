import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import TutorDashboard from '../components/dashboards/TutorDashboard'; // Renamed to TutorDashboard for consistency with your role 'Tutor'
import AdminDashboard from '../components/dashboards/AdminDashboard';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p style={{ color: 'var(--text-dim)', marginTop: '1rem' }}>Chargement de votre espace...</p>
        </div>
    );

    if (!user) return <Navigate to="/login" />;

    // Render based on role (updated for 'Tutor' as Instructor)
    switch (user.role) {
        case 'Admin':
            return <AdminDashboard user={user} />;
        case 'Tutor':
            return <TutorDashboard user={user} />;
        default:
            return <StudentDashboard user={user} />;
    }
};

export default Dashboard;
