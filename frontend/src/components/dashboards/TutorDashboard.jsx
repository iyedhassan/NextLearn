import { useState, useEffect } from 'react';
import api from '../../api/axios';

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
import {
    HiPlus,
    HiPencilSquare,
    HiTrash,
    HiListBullet,
    HiAcademicCap,
    HiXMark,
    HiCheck,
    HiVideoCamera,
    HiChartBar,
    HiEye,
    HiChevronDown,
    HiChevronUp,
    HiCloudArrowUp,
    HiTag,
    HiMagnifyingGlass
} from 'react-icons/hi2';

const TutorDashboard = ({ user }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('courses');
    const [students, setStudents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');

    // Modals
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [showTopicForm, setShowTopicForm] = useState(null); // stores course object
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingTopic, setEditingTopic] = useState(null);

    // Form States
    const [courseData, setCourseData] = useState({ title: '', description: '', price: 0, type: 'Admission', level: 'Débutant', tags: '', category_name: '', image: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [topicData, setTopicData] = useState({ title: '', content: '', video_url: '', video_file: null, content_type: 'Text', order: 0 });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const fetchSafe = async (url) => {
                try {
                    const res = await api.get(url);
                    return res.data;
                } catch (e) {
                    console.error(`Error fetching ${url}:`, e);
                    return { data: [], total: 0 };
                }
            };

            const [coursesData, studentsData, categoriesData] = await Promise.all([
                fetchSafe('/forms?own=1'),
                fetchSafe('/admissions'),
                fetchSafe('/categories')
            ]);

            setCourses(coursesData.data || []);
            setStudents(studentsData.data || []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.data || []));
        } catch (err) {
            console.error("General tutor data fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(courseData).forEach(key => {
            if (courseData[key] !== null) {
                if (key === 'price' && (courseData[key] === '' || isNaN(courseData[key]))) {
                    formData.append(key, 0);
                } else {
                    formData.append(key, courseData[key]);
                }
            }
        });

        try {
            if (editingCourse) {
                // For PUT with files, Laravel sometimes requires _method=PUT with a POST request
                if (courseData.image instanceof File) {
                    formData.append('_method', 'PUT');
                    await api.post(`/forms/${editingCourse.id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    await api.put(`/forms/${editingCourse.id}`, courseData);
                }
                alert("Cours mis à jour !");
            } else {
                await api.post('/forms', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Cours créé et soumis à l'approbation de l'admin !");
            }
            closeCourseModal();
            fetchCourses();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || "Erreur lors de l'enregistrement du cours";
            alert(msg);
        }
    };

    const closeCourseModal = () => {
        setShowCourseForm(false);
        setEditingCourse(null);
        setCourseData({ title: '', description: '', price: 0, type: 'Admission', level: 'Débutant', tags: '', category_name: '', image: null });
        setImagePreview(null);
    };

    const openEditCourse = (course) => {
        setEditingCourse(course);
        setCourseData({
            title: course.title,
            description: course.description,
            price: course.price,
            type: course.type,
            level: course.level || 'Débutant',
            tags: course.tags || '',
            category_name: course.category?.name || course.tags || '',
            image: null // Don't pre-fill with existing image string for file input
        });
        setImagePreview(course.image_url);
        setShowCourseForm(true);
    };

    const toggleCourseState = async (course) => {
        let newState;
        if (course.state === 'Published') {
            newState = 'Draft';
        } else if (course.state === 'Draft') {
            newState = 'Published'; // Server-side will change this to Pending
        } else {
            return; // Already Pending
        }

        try {
            await api.put(`/forms/${course.id}`, { state: newState });
            fetchCourses();
            if (newState === 'Published') {
                alert("Cours soumis à l'approbation.");
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Erreur lors du changement de statut";
            alert(msg);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours et tout son contenu ?")) return;
        try {
            await api.delete(`/forms/${id}`);
            fetchCourses();
        } catch (err) {
            alert("Erreur lors de la suppression");
        }
    };



    const handleSaveTopic = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(topicData).forEach(key => {
            if (topicData[key] !== null) {
                if (key === 'video_url' && (!topicData[key] || topicData[key].trim() === '')) return;
                formData.append(key, topicData[key]);
            }
        });
        formData.append('form_id', showTopicForm.id);

        try {
            if (editingTopic) {
                // Laravel hack for PUT with files
                formData.append('_method', 'PUT');
                await api.post(`/topics/${editingTopic.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Sujet mis à jour !");
            } else {
                await api.post('/topics', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Sujet ajouté !");
            }
            closeTopicModal();
            fetchCourses();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || "Erreur lors de l'enregistrement du sujet";
            alert(msg);
        }
    };

    const closeTopicModal = () => {
        setShowTopicForm(null);
        setEditingTopic(null);
        setTopicData({ title: '', content: '', video_url: '', video_file: null, content_type: 'Text', order: 0 });
    };

    const openEditTopic = (course, topic) => {
        setShowTopicForm(course);
        setEditingTopic(topic);
        setTopicData({
            title: topic.title,
            content: topic.content,
            video_url: topic.video_url || '',
            video_file: null,
            content_type: topic.content_type || 'Text',
            order: topic.order || 0
        });
    };

    const handleDeleteTopic = async (topicId) => {
        if (!window.confirm("Supprimer ce sujet ?")) return;
        try {
            await api.delete(`/topics/${topicId}`);
            fetchCourses();
        } catch (err) {
            alert("Erreur lors de la suppression du sujet");
        }
    };

    if (loading) return (
        <div style={{ padding: '150px 0', textAlign: 'center', background: 'var(--bg-gradient)', minHeight: '100vh' }}>
            <div className="animate-pulse">Initialisation de votre espace instructeur...</div>
        </div>
    );

    return (
        <div style={{ padding: '120px 0', background: 'var(--bg-gradient)', minHeight: '100vh' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
                    <div className="animate-fade-in">
                        <span style={{ color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                            Espace Privé Instructeur
                        </span>
                        <h1 className="gradient-text" style={{ fontSize: '3rem', marginTop: '0.5rem' }}>Tableau de <span className="bold">Bord</span></h1>
                        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem', fontSize: '1.2rem' }}>Gérez vos contenus et suivez vos étudiants.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="glass-effect" style={{ display: 'flex', padding: '0.4rem', borderRadius: '12px' }}>
                            <button
                                onClick={() => setActiveTab('courses')}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === 'courses' ? 'var(--brand-gradient)' : 'transparent',
                                    color: activeTab === 'courses' ? 'white' : 'var(--text-dim)',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Mes Cours
                            </button>
                            <button
                                onClick={() => setActiveTab('students')}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === 'students' ? 'var(--brand-gradient)' : 'transparent',
                                    color: activeTab === 'students' ? 'white' : 'var(--text-dim)',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Étudiants ({students.length})
                            </button>
                        </div>
                        {activeTab === 'courses' && (
                            <button className="btn btn-primary" onClick={() => setShowCourseForm(true)} style={{ padding: '0.8rem 1.5rem' }}>
                                <HiPlus /> Nouveau Cours
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                    {[
                        { label: 'Cours Totaux', val: courses.length, icon: <HiAcademicCap />, color: 'var(--primary)' },
                        { label: 'Publiés', val: courses.filter(c => c.state === 'Published').length, icon: <HiCloudArrowUp />, color: 'var(--accent)' },
                        { label: 'En attente', val: courses.filter(c => c.state === 'Pending').length, icon: <HiEye />, color: '#f59e0b' },
                        { label: 'Étudiants Totaux', val: courses.reduce((acc, c) => acc + (c.admissions_count || 0), 0), icon: <HiChartBar />, color: 'var(--accent)' },
                    ].map((s, i) => (
                        <div key={i} className="card glass-effect" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ color: s.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{s.val}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Content View */}
                {activeTab === 'courses' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {courses.map(course => (
                            <div key={course.id} className="card glass-effect" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '2.5rem', alignItems: 'center' }}>
                                    {/* Image Placeholder */}
                                    <div style={{
                                        width: '120px',
                                        height: '100px',
                                        borderRadius: '16px',
                                        background: 'var(--brand-gradient)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {course.image_url ? (
                                            <img src={getFullImageUrl(course.image_url)} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <HiAcademicCap size={40} color="white" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{course.title}</h3>
                                            <span style={{
                                                background: course.state === 'Published' ? 'rgba(34, 197, 94, 0.1)' : course.state === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                color: course.state === 'Published' ? '#22c55e' : course.state === 'Pending' ? '#f59e0b' : 'var(--text-dim)',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                padding: '2px 10px',
                                                borderRadius: '50px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {course.state === 'Pending' ? 'En attente' : course.state}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1rem', maxHeight: '40px', overflow: 'hidden' }}>{course.description}</p>
                                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><HiListBullet /> {course.topics?.length || 0} Chapitres</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><HiChartBar /> {course.admissions_count || 0} Étudiants</span>
                                            {course.category && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: course.category.color }}>
                                                    <HiTag /> {course.category.name}
                                                </span>
                                            )}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent)', fontWeight: '700' }}><HiTag /> {course.price} €</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                                        <button className="btn btn-secondary" onClick={() => openEditCourse(course)} title="Modifier les infos">
                                            <HiPencilSquare />
                                        </button>
                                        <button className="btn btn-secondary" disabled={course.state === 'Pending'} onClick={() => toggleCourseState(course)} title={course.state === 'Published' ? 'Passer en brouillon' : (course.state === 'Pending' ? 'En attente de validation' : 'Publier')}>
                                            {course.state === 'Published' ? <HiEye /> : (course.state === 'Pending' ? <HiEye style={{ opacity: 0.5 }} /> : <HiCloudArrowUp />)}
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ background: expandedCourse === course.id ? 'var(--accent)' : '' }}
                                            onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                                        >
                                            {expandedCourse === course.id ? <HiChevronUp /> : <HiChevronDown />} Contenu
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => handleDeleteCourse(course.id)} style={{ color: '#ef4444' }}>
                                            <HiTrash />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Content: Topics Management */}
                                {expandedCourse === course.id && (
                                    <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)', padding: '2.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <h4 style={{ fontSize: '1.2rem' }}>Programme de la formation</h4>
                                            <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }} onClick={() => setShowTopicForm(course)}>
                                                <HiPlus /> Nouveau Chapitre
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {(course.topics || []).sort((a, b) => a.order - b.order).map((topic, idx) => (
                                                <div key={topic.id} className="glass-effect" style={{ padding: '1.2rem 1.5rem', borderRadius: '16px', display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dim)' }}>{idx + 1}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>{topic.title}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: '1rem' }}>
                                                            <span>{topic.content_type}</span>
                                                            {topic.video_url && <span style={{ color: 'var(--primary)' }}>• Vidéo incluse</span>}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => openEditTopic(course, topic)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem' }}><HiPencilSquare size={18} /></button>
                                                        <button onClick={() => handleDeleteTopic(topic.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}><HiTrash size={18} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!course.topics || course.topics.length === 0) && (
                                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', border: '2px dashed var(--glass-border)', borderRadius: '20px' }}>
                                                    Cette formation n'a pas encore de chapitre. Cliquez sur <strong>Nouveau Chapitre</strong> pour commencer !
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {courses.length === 0 && (
                            <div className="card glass-effect" style={{ textAlign: 'center', padding: '5rem' }}>
                                <HiAcademicCap size={60} color="var(--glass-border)" style={{ marginBottom: '2rem' }} />
                                <h2>Prêt à enseigner ?</h2>
                                <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Créez votre premier cours et devenez un pilier de la connaissance sur NextLearn.</p>
                                <button className="btn btn-primary" onClick={() => setShowCourseForm(true)}>Commencer l'aventure</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card glass-effect" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Liste de vos étudiants</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Retrouvez tous les inscrits à vos formations.</p>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <HiMagnifyingGlass style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="form-control"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem', width: '250px' }}
                                />
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Étudiant</th>
                                        <th>Formation</th>
                                        <th>Inscrit le</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.filter(s =>
                                        (s.user?.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                                        (s.user?.email || '').toLowerCase().includes(studentSearch.toLowerCase())
                                    ).map(s => (
                                        <tr key={s.id}>
                                            <td>
                                                <div style={{ fontWeight: '700' }}>{s.user?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.user?.email}</div>
                                            </td>
                                            <td>{s.form?.title}</td>
                                            <td style={{ color: 'var(--text-dim)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.75rem',
                                                    background: s.is_approved ? '#22c55e22' : '#f59e0b22',
                                                    color: s.is_approved ? '#22c55e' : '#f59e0b'
                                                }}>
                                                    {s.is_approved ? 'Accès Autorisé' : 'Demande en attente'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>Aucun étudiant pour le moment.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Course Form Modal */}
            {showCourseForm && (
                <div className="modal-overlay" onClick={closeCourseModal}>
                    <div className="card glass-effect animate-slide-up" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.6rem' }}>{editingCourse ? 'Modifier le cours' : 'Nouvelle formation'}</h3>
                            <button onClick={closeCourseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><HiXMark size={24} /></button>
                        </div>

                        <form onSubmit={handleSaveCourse}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Titre de la formation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    placeholder="Ex: Maîtrisez React en 30 jours"
                                    value={courseData.title}
                                    onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                                    style={{ padding: '0.6rem 0.8rem' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label>Prix (€)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        required
                                        min="0"
                                        max="999999"
                                        step="0.01"
                                        value={courseData.price}
                                        onChange={e => setCourseData({ ...courseData, price: e.target.value })}
                                        style={{ padding: '0.6rem 0.8rem' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label>Niveau</label>
                                    <select
                                        className="form-control"
                                        value={courseData.level}
                                        onChange={e => setCourseData({ ...courseData, level: e.target.value })}
                                        style={{ padding: '0.6rem 0.8rem' }}
                                    >
                                        <option value="Débutant">Débutant</option>
                                        <option value="Intermédiaire">Intermédiaire</option>
                                        <option value="Avancé">Avancé</option>
                                        <option value="Tous niveaux">Tous niveaux</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label>Type de formation</label>
                                    <select
                                        className="form-control"
                                        value={courseData.type}
                                        onChange={e => setCourseData({ ...courseData, type: e.target.value })}
                                        style={{ padding: '0.6rem 0.8rem' }}
                                    >
                                        <option value="Admission">Cours Standard</option>
                                        <option value="Audition">Atelier Intensif</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label>Catégorie</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        list="category-suggestions"
                                        placeholder="IA, Web..."
                                        value={courseData.category_name || courseData.tags || ''}
                                        onChange={e => setCourseData({ ...courseData, category_name: e.target.value, tags: e.target.value })}
                                        required
                                        style={{ padding: '0.6rem 0.8rem' }}
                                    />
                                    <datalist id="category-suggestions">
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    required
                                    placeholder="Ce que les étudiants vont apprendre..."
                                    value={courseData.description}
                                    onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                                    style={{ padding: '0.6rem 0.8rem' }}
                                ></textarea>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Image de couverture</label>
                                <div style={{ marginBottom: '1rem', border: '2px dashed var(--glass-border)', borderRadius: '15px', overflow: 'hidden', height: imagePreview ? '180px' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                type="button"
                                                onClick={() => { setImagePreview(null); setCourseData({ ...courseData, image: null }); }}
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <HiXMark />
                                            </button>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                                            <div style={{ fontSize: '0.8rem' }}>Recommandé: 1200x800px</div>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setCourseData({ ...courseData, image: file });
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    style={{ padding: '0.5rem' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                                {editingCourse ? 'Enregistrer' : 'Créer la formation'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Topic Form Modal */}
            {showTopicForm && (
                <div className="modal-overlay" onClick={closeTopicModal}>
                    <div className="card glass-effect animate-slide-up" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.6rem' }}>{editingTopic ? 'Modifier le chapitre' : 'Ajouter un chapitre'}</h3>
                            <button onClick={closeTopicModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><HiXMark size={24} /></button>
                        </div>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '1.2rem', fontSize: '0.9rem' }}>Formation : <strong>{showTopicForm.title}</strong></p>

                        <form onSubmit={handleSaveTopic}>
                            <div className="form-group">
                                <label>Titre du chapitre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={topicData.title}
                                    onChange={e => setTopicData({ ...topicData, title: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Type de contenu</label>
                                    <select
                                        className="form-control"
                                        value={topicData.content_type}
                                        onChange={e => setTopicData({ ...topicData, content_type: e.target.value })}
                                    >
                                        <option value="Text">Texte / Notes</option>
                                        <option value="Video">Vidéo</option>
                                        <option value="Quiz">Quiz</option>
                                        <option value="File">Fichier</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={topicData.order}
                                        onChange={e => setTopicData({ ...topicData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Média du chapitre (Vidéo depuis le PC ou lien)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="video/*"
                                            onChange={e => setTopicData({ ...topicData, video_file: e.target.files[0] })}
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                        <HiVideoCamera size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                    </div>
                                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>OU</div>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="url"
                                            className="form-control"
                                            placeholder="https://youtube.com/... (Lien externe)"
                                            value={topicData.video_url}
                                            onChange={e => setTopicData({ ...topicData, video_url: e.target.value })}
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                        <HiTag size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Contenu pédagogique / Notes</label>
                                <textarea
                                    className="form-control"
                                    rows="8"
                                    required
                                    placeholder="Contenu textuel du cours..."
                                    value={topicData.content}
                                    onChange={e => setTopicData({ ...topicData, content: e.target.value })}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                                {editingTopic ? 'Mettre à jour le chapitre' : 'Enregistrer le chapitre'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorDashboard;
