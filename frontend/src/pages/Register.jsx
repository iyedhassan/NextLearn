import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getCsrfCookie } from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'Student'
    });
    const [showPassword, setShowPassword] = useState(false); // New: Toggle
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await getCsrfCookie();
            await api.post('/register', formData);
            window.location.href = '/login';
        } catch (err) {
            if (err.response?.status === 422) {
                const validationErrors = err.response.data.errors;
                const firstError = Object.values(validationErrors)[0][0];
                setError(firstError);
            } else {
                setError(err.response?.data?.message || 'Une erreur est survenue lors de l’inscription.');
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
                padding: '3.5rem', width: '100%', maxWidth: '550px', borderRadius: '30px',
                '@media (max-width: 480px)': { padding: '2rem', maxWidth: '90%' } // Responsive
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2.5rem' }}>Rejoignez <span className="gradient-text">NextLearn</span></h2>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Commencez votre voyage vers l'excellence aujourd'hui.</p>
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
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Nom complet</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Jean Dupont"
                            pattern="[a-zA-Z\s]+"
                            title="Le nom ne doit contenir que des lettres."
                            style={{
                                width: '100%', padding: '0.9rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)', color: 'white', outline: 'none'
                            }}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Adresse Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="nom@domaine.com"
                            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                            style={{
                                width: '100%', padding: '0.9rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)', color: 'white', outline: 'none'
                            }}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.2rem', position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Mot de passe</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            placeholder="••••••••"
                            minLength="8"
                            style={{
                                width: '100%', padding: '0.9rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)', color: 'white', outline: 'none'
                            }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '2.5rem', background: 'none', color: 'var(--text-dim)', border: 'none' }}>
                            {showPassword ? 'Cacher' : 'Montrer'}
                        </button>
                        <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.4rem', display: 'block' }}>
                            Min. 8 caractères, 1 majuscule, 1 chiffre et 1 symbole.
                        </small>
                    </div>
                    <div className="form-group" style={{ marginBottom: '2rem', position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Confirmer le mot de passe</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '0.9rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)', color: 'white', outline: 'none'
                            }}
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Création en cours...' : 'Créer mon compte'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Déjà inscrit ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
