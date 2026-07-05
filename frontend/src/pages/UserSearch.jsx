import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { HiMagnifyingGlass, HiUserCircle, HiAcademicCap, HiStar } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

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

const UserSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const query = searchParams.get('q') || '';
    const role = searchParams.get('role') || '';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(query);

    useEffect(() => {
        fetchUsers();
    }, [query, role]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (role) params.append('role', role);

            const response = await api.get(`/users?${params.toString()}`);
            setUsers(response.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = {};
        if (searchInput) params.q = searchInput;
        if (role) params.role = role;
        setSearchParams(params);
    };

    const handleRoleFilter = (selectedRole) => {
        const params = {};
        if (query) params.q = query;
        if (selectedRole && selectedRole !== role) params.role = selectedRole;
        setSearchParams(params);
    };

    const handleViewProfile = (id) => {
        if (!user) {
            alert("Veuillez vous connecter pour voir le profil complet.");
            navigate('/login');
            return;
        }
        navigate(`/profile/${id}`);
    };

    return (
        <div style={{ padding: '120px 0', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
            <div className="container">
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        Rechercher des <span className="gradient-text">Personnes</span>
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
                        Trouvez des instructeurs, étudiants et membres de la communauté
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="glass-effect" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem 1.5rem',
                    borderRadius: '50px',
                    marginBottom: '2rem',
                    maxWidth: '600px'
                }}>
                    <HiMagnifyingGlass size={24} color="var(--text-dim)" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            marginLeft: '1rem',
                            width: '100%',
                            outline: 'none',
                            fontSize: '1rem'
                        }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                        Rechercher
                    </button>
                </form>

                {/* Role Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    {['', 'Student', 'Tutor', 'Admin'].map(r => (
                        <button
                            key={r}
                            onClick={() => handleRoleFilter(r)}
                            className={`btn ${role === r ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.6rem 1.2rem' }}
                        >
                            {r === '' ? 'Tous' : r === 'Student' ? 'Étudiants' : r === 'Tutor' ? 'Instructeurs' : 'Admins'}
                        </button>
                    ))}
                </div>

                {/* Results */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <div className="animate-pulse" style={{ color: 'var(--text-dim)' }}>Recherche en cours...</div>
                    </div>
                ) : users.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {users.map(userItem => (
                            <div
                                key={userItem.id}
                                className="card glass-effect"
                                style={{ padding: '2rem', cursor: 'pointer', transition: 'transform 0.3s' }}
                                onClick={() => handleViewProfile(userItem.id)}
                            >
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    {userItem.profile_photo_path ? (
                                        <img
                                            src={getFullImageUrl(userItem.profile_photo_path)}
                                            alt={userItem.name}
                                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: 'var(--brand-gradient)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem',
                                            fontWeight: '800',
                                            margin: '0 auto'
                                        }}>
                                            {userItem.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                                    {userItem.person?.first_name && userItem.person?.last_name
                                        ? `${userItem.person.first_name} ${userItem.person.last_name}`
                                        : userItem.name}
                                </h3>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1rem',
                                    color: 'var(--accent)',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    {userItem.role === 'Tutor' && <HiAcademicCap size={18} />}
                                    {userItem.role === 'Student' && <HiUserCircle size={18} />}
                                    {userItem.role === 'Tutor' ? 'Instructeur' : userItem.role === 'Student' ? 'Étudiant' : 'Admin'}
                                </div>

                                {userItem.person?.headline && (
                                    <p style={{
                                        color: 'var(--text-dim)',
                                        fontSize: '0.85rem',
                                        textAlign: 'center',
                                        marginBottom: '1rem'
                                    }}>
                                        {userItem.person.headline}
                                    </p>
                                )}

                                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}>
                                    Voir le profil
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-effect" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
                        <HiMagnifyingGlass size={60} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Aucun résultat</h3>
                        <p style={{ color: 'var(--text-dim)' }}>
                            {query ? `Aucun utilisateur trouvé pour "${query}"` : 'Utilisez la barre de recherche pour trouver des personnes'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSearch;
