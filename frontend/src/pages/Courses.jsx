import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { HiStar, HiUserCircle, HiArrowRight, HiMagnifyingGlass, HiAdjustmentsHorizontal, HiChevronRight, HiShoppingCart, HiCheckCircle } from 'react-icons/hi2';
import { CourseDetailsModal } from '../components/PopularCourses';
import { useAuth } from '../context/AuthContext';
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

const Courses = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart, cartItems } = useCart();

    // Derive state directly from URL to ensure sync with navigation (Back/Forward)
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const minPrice = searchParams.get('min_price') || 0;
    const maxPrice = searchParams.get('max_price') || 1000;
    const pageParam = parseInt(searchParams.get('page')) || 1;
    const currentPage = pageParam;

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [maxPriceLimit, setMaxPriceLimit] = useState(1000);

    // Local state for search input to avoid laggy typing
    const [searchInput, setSearchInput] = useState(query);
    const [categories, setCategories] = useState([]);
    const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== query) {
                updateParams({ q: searchInput });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const sort = searchParams.get('sort') || 'newest';

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const url = `/forms?type=Admission&state=Published&page=${pageParam}&q=${query}&category=${category}&level=${level}&sort=${sort}&min_price=${minPrice}&max_price=${maxPrice}`;
            const response = await api.get(url);
            setCourses(response.data.data || []);
            setTotalPages(response.data.last_page || 1);

            // Dynamically adjust max price limit if we see higher prices
            const highestInBatch = Math.max(...(response.data.data || []).map(c => c.price), 0);
            if (highestInBatch > maxPriceLimit) {
                setMaxPriceLimit(Math.ceil(highestInBatch / 100) * 100);
            }
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
        fetchCourses();
        fetchCategories();
    }, [query, category, level, pageParam, sort, minPrice, maxPrice]);

    // Check for courseId in params to open modal directly
    useEffect(() => {
        const courseIdParam = searchParams.get('courseId');
        if (courseIdParam) {
            setSelectedCourseId(parseInt(courseIdParam));
        }
    }, [searchParams]);

    const updateParams = (newParams) => {
        const current = Object.fromEntries(searchParams.entries());
        const merged = { ...current, ...newParams, page: 1 }; // Reset to page 1 on filter change

        // Remove empty keys
        Object.keys(merged).forEach(key => {
            if (!merged[key]) delete merged[key];
        });

        setSearchParams(merged);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateParams({ q: searchInput });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            const current = Object.fromEntries(searchParams.entries());
            setSearchParams({ ...current, page: newPage });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCategoryChange = (cat) => {
        updateParams({ category: category === cat ? '' : cat });
    };

    const handleLevelChange = (l) => {
        updateParams({ level: level === l ? '' : l });
    };

    const handleOpenDetails = (id) => {
        setSelectedCourseId(id);
    };

    return (
        <div className="courses-page" style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '100vh', background: 'var(--bg-gradient)', color: 'white' }}>
            <div className="container">
                <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Accueil</span>
                        <HiChevronRight size={12} />
                        <span style={{ color: 'var(--primary)' }}>Tous les cours</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: '3rem', margin: 0, fontWeight: '800' }}>
                                {query ? `Résultats pour "${query}"` : 'Tous les cours'}
                            </h1>
                            <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                                Explorez nos formations de qualité.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="glass-effect" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '50px', width: '100%', maxWidth: '400px', border: '1px solid var(--glass-border)' }}>
                            <HiMagnifyingGlass size={20} color="var(--text-dim)" />
                            <input
                                type="text"
                                placeholder="Rechercher un cours..."
                                style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: '0.8rem', width: '100%', outline: 'none', fontSize: '1rem' }}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </form>

                        <div style={{ minWidth: '200px' }}>
                            <select
                                className="glass-effect"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', cursor: 'pointer' }}
                                value={searchParams.get('sort') || 'newest'}
                                onChange={(e) => updateParams({ sort: e.target.value })}
                            >
                                <option value="newest" style={{ color: 'black' }}>Plus récents</option>
                                <option value="popularity" style={{ color: 'black' }}>Plus populaires</option>
                                <option value="price_asc" style={{ color: 'black' }}>Prix croissant</option>
                                <option value="price_desc" style={{ color: 'black' }}>Prix décroissant</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>
                    <aside className="desktop-only">
                        <div className="glass-effect" style={{ padding: '2rem', borderRadius: '24px', position: 'sticky', top: '100px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem', color: 'var(--primary)' }}>
                                <HiAdjustmentsHorizontal size={24} />
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Filtrer par</h3>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '1.2rem' }}>Budget</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                                    <span>{minPrice} €</span>
                                    <span>{maxPrice} €</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPriceLimit}
                                    step="10"
                                    value={maxPrice}
                                    onChange={(e) => updateParams({ max_price: e.target.value })}
                                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                />
                                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>
                                    Budget Max: {maxPrice} €
                                </div>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '1.2rem' }}>Catégories</h4>
                                {categories.map(cat => (
                                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', marginBottom: '0.8rem', fontSize: '0.95rem', color: category === cat.name ? 'var(--primary)' : 'var(--text-dim)' }}>
                                        <input
                                            type="checkbox"
                                            checked={category === cat.name}
                                            onChange={() => handleCategoryChange(cat.name)}
                                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                        />
                                        {cat.name}
                                    </label>
                                ))}
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '1.2rem' }}>Niveau</h4>
                                {levels.map(l => (
                                    <label key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', marginBottom: '0.8rem', fontSize: '0.95rem', color: level === l ? 'var(--primary)' : 'var(--text-dim)' }}>
                                        <input
                                            type="checkbox"
                                            checked={level === l}
                                            onChange={() => handleLevelChange(l)}
                                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                        />
                                        {l}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <main>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '5rem' }}>
                                <div className="animate-pulse" style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Chargement des cours...</div>
                            </div>
                        ) : courses.length > 0 ? (
                            <>
                                <div className="grid-courses" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                                    {courses.map(course => (
                                        <div key={course.id} className="course-card card glass-effect" style={{ padding: 0, transition: 'transform 0.3s' }}>
                                            <div style={{ height: '180px', position: 'relative' }}>
                                                <img src={getFullImageUrl(course.image_url) || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=800&q=80'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }} />
                                                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--brand-gradient)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '800' }}>{course.level}</div>
                                            </div>
                                            <div style={{ padding: '1.5rem' }}>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', height: '3rem', overflow: 'hidden' }}>{course.title}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: '#fbbf24', fontSize: '0.85rem' }}>
                                                    <div style={{ display: 'flex' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <HiStar key={star} style={{ opacity: star <= Math.round(course.average_rating || 0) ? 1 : 0.2 }} />
                                                        ))}
                                                    </div>
                                                    <span style={{ color: 'var(--text-dim)', marginLeft: '4px' }}>
                                                        ({course.review_count || 0})
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                                    <HiUserCircle /> {course.user?.name}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{course.price > 0 ? `${course.price} €` : 'GRATUIT'}</div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {course.price > 0 && (
                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={(e) => { e.stopPropagation(); addToCart(course); }}
                                                                title={cartItems.some(i => i.id === course.id) ? "Dans le panier" : "Ajouter au panier"}
                                                                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}
                                                            >
                                                                {cartItems.some(i => i.id === course.id) ? <HiCheckCircle color="#22c55e" /> : <HiShoppingCart />}
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleOpenDetails(course.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Détails <HiArrowRight /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.8rem 1.5rem', opacity: currentPage === 1 ? 0.5 : 1 }}
                                        >
                                            Précédent
                                        </button>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(i + 1)}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        border: '1px solid var(--glass-border)',
                                                        background: currentPage === (i + 1) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                        color: 'white',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.8rem 1.5rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="glass-effect" style={{ padding: '6rem 2rem', textAlign: 'center', borderRadius: '32px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                    <HiMagnifyingGlass size={40} color="var(--text-dim)" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Aucun cours trouvé</h3>
                                <p style={{ color: 'var(--text-dim)', maxWidth: '400px', margin: '0 auto 2rem' }}>Nous n'avons trouvé aucun résultat pour "{query}". Essayez d'autres termes ou réinitialisez les filtres.</p>
                                <button className="btn btn-secondary" onClick={() => setSearchParams({})}>Réinitialiser tout</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            {selectedCourseId && <CourseDetailsModal courseId={selectedCourseId} onClose={() => setSelectedCourseId(null)} />}
        </div>
    );
};

export default Courses;
