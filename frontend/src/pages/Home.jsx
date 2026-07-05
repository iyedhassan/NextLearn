import { HiRocketLaunch, HiClipboardDocumentCheck, HiAcademicCap, HiDevicePhoneMobile, HiArrowRight } from 'react-icons/hi2';
import { Link, useNavigate } from 'react-router-dom';
import PopularCourses from '../components/PopularCourses';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleExplore = (e) => {
        if (!user) {
            e.preventDefault();
            alert("Veuillez vous connecter pour explorer nos cours.");
            navigate('/login');
            return;
        }
        // If logged in, allow scrolling to #courses
        const element = document.getElementById('courses');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="landing-page">
            {/* HEREO SECTION */}
            <section className="hero-section">
                <div className="hero-bg-glow" style={{ left: '-150px', top: '20%' }}></div>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    <div className="animate-fade-in">
                        <span style={{ color: 'var(--accent)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                            Futur de l'apprentissage
                        </span>
                        <h1 style={{ fontSize: '4.5rem', marginTop: '1rem', lineHeight: '1.1' }}>
                            Apprenez <span className="gradient-text">aujourd’hui</span>, transformez <span className="gradient-text">demain.</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', margin: '2rem 0 3rem', maxWidth: '600px' }}>
                            Plongez dans un univers pédagogique innovant et maîtrisez les technologies qui façonnent notre avenir.
                            Rejoignez la communauté NextLearn.
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <button onClick={handleExplore} className="btn btn-primary">
                                Explorer les cours <HiArrowRight />
                            </button>
                            <Link to="/register" className="btn btn-secondary">
                                S'inscrire gratuitement
                            </Link>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div className="glass-effect" style={{ borderRadius: '30px', padding: '1rem', border: '1px solid var(--glass-border)' }}>
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                                alt="Student Learning"
                                style={{ width: '100%', borderRadius: '20px', display: 'block' }}
                            />
                        </div>
                        {/* Floating elements for dynamic look */}
                        <div className="glass-effect" style={{ position: 'absolute', bottom: '-30px', left: '-30px', padding: '1.5rem', borderRadius: '20px', animation: 'float 6s infinite ease-in-out' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px' }}><HiAcademicCap size={24} /></div>
                                <div>
                                    <h4 style={{ margin: 0 }}>Certifié</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem' }}>Reconnaissance mondiale</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* POPULAR COURSES SECTION */}
            <PopularCourses />

            {/* AVANTAGES SECTION */}
            <section style={{ padding: '100px 0' }} id="about">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem' }}>Pourquoi choisir <span className="gradient-text">NextLearn</span> ?</h2>
                        <p style={{ color: 'var(--text-dim)' }}>Une approche centrée sur l'excellence et l'innovation.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: <HiRocketLaunch />, title: 'Apprentissage interactif', desc: 'Des modules dynamiques conçus pour engager et inspirer.' },
                            { icon: <HiClipboardDocumentCheck />, title: 'Suivi personnalisé', desc: 'Un tableau de bord intelligent pour piloter votre progression.' },
                            { icon: <HiAcademicCap />, title: 'Contenu certifié', desc: 'Des formations validées par des experts de l’industrie.' },
                            { icon: <HiDevicePhoneMobile />, title: 'Accès flexible', desc: 'Apprenez partout, tout le temps sur n’importe quel support.' },
                        ].map((item, i) => (
                            <div key={i} className="card glass-effect" style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '70px', height: '70px', background: 'rgba(0, 97, 255, 0.1)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '2rem', color: 'var(--primary)',
                                    margin: '0 auto 1.5rem'
                                }}>
                                    {item.icon}
                                </div>
                                <h3>{item.title}</h3>
                                <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section style={{ padding: '100px 0' }} id="testimonials">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem' }}>La voix de nos <span className="gradient-text">Étudiants</span></h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { name: 'Sarah L.', role: 'Data Scientist', text: "NextLearn a radicalement changé ma façon d'aborder les nouvelles technos. La pédagogie est exceptionnelle." },
                            { name: 'Marc D.', role: 'Entrepreneur', text: "Les cours sont concrets, directs et très bien structurés. On sent que ce sont des experts qui parlent." },
                            { name: 'Léa M.', role: 'Etudiante', text: "La flexibilité de la plateforme est un énorme plus. Je peux étudier entre deux cours très facilement." },
                        ].map((t, i) => (
                            <div key={i} className="testimonial-card glass-effect">
                                <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--text-dim)' }}>"{t.text}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-gradient)' }}></div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{t.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MISSION SECTION */}
            <section style={{ padding: '100px 0', background: 'var(--brand-gradient)', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Prêt à transformer votre avenir ?</h2>
                    <p style={{ fontSize: '1.3rem', marginBottom: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
                        Notre mission est de rendre l'éducation accessible, innovante et motivante pour tous.
                        Rejoignez-nous et commencez votre ascension.
                    </p>
                    <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '1rem 3rem' }}>
                        S'inscrire maintenant
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
