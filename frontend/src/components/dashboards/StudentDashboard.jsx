import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import {
    HiBookOpen,
    HiDocumentText,
    HiStar,
    HiOutlineChevronRight,
    HiOutlineClock,
    HiXMark,
    HiChatBubbleLeftRight,
    HiUserCircle,
    HiHeart,
    HiPencil,
    HiTrash,
    HiBanknotes
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

const StudentDashboard = ({ user }) => {
    const [searchParams] = useSearchParams();
    const [purchases, setPurchases] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');

    // View Course State
    const [viewingCourse, setViewingCourse] = useState(null);
    const [courseDetails, setCourseDetails] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);

    // Review Form State
    const [showReviewForm, setShowReviewForm] = useState(null); // stores course object
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [editingReview, setEditingReview] = useState(null); // stores review being edited

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
        fetchStudentData();
    }, [searchParams]);

    const fetchStudentData = async () => {
        try {
            const [pRes, iRes, rRes, fRes, payRes] = await Promise.all([
                api.get('/admissions'),
                api.get('/invoices'),
                api.get('/feedbacks'),
                api.get('/favorites'),
                api.get('/payments')
            ]);
            setPurchases(pRes.data.data || []);
            setInvoices(iRes.data.data || []);
            setReviews(rRes.data.data || []);
            setFavorites(fRes.data || []);
            setPayments(payRes.data.data || []);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCourse = async (course) => {
        if (!course.is_approved) {
            alert("Votre inscription est en attente de validation par l'administrateur.");
            return;
        }
        setViewingCourse(course);
        setLoading(true); // Show local loading
        try {
            const res = await api.get(`/forms/${course.form_id}`);
            setCourseDetails(res.data);
            if (res.data.topics && res.data.topics.length > 0) {
                // Sort by order and select first
                const sorted = [...res.data.topics].sort((a, b) => (a.order || 0) - (b.order || 0));
                setSelectedTopic(sorted[0]);
            }
        } catch (err) {
            console.error("Error fetching course details", err);
        } finally {
            setLoading(false);
        }
    };

    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            if (editingReview) {
                // Update existing review
                await api.put(`/feedbacks/${editingReview.id}`, {
                    rating: reviewData.rating,
                    message: reviewData.comment
                });
                alert("Avis mis à jour avec succès !");
            } else {
                // Create new review
                await api.post('/feedbacks', {
                    form_id: showReviewForm.form_id,
                    rating: reviewData.rating,
                    comment: reviewData.comment, // Backend expects 'comment' for auto-merge
                    message: reviewData.comment, // Also send message as fallback
                    type: 'Review',
                    subject: `Avis sur le cours: ${showReviewForm.form?.title || showReviewForm.form_id}`
                });
                alert("Merci pour votre avis !");
            }
            setShowReviewForm(null);
            setEditingReview(null);
            setReviewData({ rating: 5, comment: '' });
            fetchStudentData(); // Refresh reviews
        } catch (err) {
            console.error("Error submitting review:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Erreur lors de l'envoi de l'avis.";
            alert(`Erreur: ${errorMessage}\n\nDétails: ${JSON.stringify(err.response?.data || {})}`);
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setReviewData({ rating: review.rating, comment: review.message });
        setShowReviewForm({ form_id: review.form_id, form: review.form });
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
            return;
        }
        try {
            await api.delete(`/feedbacks/${reviewId}`);
            alert("Avis supprimé avec succès !");
            fetchStudentData(); // Refresh reviews
        } catch (err) {
            console.error("Error deleting review:", err);
            const errorMessage = err.response?.data?.message || "Erreur lors de la suppression de l'avis.";
            alert(errorMessage);
        }
    };

    const handlePayInvoice = async (invoice) => {
        const method = prompt("Choisissez votre méthode de paiement (Carte, PayPal, Transfert) :", "Carte de Crédit");
        if (!method) return;

        setLoading(true);
        try {
            await api.post(`/invoices/${invoice.id}/pay`, {
                payment_method: method,
                payment_data: { mock: true }
            });
            alert("Paiement effectué avec succès ! Votre accès sera validé par un administrateur.");
            fetchStudentData();
        } catch (err) {
            console.error("Payment error:", err);
            alert(err.response?.data?.message || "Erreur lors du paiement.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container" style={{ padding: '150px 0', textAlign: 'center' }}>
            <div className="animate-pulse">Chargement de votre univers...</div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '120px 0' }}>
            {/* Header */}
            <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                <div className="animate-fade-in">
                    <span style={{ color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                        Dashboard Étudiant
                    </span>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginTop: '0.5rem' }}>
                        Bonjour, {(user.person && user.person.first_name) ? user.person.first_name : user.name}
                    </h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Continuez votre parcours d'excellence.</p>
                </div>

                {/* Tabs */}
                <div className="glass-effect" style={{ display: 'flex', padding: '0.5rem', borderRadius: '16px' }}>
                    {[
                        { id: 'courses', label: 'Mes Cours', icon: <HiBookOpen /> },
                        { id: 'payments', label: 'Mes Paiements', icon: <HiBanknotes /> },
                        { id: 'invoices', label: 'Factures', icon: <HiDocumentText /> },
                        { id: 'reviews', label: 'Mes Avis', icon: <HiChatBubbleLeftRight /> },
                        { id: 'favorites', label: 'Mes Favoris', icon: <HiHeart /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setViewingCourse(null); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: activeTab === tab.id ? 'var(--brand-gradient)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-dim)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="animate-fade-in">
                {activeTab === 'courses' && !viewingCourse && (
                    <div className="grid-courses" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {purchases.length > 0 ? purchases.map(p => (
                            <div key={p.id} className="course-card card glass-effect" style={{ padding: 0, transition: 'transform 0.3s', cursor: 'pointer' }} onClick={() => handleViewCourse(p)}>
                                <div style={{ height: '180px', position: 'relative' }}>
                                    <img
                                        src={getFullImageUrl(p.form?.image_url) || `https://ui-avatars.com/api/?name=${p.form?.title}&background=random&color=fff&size=512`}
                                        alt={p.form?.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
                                    />
                                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--brand-gradient)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '800' }}>
                                        {p.form?.level || 'Tous niveaux'}
                                    </div>
                                    {/* Overlay Play Button on Hover */}
                                    <div className="play-overlay" style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.3s'
                                    }}>
                                        <div style={{ background: 'white', borderRadius: '50%', padding: '1rem', color: 'var(--primary)' }}>
                                            <HiOutlineChevronRight size={30} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100% - 180px)' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', height: '3rem', overflow: 'hidden', color: 'white' }}>{p.form?.title}</h3>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                        <HiUserCircle /> {p.form?.user?.name || 'Instructeur'}
                                    </div>

                                    <div style={{ marginTop: 'auto' }}>
                                        {p.is_approved ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewCourse(p); }}
                                                    className="btn btn-primary"
                                                    style={{ flex: 1, padding: '0.6rem', justifyContent: 'center', fontSize: '0.9rem' }}
                                                >
                                                    Reprendre
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShowReviewForm(p); }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.6rem', justifyContent: 'center' }}
                                                    title="Laisser un avis"
                                                >
                                                    <HiStar />
                                                </button>
                                            </div>
                                        ) : (
                                            <button disabled className="btn btn-secondary" style={{ width: '100%', padding: '0.6rem', justifyContent: 'center', opacity: 0.7 }}>
                                                En attente de validation
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <style>{`
                                    .course-card:hover .play-overlay {
                                        opacity: 1 !important;
                                    }
                                    .course-card:hover {
                                        transform: translateY(-5px);
                                    }
                                `}</style>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Vous n'êtes inscrit à aucun cours pour le moment.</p>
                                <button onClick={() => window.location.href = '/#courses'} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Explorer les formations</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'favorites' && (
                    <div className="grid-courses" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {favorites.length > 0 ? favorites.map(f => (
                            <div key={f.id} className="course-card card glass-effect" style={{ padding: 0, transition: 'transform 0.3s', cursor: 'pointer' }} onClick={() => window.location.href = `/courses?courseId=${f.form_id}`}>
                                <div style={{ height: '180px', position: 'relative' }}>
                                    <img
                                        src={getFullImageUrl(f.course?.image_url) || `https://ui-avatars.com/api/?name=${f.course?.title}&background=random&color=fff&size=512`}
                                        alt={f.course?.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
                                    />
                                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--brand-gradient)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '800' }}>
                                        {f.course?.level || 'Tous niveaux'}
                                    </div>
                                    <div style={{ position: 'absolute', top: '15px', left: '15px' }}>
                                        <HiHeart size={24} color="#ef4444" />
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100% - 180px)' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', height: '3rem', overflow: 'hidden', color: 'white' }}>{f.course?.title}</h3>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                        <HiUserCircle /> {f.course?.user?.name || 'Instructeur'}
                                    </div>

                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{f.course?.price > 0 ? `${f.course?.price} €` : 'GRATUIT'}</div>
                                        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                            Voir la formation
                                        </button>
                                    </div>
                                </div>
                                <style>{`
                                    .course-card:hover {
                                        transform: translateY(-5px);
                                    }
                                `}</style>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                                <HiHeart size={50} color="var(--glass-border)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Vous n'avez pas encore de favoris.</p>
                                <button onClick={() => window.location.href = '/courses'} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Explorer les formations</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'courses' && viewingCourse && (
                    <div className="animate-slide-up">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <button
                                onClick={() => { setViewingCourse(null); setCourseDetails(null); setSelectedTopic(null); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
                            >
                                <HiXMark size={20} /> Retour au tableau de bord
                            </button>
                            <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: '700' }}>
                                {viewingCourse.form?.title}
                            </div>
                        </div>

                        {!courseDetails ? (
                            <div className="card glass-effect" style={{ padding: '4rem', textAlign: 'center' }}>
                                <div className="animate-pulse">Récupération des modules de formation...</div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
                                {/* Main content Area */}
                                <div className="card glass-effect" style={{ padding: '2rem' }}>
                                    {selectedTopic ? (
                                        <div>
                                            {/* Video Player Section */}
                                            {(selectedTopic.video_full_url || selectedTopic.video_url) && (
                                                <div style={{ marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden', background: 'black', aspectRatio: '16/9', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                                                    {getYoutubeId(selectedTopic.video_url || selectedTopic.video_full_url) ? (
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            src={`https://www.youtube.com/embed/${getYoutubeId(selectedTopic.video_url || selectedTopic.video_full_url)}`}
                                                            title={selectedTopic.title}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    ) : (
                                                        <video
                                                            key={selectedTopic.video_full_url || selectedTopic.video_url}
                                                            controls
                                                            width="100%"
                                                            height="100%"
                                                            src={selectedTopic.video_full_url || selectedTopic.video_url}
                                                            style={{ objectFit: 'contain' }}
                                                        >
                                                            Votre navigateur ne supporte pas la lecture de vidéos.
                                                        </video>
                                                    )}
                                                </div>
                                            )}

                                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>{selectedTopic.title}</h2>

                                            <div style={{
                                                color: 'rgba(255,255,255,0.85)',
                                                lineHeight: '1.8',
                                                fontSize: '1.05rem',
                                                whiteSpace: 'pre-wrap',
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '2rem',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {selectedTopic.content || "Aucun contenu textuel pour ce module."}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '5rem' }}>
                                            <HiBookOpen size={50} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                                            <h3>Sélectionnez un chapitre</h3>
                                            <p style={{ color: 'var(--text-dim)' }}>Choisissez un module dans la liste à droite pour commencer.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar / Topic List */}
                                <div className="card glass-effect" style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto', position: 'sticky', top: '100px' }}>
                                    <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        Mes Chapitres
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {[...courseDetails.topics].sort((a, b) => (a.order || 0) - (b.order || 0)).map((topic, idx) => (
                                            <div
                                                key={topic.id}
                                                className={`topic-item ${selectedTopic?.id === topic.id ? 'active' : ''}`}
                                                onClick={() => setSelectedTopic(topic)}
                                                style={{
                                                    padding: '1rem',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    gap: '1rem',
                                                    alignItems: 'center',
                                                    background: selectedTopic?.id === topic.id ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.03)',
                                                    transition: 'all 0.2s',
                                                    border: '1px solid',
                                                    borderColor: selectedTopic?.id === topic.id ? 'transparent' : 'rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                <div style={{
                                                    minWidth: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: selectedTopic?.id === topic.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '800'
                                                }}>
                                                    {idx + 1}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>{topic.title}</div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '2px' }}>
                                                        {topic.video_url || topic.video_path ? 'Vidéo incluse' : 'Contenu texte'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <style>{`
                                        .topic-item:hover {
                                            transform: translateX(5px);
                                        }
                                    `}</style>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'invoices' && (
                    <div className="animate-fade-in">
                        {(() => {
                            const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
                            const totalPaid = paidInvoices.reduce((acc, inv) => acc + parseFloat(inv.total), 0);

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div className="card glass-effect" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0 }}>Mes Factures Validées</h3>
                                            <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Historique de vos paiements acceptés par l'administration.</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Total Dépensé</div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{totalPaid.toFixed(2)} €</div>
                                        </div>
                                    </div>

                                    <div className="glass-effect" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                <tr>
                                                    <th>N° Facture</th>
                                                    <th>Cours / Description</th>
                                                    <th>Date</th>
                                                    <th>Total</th>
                                                    <th>Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paidInvoices.map(inv => (
                                                    <tr key={inv.id}>
                                                        <td>#{inv.invoice_number}</td>
                                                        <td>{inv.form?.title || 'Formation NextLearn'}</td>
                                                        <td style={{ color: 'var(--text-dim)' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                                                        <td style={{ fontWeight: '700' }}>{inv.total} €</td>
                                                        <td>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                background: 'rgba(34, 197, 94, 0.1)',
                                                                color: '#22c55e'
                                                            }}>
                                                                Validée
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paidInvoices.length === 0 && (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>Aucune facture validée pour le moment.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="animate-fade-in">
                        {/* Global Stats for Reviews */}
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div className="card glass-effect" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
                                    <HiStar />
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                                    {reviews.length > 0
                                        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                                        : '0.0'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Moyenne des notes données</div>
                            </div>
                            <div className="card glass-effect" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>
                                    <HiChatBubbleLeftRight />
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{reviews.length}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Total des avis</div>
                            </div>
                        </div>

                        {reviews.length > 0 ? (
                            <div className="grid-courses" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                                {reviews.map(r => (
                                    <div key={r.id} className="card glass-effect" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: 'var(--accent)', fontWeight: '700' }}>
                                                    {r.form?.title || 'Cours supprimé'}
                                                </h4>
                                                <div style={{ display: 'flex', color: '#fbbf24', fontSize: '1.2rem', gap: '2px' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <HiStar key={i} style={{ opacity: i < r.rating ? 1 : 0.15 }} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEditReview(r)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}
                                                    title="Modifier"
                                                >
                                                    <HiPencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReview(r.id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                    title="Supprimer"
                                                >
                                                    <HiTrash size={18} color="#ef4444" />
                                                </button>
                                            </div>
                                        </div>

                                        <p style={{
                                            color: 'rgba(255,255,255,0.8)',
                                            fontStyle: 'italic',
                                            margin: 0,
                                            lineHeight: '1.6',
                                            fontSize: '0.95rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            "{r.message}"
                                        </p>

                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                            <span>Posté le {new Date(r.created_at).toLocaleDateString()}</span>
                                            {r.status === 'New' && <span style={{ color: 'var(--accent)', fontWeight: '700' }}>En attente</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card glass-effect" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: 'var(--text-dim)' }}>
                                <HiChatBubbleLeftRight size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                <p style={{ fontSize: '1.1rem' }}>Vous n'avez pas encore laissé d'avis.</p>
                                <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('courses')}>
                                    Voir mes cours pour noter
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'payments' && (
                    <div className="animate-fade-in card glass-effect" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ margin: 0 }}>Mes Paiements</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Suivez le statut de vos transactions.</p>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <tr>
                                    <th>Réf</th>
                                    <th>Cours</th>
                                    <th>Montant</th>
                                    <th>Méthode</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(pay => (
                                    <tr key={pay.id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{pay.payment_number}</td>
                                        <td>{pay.form?.title}</td>
                                        <td style={{ fontWeight: '800' }}>{pay.amount} €</td>
                                        <td>{pay.payment_method}</td>
                                        <td style={{ color: 'var(--text-dim)' }}>{new Date(pay.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '10px',
                                                fontSize: '0.75rem',
                                                background: pay.status === 'accepted' ? '#22c55e22' : pay.status === 'pending' ? '#f59e0b22' : '#ef444422',
                                                color: pay.status === 'accepted' ? '#22c55e' : pay.status === 'pending' ? '#f59e0b' : '#ef4444',
                                                fontWeight: '700'
                                            }}>
                                                {pay.status === 'accepted' ? 'Validé' : pay.status === 'pending' ? 'En attente' : 'Rejeté'}
                                            </span>
                                            {pay.status === 'rejected' && pay.rejection_reason && (
                                                <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px' }}>
                                                    Motif: {pay.rejection_reason}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>Aucun paiement trouvé.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showReviewForm && (
                <div className="modal-overlay" onClick={() => { setShowReviewForm(null); setEditingReview(null); setReviewData({ rating: 5, comment: '' }); }}>
                    <div className="card glass-effect animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '3rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0 }}>{editingReview ? 'Modifier l\'avis' : 'Laisser un avis'}</h3>
                            <button onClick={() => { setShowReviewForm(null); setEditingReview(null); setReviewData({ rating: 5, comment: '' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><HiXMark size={24} /></button>
                        </div>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Partagez votre expérience sur : <strong>{showReviewForm.form?.title}</strong></p>

                        <form onSubmit={handleSubmitReview}>
                            <div className="form-group">
                                <label>Note globale</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <HiStar
                                            key={star}
                                            size={32}
                                            style={{ cursor: 'pointer', color: star <= reviewData.rating ? '#fbbf24' : 'rgba(255,255,255,0.1)' }}
                                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Votre commentaire</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    required
                                    placeholder="Qu'avez-vous pensé de cette formation ?"
                                    value={reviewData.comment}
                                    onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                {editingReview ? 'Mettre à jour' : 'Envoyer mon avis'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
