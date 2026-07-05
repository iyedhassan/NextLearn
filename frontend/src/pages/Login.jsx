import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCsrfCookie } from '../api/axios';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false); // New: Toggle password visibility
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await getCsrfCookie();
            await login(formData);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.status === 422) {
                const validationErrors = err.response.data.errors;
                const firstError = Object.values(validationErrors)[0][0];
                setError(firstError);
            } else {
                setError(err.response?.data?.message || 'Identifiants incorrects.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: 'calc(100vh - 100px)', padding: '50px 0'
        }}>
            <div className="glass-effect animate-fade-in" style={{
                padding: '3.5rem', width: '100%', maxWidth: '500px', borderRadius: '30px',
                '@media (max-width: 480px)': { padding: '2rem' } // Responsive padding
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2.5rem' }}>Bon retour <span className="gradient-text">parmi nous</span></h2>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Poursuivez votre ascension pédagogique.</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.9rem' }}>Adresse Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="votre@email.com"
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)', color: 'white', outline: 'none'
                            }}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '2rem', position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.9rem' }}>Mot de passe</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)', color: 'white', outline: 'none'
                            }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '2.5rem', background: 'none', color: 'var(--text-dim)', border: 'none' }}>
                            {showPassword ? 'Cacher' : 'Montrer'}
                        </button>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textAlign: 'center' }}>Comptes de test :</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <code style={{ color: 'var(--accent)' }}>admin@gmail.com / 123456789 (Admin)</code>
                            <code style={{ color: 'var(--primary)' }}>instructor@gmail.com / 123456789 (Tuteur)</code>
                        </div>
                    </div>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Pas encore de compte ? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Créer un compte</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
