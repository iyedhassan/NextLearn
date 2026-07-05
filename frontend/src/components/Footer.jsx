import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiPaperAirplane } from 'react-icons/hi2';
import { FaTwitter, FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 5000);
        }
    };

    return (
        <footer style={{ padding: '80px 0 40px', background: '#03070b', borderTop: '1px solid var(--glass-border)' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr',
                    gap: '4rem',
                    marginBottom: '60px',
                    '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } // Responsive
                }}>

                    {/* Brand Info */}
                    <div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', textDecoration: 'none', color: 'inherit' }}>
                            <img src="/logo.jpg" alt="Logo NextLearn" style={{ height: '35px', borderRadius: '5px' }} />
                            <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>NextLearn</span>
                        </Link>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                            La plateforme d'apprentissage nouvelle génération pour les innovateurs de demain.
                        </p>
                        <div style={{ display: 'flex', gap: '1.2rem', fontSize: '1.3rem', color: 'var(--text-dim)' }}>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: 'inherit', transition: 'color 0.3s' }} className="social-link"><FaTwitter /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: 'inherit', transition: 'color 0.3s' }} className="social-link"><FaLinkedin /></a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: 'inherit', transition: 'color 0.3s' }} className="social-link"><FaInstagram /></a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: 'inherit', transition: 'color 0.3s' }} className="social-link"><FaFacebook /></a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 style={{ marginBottom: '1.5rem' }}>Plateforme</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Accueil</Link></li>
                            <li><Link to="/courses" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Cours</Link></li>
                            <li><a href="/#testimonials" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Témoignages</a></li>
                            <li><a href="/#about" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>À propos</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 style={{ marginBottom: '1.5rem' }}>Support</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Centre d'aide</Link></li>
                            <li><a href="#contact" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Contact</a></li>
                            <li><Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Confidentialité</Link></li>
                            <li><Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>CGU</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div id="contact">
                        <h4 style={{ marginBottom: '1.5rem' }}>Newsletter</h4>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                            Recevez nos nouveautés et conseils d’apprentissage directement dans votre boîte mail.
                        </p>
                        <form onSubmit={handleSubscribe} style={{ position: 'relative' }}>
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                className="footer-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.8rem 3rem 0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                            />
                            <button
                                type="submit"
                                style={{
                                    position: 'absolute', right: '5px', top: '5px', bottom: '5px',
                                    background: 'var(--brand-gradient)', border: 'none', borderRadius: '8px',
                                    padding: '0 1rem', color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <HiPaperAirplane />
                            </button>
                        </form>
                        {subscribed && (
                            <p style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.5rem', animate: 'fade-in 0.5s' }}>
                                Merci pour votre inscription !
                            </p>
                        )}
                    </div>

                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    &copy; 2024 NextLearn. Tous droits réservés. Design by Antigravity.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
