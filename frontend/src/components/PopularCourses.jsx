import { useState, useEffect } from 'react';
import { HiXMark, HiStar, HiAcademicCap, HiClock, HiCheckCircle, HiUserCircle, HiHeart, HiArrowRight, HiMagnifyingGlass, HiTag, HiUser, HiMiniStar } from 'react-icons/hi2';
import { HiOutlineDesktopComputer, HiOutlineClock, HiOutlineUsers, HiOutlineShoppingCart } from 'react-icons/hi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

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

export const InstructorModal = ({ instructor, onClose }) => {
    if (!instructor) return null;
    const person = instructor.person || {};

    return (
        <div className="modal-overlay" style={{ zIndex: 2100 }} onClick={onClose}>
            <div className="card glass-effect animate-slide-up" style={{
                width: '100%', maxWidth: '500px', borderRadius: '25px', padding: '2.5rem', position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer'
                }}>
                    <HiXMark size={24} />
                </button>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                    <HiUserCircle size={80} color="var(--text-dim)" />
                    <div>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{instructor.name}</h2>
                        <div style={{ color: 'var(--primary)', fontWeight: '700' }}>{person.headline || 'Instructeur NextLearn'}</div>
                    </div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>À propos</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {person.bio || "Cet instructeur n'a pas encore rempli sa biographie."}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>{instructor.courses_count || '12'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Cours</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>{instructor.students_count || '1.2k'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Étudiants</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>{instructor.rating || '4.8'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Note</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CourseDetailsModal = ({ courseId, onClose }) => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [pendingValidation, setPendingValidation] = useState(false);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showInstructor, setShowInstructor] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');

    const { user } = useAuth();
    const { addToCart, cartItems } = useCart();

    const isInCart = cartItems.find(item => item.id === course?.id);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/forms/${courseId}`);
                setCourse(response.data);

                // Check if favorited and enrolled (only if logged in)
                if (user) {
                    const [favRes, admRes, payRes] = await Promise.all([
                        api.get('/favorites'),
                        api.get('/admissions'),
                        api.get('/payments?status=pending')
                    ]);

                    setIsFavorited(favRes.data.some(f => f.form_id === parseInt(courseId)));
                    setIsEnrolled(admRes.data.data?.some(a => a.form_id === parseInt(courseId)));

                    // Check for pending payment
                    const hasPending = payRes.data.data?.some(p => p.form_id === parseInt(courseId));
                    if (hasPending) setPendingValidation(true);
                }
            } catch (err) {
                console.error(err);
                setError("Impossible de charger les détails du cours.");
            } finally {
                setLoading(false);
            }
        };
        if (courseId) fetchDetails();
    }, [courseId, user]);

    const handleAction = (callback) => {
        if (!user) {
            alert("Veuillez vous connecter pour effectuer cette action.");
            navigate('/login');
            return;
        }
        callback();
    };

    const handleFreeEnroll = async () => {
        setEnrollLoading(true);
        setError(null);
        try {
            await api.post(`/forms/${courseId}/purchase`);
            setSuccess(true);
            setIsEnrolled(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setEnrollLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setEnrollLoading(true);
        setError(null);
        try {
            await api.post('/payments', {
                form_id: courseId,
                payment_method: paymentMethod,
                payment_details: { type: 'manual_entry' }
            });
            setShowPayment(false);
            setPendingValidation(true);
            alert("Votre paiement a été soumis et est en attente de validation par l'administrateur.");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors du paiement.");
        } finally {
            setEnrollLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        handleAction(async () => {
            try {
                await api.post(`/favorites/toggle/${courseId}`);
                setIsFavorited(!isFavorited);
            } catch (err) {
                console.error(err);
            }
        });
    };

    if (!courseId) return null;

    if (loading) {
        return (
            <div className="modal-overlay" style={{ zIndex: 2000 }} onClick={onClose}>
                <div className="card glass-effect" style={{ width: '100%', maxWidth: '900px', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="animate-pulse">Chargement de la formation...</div>
                </div>
            </div>
        );
    }

    if (!course) return null;

    return (
        <>
            <div className="modal-overlay" style={{ zIndex: 2000 }} onClick={onClose}>
                <div className="card glass-effect animate-slide-up" style={{
                    width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '30px', padding: 0
                }} onClick={e => e.stopPropagation()}>

                    <div style={{ position: 'relative', height: '300px' }}>
                        <img src={getFullImageUrl(course.image_url) || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=1200&q=80'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent, var(--dark))' }}></div>
                        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiXMark size={24} />
                        </button>
                    </div>

                    <div style={{ padding: '3rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '5px 15px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700' }}>{course.tags || 'Formation'}</span>
                                <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <HiMiniStar /> {course.average_rating}
                                    ({course.review_count} avis)
                                </span>
                            </div>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>{course.title}</h2>

                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HiOutlineClock /> 12h de contenu</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HiOutlineDesktopComputer /> Accès à vie</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HiOutlineUsers /> 450 étudiants</div>
                            </div>

                            {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', border: '1px solid rgba(34, 197, 94, 0.2)', textAlign: 'center' }}>Inscription validée !</div>}
                            {pendingValidation && <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', border: '1px solid rgba(245, 158, 11, 0.2)', textAlign: 'center', fontWeight: 'bold' }}>Votre paiement est en attente de validation par l'administrateur.</div>}
                            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '15px', marginBottom: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

                            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.2rem' }}>À propos</h3>
                            <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '2rem' }}>{course.description}</p>

                            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.2rem' }}>Avis des étudiants</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {(course.feedbacks || []).map((f, i) => (
                                    <div key={i} className="glass-effect" style={{ padding: '1.2rem', borderRadius: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: '700' }}>{f.user?.name || 'Étudiant'}</span>
                                            <div style={{ color: '#fbbf24', display: 'flex' }}>{[...Array(f.rating || 5)].map((_, j) => <HiStar key={j} />)}</div>
                                        </div>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic' }}>"{f.message}"</p>
                                    </div>
                                ))}
                                {(!course.feedbacks || course.feedbacks.length === 0) && <p style={{ color: 'var(--text-dim)' }}>Aucun avis pour le moment.</p>}
                            </div>
                        </div>

                        <div>
                            <div className="glass-effect" style={{ padding: '2rem', borderRadius: '25px', position: 'sticky', top: '0' }}>
                                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{course.price > 0 ? `${course.price} €` : 'OFFERT'}</div>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Instructeur</h4>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleAction(() => setShowInstructor(true))}>
                                        <HiUserCircle size={45} color="var(--text-dim)" />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary)' }}>{course.user?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Voir le profil</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Form */}
                                {showPayment ? (
                                    <form onSubmit={handlePaymentSubmit} style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ marginBottom: '1rem' }}>Méthode de paiement</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                            {['Carte Bancaire', 'PayPal', 'Virement Bancaire'].map(method => (
                                                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', cursor: 'pointer' }}>
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value={method}
                                                        required
                                                        onChange={e => setPaymentMethod(e.target.value)}
                                                        checked={paymentMethod === method}
                                                    />
                                                    {method}
                                                </label>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowPayment(false)} style={{ flex: 1, justifyContent: 'center' }}>Annuler</button>
                                            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={enrollLoading}>
                                                {enrollLoading ? 'Traitement...' : 'Confirmer'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div className="glass-effect" style={{ padding: '0.8rem', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                                            {user?.role === 'Admin' || user?.role === 'Tutor' ? "Accès supervision actif" : "Accès immédiat après validation."}
                                        </div>

                                        {(user?.role === 'Admin' || user?.role === 'Tutor') ? (
                                            null
                                        ) : isEnrolled ? (
                                            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', opacity: 0.8 }} disabled>
                                                Déjà inscrit
                                            </button>
                                        ) : pendingValidation ? (
                                            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', color: '#f59e0b', borderColor: '#f59e0b22', background: '#f59e0b11' }} disabled>
                                                Validation en cours...
                                            </button>
                                        ) : course.price > 0 ? (
                                            <button
                                                className="btn btn-primary"
                                                style={{ width: '100%', justifyContent: 'center' }}
                                                onClick={() => handleAction(() => setShowPayment(true))}
                                            >
                                                <HiOutlineShoppingCart /> Acheter le cours
                                            </button>
                                        ) : (
                                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleAction(handleFreeEnroll)} disabled={enrollLoading || success}>
                                                {enrollLoading ? 'Traitement...' : success ? 'Inscrit !' : 'Accès Gratuit'}
                                            </button>
                                        )}
                                        {user?.role !== 'Admin' && user?.role !== 'Tutor' && (
                                            <button className={`btn btn-secondary ${isFavorited ? 'favorited' : ''}`} style={{ width: '100%', justifyContent: 'center' }} onClick={handleToggleFavorite}>
                                                <HiHeart /> {isFavorited ? 'Favori' : 'Mettre en favori'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showInstructor && <InstructorModal instructor={course.user} onClose={() => setShowInstructor(false)} />}
        </>
    );
};

export const PopularCourses = () => {
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const globalSearch = searchParams.get('q') || '';
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const { addToCart, cartItems } = useCart();

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCourses = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/forms?type=Admission&state=Published&page=${page}`);
            setCourses(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setCurrentPage(response.data.current_page || 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data || []);
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    useEffect(() => {
        fetchCourses(1);
        fetchCategories();
    }, []);

    const filteredCourses = (courses || []).filter(c => {
        const titleMatch = (c.title || '').toLowerCase().includes(globalSearch.toLowerCase());
        const instructorMatch = (c.user?.name || '').toLowerCase().includes(globalSearch.toLowerCase());
        const matchQuery = titleMatch || instructorMatch;
        const matchCat = !category || (c.tags || '').toLowerCase().includes(category.toLowerCase());
        return matchQuery && matchCat;
    });

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchCourses(newPage);
            const section = document.getElementById('courses');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        }
    };



    return (
        <section style={{ padding: '80px 0 120px' }} id="courses">
            <div className="container">
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '3.5rem', marginBottom: '0.8rem', lineHeight: '1.2' }}>Cours <span className="gradient-text">Populaires</span></h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>{globalSearch ? `Résultats pour "${globalSearch}"` : 'Explorez nos formations les plus demandées.'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(category === cat.name ? '' : cat.name)}
                                    style={{
                                        padding: '0.7rem 1.5rem',
                                        borderRadius: '50px',
                                        border: '1px solid var(--glass-border)',
                                        background: category === cat.name ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '5rem 0', textAlign: 'center' }}>
                        <div className="animate-pulse" style={{ color: 'var(--text-dim)' }}>Chargement des cours...</div>
                    </div>
                ) : (
                    <>
                        <div className="grid-courses">
                            {filteredCourses.map((course) => (
                                <div key={course.id} className="course-card card glass-effect" style={{ padding: 0 }} onClick={() => setSelectedCourseId(course.id)}>
                                    <div style={{ height: '200px', position: 'relative' }}>
                                        <img src={getFullImageUrl(course.image_url) || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=800&q=80'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--brand-gradient)', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '800' }}>{course.level}</div>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', height: '3.5rem', overflow: 'hidden' }}>{course.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                            <HiUserCircle size={35} color="var(--text-dim)" />
                                            <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>{course.user?.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>{course.price > 0 ? `${course.price} €` : 'OFFERT'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {course.price > 0 && (
                                                    <button
                                                        className="btn-icon-glass"
                                                        onClick={(e) => { e.stopPropagation(); addToCart(course); }}
                                                        title={cartItems.some(i => i.id === course.id) ? "Dans le panier" : "Ajouter au panier"}
                                                        style={{
                                                            width: '35px', height: '35px', borderRadius: '50%', border: 'none',
                                                            background: cartItems.some(i => i.id === course.id) ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {cartItems.some(i => i.id === course.id) ? <HiCheckCircle /> : <HiOutlineShoppingCart />}
                                                    </button>
                                                )}
                                                <div style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: '700' }}>
                                                    <HiStar /> {course.average_rating || '0.0'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '4rem' }}>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '50%',
                                            border: '1px solid var(--glass-border)',
                                            background: currentPage === i + 1 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {selectedCourseId && <CourseDetailsModal courseId={selectedCourseId} onClose={() => setSelectedCourseId(null)} />}
        </section>
    );
};

export default PopularCourses;
