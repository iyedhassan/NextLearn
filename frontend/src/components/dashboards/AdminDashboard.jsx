import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    HiUserPlus,
    HiCheck,
    HiXMark,
    HiCurrencyEuro,
    HiShieldCheck,
    HiUsers,
    HiAcademicCap,
    HiBanknotes,
    HiTrash,
    HiMagnifyingGlass
} from 'react-icons/hi2';

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

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({ users: 0, earnings: 0, pendingOrders: 0, courses: 0, pendingPayments: 0 });
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allInvoices, setAllInvoices] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);

    // Payments States
    const [allPayments, setAllPayments] = useState([]); // All payments history
    const [pendingPayments, setPendingPayments] = useState([]); // Only pending for overview
    const [paymentSearch, setPaymentSearch] = useState('');
    const [paymentDateFilter, setPaymentDateFilter] = useState('');
    const [paymentSortOrder, setPaymentSortOrder] = useState('desc'); // 'desc' (newest first) or 'asc'

    // User Filter State
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');

    // Payment Rejection Modal State
    const [rejectingPayment, setRejectingPayment] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const [showTutorForm, setShowTutorForm] = useState(false);
    const [newTutor, setNewTutor] = useState({ name: '', email: '', password: 'Password123!', role: 'Tutor' });

    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [viewingUserMoreData, setViewingUserMoreData] = useState({ admissions: [], invoices: [] });
    const [userData, setUserData] = useState({ name: '', email: '', role: '', state: '' });

    const handleViewUserDetails = async (u) => {
        setViewingUser(u);
        setViewingUserMoreData({ admissions: [], invoices: [] });
        try {
            const [admRes, invRes] = await Promise.all([
                api.get(`/admissions?user_id=${u.id}`),
                api.get(`/invoices?user_id=${u.id}`)
            ]);
            setViewingUserMoreData({
                admissions: admRes.data.data || [],
                invoices: invRes.data.data || []
            });
        } catch (err) {
            console.error("Error fetching user details", err);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const fetchSafe = async (url) => {
                try { return (await api.get(url)).data; }
                catch (e) { console.error(`Fetch error ${url}`, e); return { data: [], total: 0 }; }
            };

            const [usersData, pendingInvData, allInvData, allCoursesData, pendCoursesData, allPayData] = await Promise.all([
                fetchSafe('/users'),
                fetchSafe('/invoices?status=Pending'),
                fetchSafe('/invoices'),
                fetchSafe('/forms'),
                fetchSafe('/forms?state=Pending'),
                fetchSafe('/payments') // Get ALL payments now
            ]);

            const users = usersData.data || [];
            const pInvoices = pendingInvData.data || [];
            const aInvoices = allInvData.data || [];
            const pCourses = pendCoursesData.data || [];
            const paymentsList = allPayData.data || [];

            setAllUsers(users);
            setPendingInvoices(pInvoices);
            setAllInvoices(aInvoices);
            setPendingCourses(pCourses);

            setAllPayments(paymentsList);
            const pendPay = paymentsList.filter(p => p.status === 'pending');
            setPendingPayments(pendPay);

            const earnings = aInvoices.reduce((acc, curr) => acc + (curr.status === 'Paid' ? parseFloat(curr.total) : 0), 0) || 0;

            setStats({
                users: usersData.total || users.length || 0,
                earnings: earnings,
                pendingOrders: pendPay.length,
                courses: allCoursesData.total || (allCoursesData.data?.length || 0),
                pendingPayments: pendPay.length
            });
        } catch (err) {
            console.error("General admin data fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Filter Logic ---
    const getFilteredUsers = () => {
        let data = [...allUsers];
        if (userSearch) {
            const lower = userSearch.toLowerCase();
            data = data.filter(u => (u.name || '').toLowerCase().includes(lower) || (u.email || '').toLowerCase().includes(lower));
        }
        if (userRoleFilter) data = data.filter(u => u.role === userRoleFilter);
        return data;
    };

    const getFilteredPayments = () => {
        let data = [...allPayments];

        // Search
        if (paymentSearch) {
            const lowerInfo = paymentSearch.toLowerCase();
            data = data.filter(p =>
                (p.user?.name || '').toLowerCase().includes(lowerInfo) ||
                (p.user?.email || '').toLowerCase().includes(lowerInfo) ||
                (p.payment_number || '').toLowerCase().includes(lowerInfo)
            );
        }

        // Date Filter
        if (paymentDateFilter) {
            data = data.filter(p => p.created_at?.startsWith(paymentDateFilter));
        }

        // Sort
        data.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return paymentSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        return data;
    };

    // --- Unified Action Handler for buttons ---
    const executePaymentAction = async (action, id, payload = null) => {
        console.log(`Executing ${action} on Payment ${id}`);
        try {
            if (action === 'accept') {
                await api.post(`/payments/${id}/accept`);
                alert("Paiement validé !");
            } else if (action === 'delete') {
                await api.delete(`/payments/${id}`);
                alert("Paiement supprimé !");
            } else if (action === 'reject') {
                await api.post(`/payments/${id}/reject`, payload);
                alert("Paiement rejeté !");
            }
            fetchAdminData();
        } catch (err) {
            console.error(`Error during ${action}:`, err);
            alert("Erreur: " + (err.response?.data?.message || err.message));
        }
    };

    const confirmAndExecute = (action, id) => {
        if (action === 'accept') {
            if (window.confirm("Valider ce paiement ?")) executePaymentAction('accept', id);
        } else if (action === 'delete') {
            if (window.confirm("Supprimer ce paiement ?")) executePaymentAction('delete', id);
        }
    };

    const submitReject = (e) => {
        e.preventDefault();
        if (!rejectingPayment) return;
        executePaymentAction('reject', rejectingPayment.id, { reason: rejectionReason });
        setRejectingPayment(null);
        setRejectionReason('');
    };

    // Components
    const PaymentActionButtons = ({ pay }) => {
        // Only show actions if pending
        if (pay.status !== 'pending') {
            return (
                <span style={{
                    fontSize: '0.75rem', fontWeight: 'bold',
                    color: pay.status === 'accepted' ? '#22c55e' : '#ef4444',
                    background: pay.status === 'accepted' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '4px 8px', borderRadius: '4px'
                }}>
                    {pay.status === 'accepted' ? 'Validé' : 'Rejeté'}
                </span>
            );
        }
        return (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); confirmAndExecute('accept', pay.id); }}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '50px', display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}
                    title="Valider"
                >
                    <HiCheck size={18} /> Valider
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); setRejectingPayment(pay); }}
                    style={{
                        width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                        background: 'rgba(255,255,255,0.05)', color: '#f59e0b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    title="Rejeter"
                >
                    <HiXMark size={18} />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); confirmAndExecute('delete', pay.id); }}
                    style={{
                        width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                        background: 'rgba(255,255,255,0.05)', color: '#ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    title="Supprimer définitivement"
                >
                    <HiTrash size={16} />
                </button>
            </div>
        );
    };

    const handleCreateTutor = async (e) => { e.preventDefault(); try { await api.post('/register', { ...newTutor, password_confirmation: newTutor.password }); setShowTutorForm(false); setNewTutor({ name: '', email: '', password: 'Password123!', role: 'Tutor' }); fetchAdminData(); alert("Tuteur créé !"); } catch (err) { alert("Erreur création tuteur"); } };
    const handleApproveCourse = async (courseId) => { try { await api.put(`/forms/${courseId}`, { state: 'Published' }); fetchAdminData(); alert("Cours publié !"); } catch (err) { alert("Erreur publication"); } };
    const handleRejectCourse = async (courseId) => { if (!window.confirm("Refuser ce cours ?")) return; try { await api.put(`/forms/${courseId}`, { state: 'Archived' }); fetchAdminData(); } catch (err) { alert("Erreur refus"); } };
    const handleEditUser = (u) => { setEditingUser(u); setUserData({ name: u.name, email: u.email, role: u.role, state: u.state || 'Active' }); };
    const handleUpdateUser = async (e) => { e.preventDefault(); try { await api.put(`/users/${editingUser.id}`, userData); setEditingUser(null); fetchAdminData(); alert("Utilisateur mis à jour !"); } catch (err) { alert("Erreur mise à jour"); } };
    const handleDeleteUser = async (id) => { if (!window.confirm("Supprimer cet utilisateur ?")) return; try { await api.delete(`/users/${id}`); fetchAdminData(); alert("Utilisateur supprimé !"); } catch (err) { alert("Erreur suppression"); } };

    if (loading) return <div className="container" style={{ padding: '150px 0', textAlign: 'center' }}><div className="animate-pulse">Chargement de l'administration...</div></div>;

    return (
        <div className="container" style={{ padding: '120px 0' }}>
            <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                <div className="animate-fade-in">
                    <span style={{ color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Administration Centrale</span>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginTop: '0.5rem' }}>Espace de Contrôle</h1>
                </div>
                <div className="glass-effect" style={{ display: 'flex', padding: '0.2rem', borderRadius: '16px', gap: '0.2rem' }}>
                    {[{ id: 'overview', label: 'Aperçu', icon: <HiShieldCheck /> }, { id: 'payments', label: 'Paiements', icon: <HiCurrencyEuro />, count: pendingPayments.length }, { id: 'users', label: 'Utilisateurs', icon: <HiUsers /> }, { id: 'courses', label: 'Cours', icon: <HiAcademicCap />, count: pendingCourses.length }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.2rem', borderRadius: '12px', border: 'none', background: activeTab === tab.id ? 'var(--brand-gradient)' : 'transparent', color: activeTab === tab.id ? 'white' : 'var(--text-dim)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative' }}>
                            {tab.icon} {tab.label}
                            {tab.count > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', border: '2px solid var(--dark)' }}>{tab.count}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="animate-fade-in">
                    <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                        {[{ label: 'Utilisateurs', val: stats.users, icon: <HiUsers />, color: 'var(--primary)' }, { label: 'Cours', val: stats.courses, icon: <HiAcademicCap />, color: 'var(--accent)' }, { label: 'Paiements', val: stats.pendingPayments, icon: <HiCurrencyEuro />, color: '#f59e0b' }, { label: 'Revenus', val: `${stats.earnings.toFixed(2)} €`, icon: <HiBanknotes />, color: '#10b981' }].map((s, i) => (
                            <div key={i} className="card glass-effect" style={{ padding: '2rem', textAlign: 'center' }}>
                                <div style={{ color: s.color, marginBottom: '0.8rem', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800' }}>{s.val}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="card glass-effect" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0 }}>Paiements récents à valider</h3>
                                    <span style={{ background: '#f59e0b22', color: '#f59e0b', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800' }}>{pendingPayments.length}</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table>
                                        <thead><tr><th>Utilisateur</th><th>Cours</th><th>Montant</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {pendingPayments.slice(0, 10).map(pay => (
                                                <tr key={pay.id}>
                                                    <td><div style={{ fontWeight: '700' }}>{pay.user?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{pay.user?.email}</div></td>
                                                    <td><div style={{ fontSize: '0.85rem' }}>{pay.form?.title || 'Cours'}</div><div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{pay.payment_number}</div></td>
                                                    <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{pay.amount} €</td>
                                                    <td><PaymentActionButtons pay={pay} /></td>
                                                </tr>
                                            ))}
                                            {pendingPayments.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Aucun paiement.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="card glass-effect" style={{ textAlign: 'center', paddingBottom: '3rem' }}>
                                <HiUserPlus size={40} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                                <h3>Recrutement Instructeur</h3>
                                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowTutorForm(true)}>Ajouter un Expert</button>
                            </div>

                            <div className="card glass-effect">
                                <h4 style={{ marginBottom: '1.5rem' }}>Derniers Comptes Créés</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {allUsers.slice(0, 5).map(u => (
                                        <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                                    {u.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{u.name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{u.role}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('users')}>Voir tous les comptes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'payments' && (
                <div className="animate-fade-in card glass-effect" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Gestion des Transactions</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Historique complet et validation.</p>
                        </div>
                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <HiMagnifyingGlass style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                <input
                                    type="text"
                                    placeholder="Étudiant, Réf..."
                                    value={paymentSearch}
                                    onChange={e => setPaymentSearch(e.target.value)}
                                    style={{ padding: '0.4rem 0.4rem 0.4rem 2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                            <input
                                type="date"
                                value={paymentDateFilter}
                                onChange={e => setPaymentDateFilter(e.target.value)}
                                style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                            />
                            <button
                                onClick={() => setPaymentSortOrder(paymentSortOrder === 'asc' ? 'desc' : 'asc')}
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                title="Trier par date"
                            >
                                Date {paymentSortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                    <table>
                        <thead><tr><th>Réf</th><th>Étudiant</th><th>Cours</th><th>Montant</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead>
                        <tbody>
                            {getFilteredPayments().map(pay => (
                                <tr key={pay.id}>
                                    <td><span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{pay.payment_number}</span></td>
                                    <td><div style={{ fontWeight: '700' }}>{pay.user?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{pay.user?.email}</div></td>
                                    <td>{pay.form?.title}</td>
                                    <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{pay.amount} €</td>
                                    <td style={{ color: 'var(--text-dim)' }}>{new Date(pay.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: pay.status === 'accepted' ? 'rgba(34,197,94,0.1)' : pay.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: pay.status === 'accepted' ? '#22c55e' : pay.status === 'pending' ? '#f59e0b' : '#ef4444', borderRadius: '10px' }}>
                                            {pay.status}
                                        </span>
                                    </td>
                                    <td><PaymentActionButtons pay={pay} /></td>
                                </tr>
                            ))}
                            {getFilteredPayments().length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>Aucun résultat.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'courses' && (
                <div className="animate-fade-in card glass-effect" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)' }}> <h3 style={{ margin: 0 }}>Modération des Cours</h3> </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr><th>Image</th><th>Instructeur</th><th>Titre</th><th>Statut</th><th>Actions</th></tr></thead>
                            <tbody>
                                {pendingCourses.map(course => (
                                    <tr key={course.id}>
                                        <td><img src={getFullImageUrl(course.image_url)} alt="" style={{ width: 50, height: 35, borderRadius: 4, objectFit: 'cover' }} /></td>
                                        <td>{course.user?.name}</td>
                                        <td>{course.title}</td>
                                        <td><span className="badge badge-warning">{course.state}</span></td>
                                        <td> <div style={{ display: 'flex', gap: '0.5rem' }}> <button onClick={() => handleApproveCourse(course.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}><HiCheck /></button> <button onClick={() => handleRejectCourse(course.id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }}><HiXMark /></button> </div> </td>
                                    </tr>
                                ))}
                                {pendingCourses.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Aucun cours.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="animate-fade-in card glass-effect" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Gestion Utilisateurs</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <HiMagnifyingGlass style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                <input type="text" placeholder="Rechercher..." value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ padding: '0.4rem 0.4rem 0.4rem 2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                            </div>
                            <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}>
                                <option value="">Tous les rôles</option>
                                <option value="Student">Student</option>
                                <option value="Tutor">Tutor</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <table>
                        <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Actions</th></tr></thead>
                        <tbody>
                            {getFilteredUsers().map(u => (
                                <tr key={u.id}>
                                    <td><div style={{ fontWeight: '700' }}>{u.name}</div></td> <td>{u.email}</td> <td>{u.role}</td>
                                    <td> <div style={{ display: 'flex', gap: '0.5rem' }}> <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleViewUserDetails(u)}>Détails</button> <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleEditUser(u)}>Modifier</button> {u.id !== user.id && (<button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }} onClick={() => handleDeleteUser(u.id)}>Supprimer</button>)} </div> </td>
                                </tr>
                            ))}
                            {getFilteredUsers().length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Aucun utilisateur trouvé.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {rejectingPayment && (
                <div className="modal-overlay" onClick={() => setRejectingPayment(null)}>
                    <div className="card glass-effect animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Rejeter le paiement</h3>
                        <form onSubmit={submitReject}>
                            <textarea className="form-control" rows="3" required placeholder="Motif..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}></textarea>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRejectingPayment(null)}>Annuler</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444' }}>Confirmer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTutorForm && (
                <div className="modal-overlay" onClick={() => setShowTutorForm(false)}>
                    <div className="card glass-effect animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Ajouter un Expert</h3>
                            <button onClick={() => setShowTutorForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><HiXMark size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateTutor}>
                            <div className="form-group"><label>Nom</label><input type="text" className="form-control" required value={newTutor.name} onChange={e => setNewTutor({ ...newTutor, name: e.target.value })} /></div>
                            <div className="form-group"><label>Email</label><input type="email" className="form-control" required value={newTutor.email} onChange={e => setNewTutor({ ...newTutor, email: e.target.value })} /></div>
                            <div className="form-group"><label>Password</label><input type="text" className="form-control" value={newTutor.password} onChange={e => setNewTutor({ ...newTutor, password: e.target.value })} /></div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Créer</button>
                        </form>
                    </div>
                </div>
            )}

            {viewingUser && (
                <div className="modal-overlay" onClick={() => setViewingUser(null)}>
                    <div className="card glass-effect animate-slide-up" style={{ width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h3>Détails Utilisateur</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                            <div>
                                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Inscriptions</h4>
                                {viewingUserMoreData.admissions.length > 0 ? viewingUserMoreData.admissions.map(adm => (
                                    <div key={adm.id} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontWeight: '600' }}>{adm.form?.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: adm.is_approved ? '#22c55e' : '#f59e0b' }}>{adm.is_approved ? 'Validé' : 'En attente'}</div>
                                    </div>
                                )) : <div style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>Aucune.</div>}
                            </div>
                            <div>
                                <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Factures</h4>
                                {viewingUserMoreData.invoices.length > 0 ? viewingUserMoreData.invoices.map(inv => (
                                    <div key={inv.id} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontFamily: 'monospace' }}>#{inv.invoice_number.slice(-8)}</div>
                                        <div style={{ fontWeight: '700' }}>{inv.total} €</div>
                                    </div>
                                )) : <div style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>Aucune.</div>}
                            </div>
                        </div>
                        <button className="btn btn-secondary" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setViewingUser(null)}>Fermer</button>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="card glass-effect animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <h3>Modifier</h3>
                        <form onSubmit={handleUpdateUser}>
                            <input value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} className="form-control" />
                            <input value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} className="form-control" style={{ marginTop: '1rem' }} />
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Sauvegarder</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
