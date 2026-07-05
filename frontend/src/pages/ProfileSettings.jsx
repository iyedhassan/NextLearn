import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    HiUserCircle,
    HiShieldCheck,
    HiCreditCard,
    HiBell,
    HiLockClosed,
    HiPhoto,
    HiXMark,
    HiCheck
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

const ProfileSettings = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        headline: '',
        biography: '',
        website: '',
        twitter: '',
        linkedin: '',
        youtube: '',
        facebook: ''
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/me');
            const u = res.data;
            setFormData({
                first_name: u.person?.first_name || u.name.split(' ')[0] || '',
                last_name: u.person?.last_name || u.name.split(' ')[1] || '',
                headline: u.person?.specialization || '',
                biography: u.person?.bio || '',
                website: u.person?.website || '',
                twitter: u.person?.twitter || '',
                linkedin: u.person?.linkedin || '',
                youtube: u.person?.youtube || '',
                facebook: u.person?.facebook || ''
            });
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');

        try {
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                headline: formData.headline,
                biography: formData.biography,
                website: formData.website,
                twitter: formData.twitter,
                linkedin: formData.linkedin,
                youtube: formData.youtube,
                facebook: formData.facebook
            };

            const res = await api.put(`/users/${user.id}`, payload);

            // Update local user context if necessary
            if (res.data) {
                setUser(res.data);
            }

            setSuccessMessage('Profil mis à jour avec succès !');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || "Erreur lors de la sauvegarde.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_photo', file);

        setLoading(true);
        try {
            // Use the newly created endpoint
            const res = await api.post(`/users/${user.id}/photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMessage('Photo mise à jour avec succès !');
            if (setUser && res.data) {
                // Update the user context with new photo path if returned
                // Ensure res.data contains the updated user object with profile_photo_path
                setUser(prev => ({ ...prev, profile_photo_path: res.data.profile_photo_path }));
            }
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'upload. Vérifiez que l'image fait moins de 2Mo.");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAccount = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            try {
                await api.delete(`/users/${user.id}`);
                alert("Compte supprimé.");
                window.location.href = '/login';
            } catch (err) {
                console.error(err);
                alert("Erreur lors de la suppression.");
            }
        }
    };

    const sidebarItems = [
        { id: 'view_public', label: 'Voir le profil public', icon: <HiUserCircle /> },
        { id: 'profile', label: 'Profil', icon: <HiUserCircle /> },
        { id: 'photo', label: 'Photo de profil', icon: <HiPhoto /> },
        { id: 'close_account', label: 'Fermer le compte', icon: <HiXMark /> },
    ];

    return (
        <div style={{ paddingTop: '120px', minHeight: '100vh', background: 'var(--bg-gradient)', color: 'white' }}>
            <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>

                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Paramètres du Compte</h1>

                <div className="glass-effect" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', borderRadius: '24px', overflow: 'hidden', minHeight: '600px' }}>

                    {/* Left Sidebar */}
                    <div style={{ borderRight: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ width: '100px', height: '100px', background: 'var(--brand-gradient)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflow: 'hidden', position: 'relative' }}>
                                {user?.profile_photo_path ? (
                                    <img src={getFullImageUrl(user.profile_photo_path)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span>{user?.name ? user.name.substring(0, 2).toUpperCase() : 'IH'}</span>
                                )}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{formData.first_name || user?.name} {formData.last_name}</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                {user?.role === 'Admin' ? 'Administrateur' : user?.role === 'Tutor' ? 'Instructeur' : 'Étudiant'}
                            </p>
                        </div>

                        <div style={{ padding: '1.5rem 0' }}>
                            {sidebarItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 2rem',
                                        textAlign: 'left',
                                        background: activeTab === item.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                                        color: activeTab === item.id ? 'var(--primary)' : 'var(--text-dim)',
                                        borderRight: activeTab === item.id ? '3px solid var(--primary)' : '3px solid transparent',
                                        borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === item.id ? '700' : '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Content */}
                    <div style={{ padding: '3rem' }}>

                        {successMessage && (
                            <div className="animate-fade-in" style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                <HiCheck size={20} /> {successMessage}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="animate-fade-in">
                                <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Profil Public</h2>
                                    <p style={{ color: 'var(--text-dim)' }}>Modifiez vos informations personnelles.</p>
                                </div>
                                <form onSubmit={handleSave}>
                                    <div className="form-group">
                                        <label>Informations de base</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Prénom"
                                                value={formData.first_name}
                                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Nom"
                                                value={formData.last_name}
                                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label style={{ margin: 0 }}>Titre / Spécialisation</label>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{60 - formData.headline.length}</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Instructeur React & Node.js"
                                            maxLength={60}
                                            value={formData.headline}
                                            onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Biographie</label>
                                        <textarea
                                            rows="6"
                                            className="form-control"
                                            value={formData.biography}
                                            onChange={e => setFormData({ ...formData, biography: e.target.value })}
                                            style={{ resize: 'vertical', lineHeight: '1.6' }}
                                        ></textarea>
                                    </div>

                                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-primary"
                                            style={{ padding: '1rem 3rem', opacity: loading ? 0.7 : 1 }}
                                        >
                                            {loading ? 'Enregistrement...' : 'Sauvegarder'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'view_public' && (
                            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                                <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--brand-gradient)', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', overflow: 'hidden', position: 'relative' }}>
                                    {user?.profile_photo_path ? (
                                        <img src={`http://localhost:8000/storage/${user.profile_photo_path}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span>{user?.name ? user.name.substring(0, 2).toUpperCase() : 'IH'}</span>
                                    )}
                                </div>
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white' }}>{formData.first_name || user?.name} {formData.last_name}</h2>
                                <p style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '2rem', fontWeight: '600' }}>{formData.headline || 'Aucun titre défini'}</p>
                                <div style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.8', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px' }}>
                                    {formData.biography || 'Aucune biographie disponible.'}
                                </div>
                            </div>
                        )}

                        {activeTab === 'photo' && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem' }}>Photo de profil</h2>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '20px', textAlign: 'center', border: '2px dashed var(--glass-border)' }}>
                                    <HiPhoto size={60} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                                    <p style={{ marginBottom: '2rem' }}>Glissez une image ici ou cliquez pour télécharger.</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        style={{ display: 'none' }}
                                        id="photo-upload"
                                    />
                                    <label htmlFor="photo-upload" className="btn btn-primary" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                                        Choisir une image
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'close_account' && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem', color: '#ef4444' }}>Zone Danger</h2>
                                <p style={{ marginBottom: '2rem', color: 'var(--text-dim)' }}>Une fois votre compte supprimé, toutes vos données (cours, progression, certificats) seront définitivement effacées. Cette action est irréversible.</p>
                                <button onClick={handleCloseAccount} className="btn" style={{ background: '#ef4444', color: 'white' }}>
                                    Supprimer mon compte définitivement
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
