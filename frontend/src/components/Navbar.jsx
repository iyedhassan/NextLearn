import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenuAlt3, HiOutlineX, HiOutlineBell, HiOutlineHeart, HiOutlineShoppingCart, HiLogout } from 'react-icons/hi';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const [favCount, setFavCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentQuery = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(currentQuery);

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

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (user) {
            if (user.role !== 'Admin' && user.role !== 'Tutor') {
                // Fetch favorites count
                api.get('/favorites')
                    .then(res => setFavCount(res.data.length))
                    .catch(err => console.error(err));
            }

            // Fetch notifications for everyone (as requested 'pas de Suppression des Notifications')
            fetchNotifications();

            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                api.get('/notifications?per_page=5'),
                api.get('/notifications/unread-count')
            ]);
            setNotifications(notifRes.data.data || []);
            setUnreadCount(countRes.data.count || 0);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.post(`/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    useEffect(() => {
        setSearchQuery(currentQuery);
    }, [currentQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleProtectedAction = (e, target) => {
        if (!user) {
            e.preventDefault();
            alert("Veuillez vous connecter pour accéder à cet espace.");
            navigate('/login');
            return;
        }
        if (target) navigate(target);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (!user) {
                alert("Veuillez vous connecter pour effectuer une recherche.");
                navigate('/login');
                return;
            }
            if (searchQuery.trim()) {
                navigate(`/courses?q=${encodeURIComponent(searchQuery)}`);
                setMobileMenuOpen(false);
            }
        }
    };

    const scrollToSection = (id) => {
        if (location.pathname !== '/') {
            window.location.href = '/#' + id;
            return;
        }
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };



    return (
        <nav className={`nav-fixed ${scrolled ? 'nav-scrolled' : ''}`}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', height: '100%' }}>
                {/* LOGO */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', flexShrink: 0 }}>
                    <img src="/logo.jpg" alt="Logo NextLearn" style={{ height: '35px', borderRadius: '8px' }} />
                    <span className="desktop-only" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>NextLearn</span>
                </Link>

                {/* LINKS */}
                <div className="nav-links desktop-only" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexShrink: 0 }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', opacity: 0.9 }}>Accueil</Link>
                    <Link to="/courses" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}>Cours</Link>
                    <Link to="/users" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}>Personnes</Link>
                    <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>À propos</button>
                </div>

                {/* SEARCH BAR (Udemy Style) - Hide on Courses page */}
                {!location.pathname.startsWith('/courses') && (
                    <div className="desktop-only" style={{ flexGrow: 1, maxWidth: '400px', position: 'relative' }}>
                        <HiMagnifyingGlass
                            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', cursor: 'pointer' }}
                            size={18}
                            onClick={handleSearchSubmit}
                        />
                        <input
                            type="search"
                            placeholder="Rechercher un cours..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchSubmit}
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem 0.6rem 2.8rem',
                                borderRadius: '50px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.85rem'
                            }}
                        />
                    </div>
                )}

                {/* ACTIONS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginLeft: 'auto' }}>
                    {user ? (
                        <>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <Link to="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '800', fontSize: '0.85rem', marginRight: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {user.role === 'Admin' ? 'ADMINISTRATION' : user.role === 'Tutor' ? 'DASHBOARD TUTEUR' : 'Mes Cours'}
                                </Link>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {user.role !== 'Admin' && user.role !== 'Tutor' && (
                                        <>
                                            <Link to="/dashboard?tab=favorites" style={{ color: 'white', position: 'relative' }}>
                                                <HiOutlineHeart size={22} />
                                                {favCount > 0 && (
                                                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent)', color: 'black', fontSize: '0.6rem', fontWeight: '800', padding: '1px 4px', borderRadius: '10px' }}>
                                                        {favCount}
                                                    </span>
                                                )}
                                            </Link>

                                            <Link to="/cart" style={{ color: 'white', position: 'relative' }}>
                                                <HiOutlineShoppingCart size={22} />
                                                {itemCount > 0 && (
                                                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', fontSize: '0.6rem', fontWeight: '800', padding: '1px 4px', borderRadius: '10px' }}>
                                                        {itemCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </>
                                    )}

                                    <div style={{ position: 'relative' }}>
                                        <HiOutlineBell size={22} style={{ cursor: 'pointer', color: 'white' }} onClick={() => setShowNotifications(!showNotifications)} />
                                        {unreadCount > 0 && (
                                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', fontSize: '0.6rem', fontWeight: '800', padding: '1px 4px', borderRadius: '10px' }}>{unreadCount}</span>
                                        )}

                                        {showNotifications && (
                                            <div className="glass-effect animate-slide-up" style={{
                                                position: 'absolute', top: '40px', right: '0', width: '320px', borderRadius: '15px', padding: '1rem', zIndex: 1100, maxHeight: '400px', overflowY: 'auto'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Notifications</h4>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await api.post('/notifications/read-all');
                                                                    fetchNotifications();
                                                                } catch (err) {
                                                                    console.error(err);
                                                                }
                                                            }}
                                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', cursor: 'pointer' }}
                                                        >
                                                            Tout marquer comme lu
                                                        </button>
                                                    )}
                                                </div>
                                                {notifications.length > 0 ? notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                                                        style={{
                                                            padding: '0.8rem',
                                                            marginBottom: '0.5rem',
                                                            borderRadius: '8px',
                                                            background: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.1)',
                                                            border: '1px solid var(--glass-border)',
                                                            fontSize: '0.75rem',
                                                            cursor: n.is_read ? 'default' : 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                            <div style={{ fontWeight: '700', color: 'white', fontSize: '0.8rem' }}>{n.title}</div>
                                                            {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                                                        </div>
                                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginBottom: '0.3rem' }}>{n.message}</div>
                                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>{new Date(n.created_at).toLocaleString('fr-FR')}</div>
                                                    </div>
                                                )) : (
                                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                                        Aucune notification
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Link to="/profile" style={{
                                    width: '35px', height: '35px', borderRadius: '50%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white', textDecoration: 'none', fontSize: '0.75rem', overflow: 'hidden', border: '1px solid var(--glass-border)'
                                }}>
                                    {user.profile_photo_path ? (
                                        <img src={getFullImageUrl(user.profile_photo_path)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        user.name.substring(0, 2).toUpperCase()
                                    )}
                                </Link>

                                <button onClick={logout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <HiLogout size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', alignSelf: 'center' }}>Connexion</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', borderRadius: '10px', fontSize: '0.8rem' }}>Rejoindre</Link>
                        </div>
                    )}

                    <button className="mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        {mobileMenuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="glass-effect animate-slide-up" style={{
                    position: 'absolute', top: '80px', left: '1rem', right: '1rem', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1000
                }}>
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontWeight: '700' }}>Accueil</Link>
                    <button onClick={() => scrollToSection('courses')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontWeight: '600', textAlign: 'left' }}>Cours</button>
                    <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontWeight: '600', textAlign: 'left' }}>À propos</button>
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontWeight: '700' }}>
                                {user.role === 'Admin' ? 'ADMINISTRATION' : user.role === 'Tutor' ? 'DASHBOARD TUTEUR' : 'Mes Cours'}
                            </Link>
                            <button onClick={logout} style={{ background: 'var(--brand-gradient)', border: 'none', color: 'white', padding: '0.8rem', borderRadius: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <HiLogout /> Déconnexion
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontWeight: '700' }}>Connexion</Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center' }}>S'inscrire</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
