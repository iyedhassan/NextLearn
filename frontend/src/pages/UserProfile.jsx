import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { HiUserCircle, HiAcademicCap, HiStar, HiEnvelope, HiMapPin, HiGlobeAlt, HiArrowLeft } from 'react-icons/hi2';

const getFullImageUrl = (path) => {
    if (!path) return null;
    const baseUrl = 'http://localhost:8000';
    if (path.startsWith('http')) {
        return path.replace('http://localhost', baseUrl);
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (!cleanPath.startsWith('/storage/')) {
        return `${baseUrl}/storage${cleanPath}`;
    }
    return `${baseUrl}${cleanPath}`;
};

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await api.get(`/users/${id}`);
            setUser(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '150px 0', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-dim)' }}>Chargement du profil...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: '150px 0', textAlign: 'center', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
                <h2>Utilisateur non trouvé</h2>
                <button onClick={() => navigate('/users')} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                    Retour à la recherche
                </button>
            </div>
        );
    }

    const person = user.person || {};

    return (
        <div style={{ padding: '120px 0', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
            <div className="container">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary"
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <HiArrowLeft /> Retour
                </button>

                <div className="glass-effect" style={{ borderRadius: '30px', overflow: 'hidden' }}>
                    {/* Header Banner */}
                    <div style={{
                        height: '200px',
                        background: 'var(--brand-gradient)',
                        position: 'relative'
                    }}></div>

                    {/* Profile Info */}
                    <div style={{ padding: '0 3rem 3rem', marginTop: '-80px', position: 'relative' }}>
                        {/* Avatar */}
                        <div style={{ marginBottom: '2rem' }}>
                            {user.profile_photo_path ? (
                                <img
                                    src={getFullImageUrl(user.profile_photo_path)}
                                    alt={user.name}
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '5px solid var(--dark)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    background: 'var(--brand-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    fontWeight: '800',
                                    border: '5px solid var(--dark)'
                                }}>
                                    {user.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Name and Role */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                                {person.first_name && person.last_name
                                    ? `${person.first_name} ${person.last_name}`
                                    : user.name}
                            </h1>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                padding: '0.5rem 1rem',
                                borderRadius: '50px',
                                color: 'var(--primary)',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}>
                                {user.role === 'Tutor' && <HiAcademicCap size={20} />}
                                {user.role === 'Student' && <HiUserCircle size={20} />}
                                {user.role === 'Tutor' ? 'Instructeur' : user.role === 'Student' ? 'Étudiant' : 'Administrateur'}
                            </div>
                        </div>

                        {/* Headline */}
                        {person.headline && (
                            <p style={{
                                fontSize: '1.2rem',
                                color: 'var(--text-dim)',
                                marginBottom: '2rem',
                                fontStyle: 'italic'
                            }}>
                                "{person.headline}"
                            </p>
                        )}

                        {/* Bio */}
                        {person.bio && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>À propos</h3>
                                <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
                                    {person.bio}
                                </p>
                            </div>
                        )}

                        {/* Contact Info */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1.5rem',
                            marginTop: '2rem'
                        }}>
                            {user.email && (
                                <div className="glass-effect" style={{ padding: '1.5rem', borderRadius: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                        <HiEnvelope size={20} color="var(--primary)" />
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Email</h4>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '1rem' }}>{user.email}</p>
                                </div>
                            )}

                            {person.location && (
                                <div className="glass-effect" style={{ padding: '1.5rem', borderRadius: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                        <HiMapPin size={20} color="var(--primary)" />
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Localisation</h4>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '1rem' }}>{person.location}</p>
                                </div>
                            )}

                            {person.website && (
                                <div className="glass-effect" style={{ padding: '1.5rem', borderRadius: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                        <HiGlobeAlt size={20} color="var(--primary)" />
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Site web</h4>
                                    </div>
                                    <a href={person.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                        {person.website}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Skills/Specialization */}
                        {person.specialization && (
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Spécialisation</h3>
                                <div style={{
                                    display: 'inline-block',
                                    background: 'var(--brand-gradient)',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '50px',
                                    fontWeight: '600'
                                }}>
                                    {person.specialization}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
