/**
 * Exemples d'intégration frontend pour la gestion des cours avec images
 * NextLearn - Gestion des cours avec photos
 */

// Configuration de base
const API_BASE_URL = '/api';
const STORAGE_BASE_URL = '/storage';

// Token d'authentification (à récupérer depuis le localStorage ou autre)
let authToken = localStorage.getItem('auth_token');

// Headers par défaut pour les requêtes API
const getHeaders = (includeContentType = true) => {
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
    };
    
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    
    return headers;
};

/**
 * Classe pour gérer les cours
 */
class CourseManager {
    
    /**
     * Récupérer la liste des cours
     */
    async getCourses(filters = {}) {
        const params = new URLSearchParams(filters);
        const url = `${API_BASE_URL}/forms?${params}`;
        
        try {
            const response = await fetch(url, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des cours:', error);
            throw error;
        }
    }
    
    /**
     * Créer un nouveau cours
     */
    async createCourse(courseData, imageFile = null) {
        const formData = new FormData();
        
        // Ajouter les données du cours
        Object.keys(courseData).forEach(key => {
            if (courseData[key] !== null && courseData[key] !== undefined) {
                formData.append(key, courseData[key]);
            }
        });
        
        // Ajouter l'image si fournie
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/forms`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la création du cours');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création du cours:', error);
            throw error;
        }
    }
    
    /**
     * Mettre à jour un cours
     */
    async updateCourse(courseId, courseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/forms/${courseId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(courseData)
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du cours:', error);
            throw error;
        }
    }
    
    /**
     * Supprimer un cours
     */
    async deleteCourse(courseId) {
        try {
            const response = await fetch(`${API_BASE_URL}/forms/${courseId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du cours:', error);
            throw error;
        }
    }
    
    /**
     * Récupérer les détails d'un cours avec ses topics
     */
    async getCourseDetails(courseId) {
        try {
            const response = await fetch(`${API_BASE_URL}/forms/${courseId}`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des détails:', error);
            throw error;
        }
    }
}

/**
 * Classe pour gérer les topics
 */
class TopicManager {
    
    /**
     * Créer un nouveau topic
     */
    async createTopic(topicData) {
        try {
            const response = await fetch(`${API_BASE_URL}/topics`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(topicData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la création du topic');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création du topic:', error);
            throw error;
        }
    }
    
    /**
     * Mettre à jour un topic
     */
    async updateTopic(topicId, topicData) {
        try {
            const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(topicData)
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du topic:', error);
            throw error;
        }
    }
    
    /**
     * Supprimer un topic
     */
    async deleteTopic(topicId) {
        try {
            const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du topic:', error);
            throw error;
        }
    }
}

/**
 * Classe pour gérer l'upload d'images
 */
class ImageUploader {
    
    /**
     * Upload d'une image de cours
     */
    async uploadCourseImage(imageFile, courseId = null) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        if (courseId) {
            formData.append('course_id', courseId);
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/upload/course-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de l\'upload de l\'image:', error);
            throw error;
        }
    }
    
    /**
     * Upload d'une image de topic
     */
    async uploadTopicImage(imageFile, topicId = null) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        if (topicId) {
            formData.append('topic_id', topicId);
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/upload/topic-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de l\'upload de l\'image:', error);
            throw error;
        }
    }
    
    /**
     * Upload de plusieurs images
     */
    async uploadMultipleImages(imageFiles, type = 'topic') {
        const formData = new FormData();
        
        imageFiles.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });
        
        formData.append('type', type);
        
        try {
            const response = await fetch(`${API_BASE_URL}/upload/multiple-images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de l\'upload des images:', error);
            throw error;
        }
    }
    
    /**
     * Supprimer une image
     */
    async deleteImage(imagePath) {
        try {
            const response = await fetch(`${API_BASE_URL}/upload/delete-image`, {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ path: imagePath })
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'image:', error);
            throw error;
        }
    }
}

/**
 * Utilitaires pour l'interface utilisateur
 */
class UIHelpers {
    
    /**
     * Afficher un aperçu d'image
     */
    static previewImage(file, previewElementId) {
        const reader = new FileReader();
        const previewElement = document.getElementById(previewElementId);
        
        reader.onload = function(e) {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
    
    /**
     * Valider un fichier image
     */
    static validateImageFile(file, maxSizeMB = 2) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Type de fichier non autorisé. Utilisez JPEG, PNG ou GIF.');
        }
        
        if (file.size > maxSizeBytes) {
            throw new Error(`Le fichier est trop volumineux. Taille maximum: ${maxSizeMB}MB`);
        }
        
        return true;
    }
    
    /**
     * Créer un élément de galerie d'images
     */
    static createImageGallery(images, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        images.forEach((image, index) => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'col-md-4 mb-3';
            imageDiv.innerHTML = `
                <div class="card">
                    <img src="${image.url}" class="card-img-top" alt="Image ${index + 1}">
                    <div class="card-body p-2">
                        <button class="btn btn-sm btn-danger" onclick="removeImage('${image.path}', this)">
                            Supprimer
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(imageDiv);
        });
    }
    
    /**
     * Afficher une notification
     */
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.insertBefore(notification, document.body.firstChild);
        
        // Auto-supprimer après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

/**
 * Exemples d'utilisation
 */

// Initialiser les gestionnaires
const courseManager = new CourseManager();
const topicManager = new TopicManager();
const imageUploader = new ImageUploader();

// Exemple 1: Créer un cours avec image
async function createCourseExample() {
    try {
        const courseData = {
            title: 'Mon Nouveau Cours',
            type: 'Exercise',
            description: 'Description de mon cours',
            level: 'Débutant',
            price: 99.99,
            tags: 'web,html,css'
        };
        
        // Récupérer le fichier image depuis un input
        const imageInput = document.getElementById('courseImage');
        const imageFile = imageInput.files[0];
        
        if (imageFile) {
            UIHelpers.validateImageFile(imageFile);
        }
        
        const course = await courseManager.createCourse(courseData, imageFile);
        
        UIHelpers.showNotification('Cours créé avec succès !', 'success');
        console.log('Cours créé:', course);
        
        return course;
    } catch (error) {
        UIHelpers.showNotification(`Erreur: ${error.message}`, 'danger');
        console.error(error);
    }
}

// Exemple 2: Ajouter un topic avec contenu riche
async function addTopicWithImages(courseId) {
    try {
        // Upload des images d'abord
        const imageInput = document.getElementById('topicImages');
        const imageFiles = Array.from(imageInput.files);
        
        let imageUrls = [];
        if (imageFiles.length > 0) {
            const uploadResult = await imageUploader.uploadMultipleImages(imageFiles, 'topic');
            imageUrls = uploadResult.images.map(img => img.full_url);
        }
        
        // Créer le contenu HTML avec les images
        let content = `
            <h2>Mon Topic avec Images</h2>
            <p>Voici un exemple de topic avec du contenu riche.</p>
        `;
        
        imageUrls.forEach((url, index) => {
            content += `<img src="${url}" alt="Image ${index + 1}" class="img-fluid my-3">`;
        });
        
        const topicData = {
            form_id: courseId,
            title: 'Topic avec Images',
            content_type: 'Text',
            content: content,
            order: 1,
            is_preview: false
        };
        
        const topic = await topicManager.createTopic(topicData);
        
        UIHelpers.showNotification('Topic créé avec succès !', 'success');
        console.log('Topic créé:', topic);
        
        return topic;
    } catch (error) {
        UIHelpers.showNotification(`Erreur: ${error.message}`, 'danger');
        console.error(error);
    }
}

// Exemple 3: Afficher la liste des cours
async function displayCourses() {
    try {
        const courses = await courseManager.getCourses({
            state: 'Published',
            sort: 'newest'
        });
        
        const container = document.getElementById('coursesContainer');
        container.innerHTML = '';
        
        courses.data.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'col-md-4 mb-4';
            courseCard.innerHTML = `
                <div class="card h-100">
                    <img src="${course.image_url || '/images/default-course.jpg'}" 
                         class="card-img-top" alt="${course.title}">
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <p class="card-text">${course.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">${course.level}</span>
                            <span class="text-muted">${course.price}€</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm" onclick="viewCourse(${course.id})">
                            Voir le cours
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(courseCard);
        });
        
    } catch (error) {
        UIHelpers.showNotification(`Erreur: ${error.message}`, 'danger');
        console.error(error);
    }
}

// Fonction globale pour supprimer une image
async function removeImage(imagePath, buttonElement) {
    try {
        await imageUploader.deleteImage(imagePath);
        
        // Supprimer l'élément du DOM
        const cardElement = buttonElement.closest('.col-md-4');
        if (cardElement) {
            cardElement.remove();
        }
        
        UIHelpers.showNotification('Image supprimée avec succès !', 'success');
    } catch (error) {
        UIHelpers.showNotification(`Erreur: ${error.message}`, 'danger');
        console.error(error);
    }
}

// Fonction globale pour voir un cours
async function viewCourse(courseId) {
    try {
        const course = await courseManager.getCourseDetails(courseId);
        
        // Rediriger vers la page du cours ou afficher dans une modal
        window.location.href = `/courses/${courseId}`;
        
    } catch (error) {
        UIHelpers.showNotification(`Erreur: ${error.message}`, 'danger');
        console.error(error);
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Charger les cours si on est sur la page d'accueil
    if (document.getElementById('coursesContainer')) {
        displayCourses();
    }
    
    // Configurer les événements de drag & drop pour les images
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                // Traiter les fichiers déposés
                handleDroppedFiles(files, zone);
            }
        });
    });
});

// Fonction pour traiter les fichiers déposés
function handleDroppedFiles(files, dropZone) {
    Array.from(files).forEach(file => {
        try {
            UIHelpers.validateImageFile(file);
            
            // Afficher l'aperçu
            const previewId = dropZone.dataset.previewId;
            if (previewId) {
                UIHelpers.previewImage(file, previewId);
            }
            
        } catch (error) {
            UIHelpers.showNotification(`Erreur: ${error.message}`, 'danger');
        }
    });
}

// Exporter les classes pour utilisation globale
window.CourseManager = CourseManager;
window.TopicManager = TopicManager;
window.ImageUploader = ImageUploader;
window.UIHelpers = UIHelpers;