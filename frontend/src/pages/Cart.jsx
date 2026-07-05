import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { HiTrash, HiArrowRight, HiCheckCircle, HiCreditCard, HiBanknotes } from 'react-icons/hi2';
import { HiOutlineShoppingCart } from 'react-icons/hi';

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

const Cart = () => {
    const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Carte Bancaire');

    useEffect(() => {
        if (user && (user.role === 'Admin' || user.role === 'Tutor')) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleInitialCheckout = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Payment form is now always visible for paid items, so we proceed directly
        processOrder();
    };

    const processOrder = async () => {
        setLoading(true);
        try {
            for (const item of cartItems) {
                try {
                    if (item.price > 0) {
                        // Create Payment Request for paid courses
                        await api.post('/payments', {
                            form_id: item.id,
                            payment_method: paymentMethod,
                            payment_details: { type: 'cart_checkout' }
                        });
                    } else {
                        // Direct validation for free courses
                        await api.post(`/forms/${item.id}/purchase`);
                    }
                } catch (err) {
                    // Ignore 422 (already purchased/pending) to allow partial success
                    if (err.response?.status !== 422) {
                        console.error(`Failed to process item ${item.id}`, err);
                    }
                }
            }

            setOrderSuccess(true);
            clearCart();
            const hasPaidItems = cartItems.some(i => i.price > 0);
            setTimeout(() => navigate(hasPaidItems ? '/dashboard?tab=payments' : '/dashboard?tab=courses'), 4000);
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Erreur lors de la validation de la commande. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div style={{ padding: '150px 0', textAlign: 'center', background: 'var(--bg-gradient)', minHeight: '100vh' }}>
                <div className="container">
                    <div className="card glass-effect animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem' }}>
                        <HiCheckCircle size={80} color="var(--success)" style={{ marginBottom: '2rem' }} />
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Commande enregistrée !</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                            {cartItems.some(i => i.price > 0)
                                ? "Vos paiements ont été soumis à validation. Vous serez notifié dès l'activation de vos cours."
                                : "Vos inscriptions gratuites ont été validées. Bon apprentissage !"}
                        </p>
                        <Link to="/dashboard?tab=payments" className="btn btn-primary">Suivre mes commandes</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '120px 0', background: 'var(--bg-gradient)', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Votre <span className="gradient-text">Panier</span></h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
                        {cartItems.length} {cartItems.length > 1 ? 'cours sélectionnés' : 'cours sélectionné'}
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="card glass-effect" style={{ textAlign: 'center', padding: '5rem' }}>
                        <HiOutlineShoppingCart size={100} color="rgba(255,255,255,0.05)" style={{ marginBottom: '2rem' }} />
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Votre panier est vide</h2>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>Explorez nos formations et commencez votre apprentissage dès aujourd'hui.</p>
                        <Link to="/courses" className="btn btn-primary" style={{ display: 'inline-flex' }}>Découvrir les cours</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {cartItems.map(item => (
                                <div key={item.id} className="card glass-effect" style={{ display: 'flex', padding: '1.5rem', gap: '2rem', alignItems: 'center' }}>
                                    <div style={{ width: '150px', height: '100px', borderRadius: '15px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={getFullImageUrl(item.image_url) || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=800&q=80'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flexGrow: 1 }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Par {item.user?.name || 'Expert NextLearn'}</p>
                                        <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: '700' }}>{item.level}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>{item.price > 0 ? `${item.price} €` : 'GRATUIT'}</div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                                        >
                                            <HiTrash size={18} /> Retirer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                            <div className="card glass-effect" style={{ padding: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Récapitulatif</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-dim)' }}>
                                    <span>Sous-total</span>
                                    <span>{cartTotal} €</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: '800', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <span>Total</span>
                                    <span className="gradient-text">{cartTotal} €</span>
                                </div>

                                {cartTotal > 0 && (
                                    <div className="animate-fade-in" style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Moyen de paiement</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {['Carte Bancaire', 'PayPal', 'Virement Bancaire'].map(method => (
                                                <label key={method} className={`payment-method ${paymentMethod === method ? 'active' : ''}`} style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem',
                                                    background: paymentMethod === method ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s',
                                                    border: paymentMethod === method ? '1px solid transparent' : '1px solid var(--glass-border)'
                                                }}>
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value={method}
                                                        checked={paymentMethod === method}
                                                        onChange={e => setPaymentMethod(e.target.value)}
                                                        style={{ accentColor: 'white' }}
                                                    />
                                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{method}</span>
                                                    {method === 'Carte Bancaire' && <HiCreditCard style={{ marginLeft: 'auto', fontSize: '1.2rem' }} />}
                                                    {method === 'Virement Bancaire' && <HiBanknotes style={{ marginLeft: 'auto', fontSize: '1.2rem' }} />}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '1.2rem', fontSize: '1.1rem', fontWeight: '800' }}
                                    onClick={handleInitialCheckout}
                                    disabled={loading}
                                >
                                    {loading ? 'Traitement en cours...' : (cartTotal > 0 ? `Payer ${cartTotal} €` : 'Valider mon inscription')} <HiArrowRight style={{ marginLeft: '1rem' }} />
                                </button>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '1.5rem' }}>
                                    En validant, vous acceptez nos conditions générales de vente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
