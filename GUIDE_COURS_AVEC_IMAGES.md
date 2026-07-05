# Guide : Insérer des Cours avec des Photos dans NextLearn

Ce guide vous explique comment créer et gérer des cours avec des images dans la plateforme NextLearn.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure des cours](#structure-des-cours)
3. [Méthodes d'insertion](#méthodes-dinsertion)
4. [API Endpoints](#api-endpoints)
5. [Exemples pratiques](#exemples-pratiques)
6. [Gestion des images](#gestion-des-images)
7. [Bonnes pratiques](#bonnes-pratiques)

## 🎯 Vue d'ensemble

Dans NextLearn, les cours sont représentés par le modèle `Form` qui peut contenir :
- **Image de couverture** : Photo principale du cours
- **Topics** : Chapitres avec contenu riche (texte, images, vidéos)
- **Métadonnées** : Titre, description, prix, niveau, etc.

## 🏗️ Structure des cours

### Modèle Form (Cours)
```php
- id
- user_id (créateur)
- title (titre)
- type (Exercise, Exam, Admission, Audition)
- description
- tags
- level (Débutant, Intermédiaire, Avancé)
- price
- image (image de couverture)
- state (Draft, Published)
```

### Modèle Topic (Chapitre)
```php
- id
- form_id (cours parent)
- title
- content_type (Text, Video, Quiz, File)
- content (contenu HTML avec images)
- video_url
- order (ordre d'affichage)
- is_preview (aperçu gratuit)
```

## 🔧 Méthodes d'insertion

### 1. Via l'API REST

#### Créer un cours avec image
```bash
POST /api/forms
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
    "title": "Mon Cours de Photographie",
    "type": "Exercise",
    "description": "Apprenez les bases de la photographie",
    "level": "Débutant",
    "price": 99.99,
    "tags": "photo,art,créativité",
    "image": "courses/photography-101.jpg",
    "state": "Published"
}
```

#### Ajouter un topic avec contenu riche
```bash
POST /api/topics
Content-Type: application/json
Authorization: Bearer {token}

{
    "form_id": 1,
    "title": "Composition photographique",
    "content_type": "Text",
    "content": "<h2>La règle des tiers</h2><p>Une technique fondamentale...</p><img src='/storage/topics/rule-of-thirds.jpg' alt='Règle des tiers' class='img-fluid'>",
    "order": 1,
    "is_preview": true
}
```

### 2. Via le formulaire HTML

Utilisez le fichier `examples/course_creation_form.html` qui fournit :
- Interface drag & drop pour les images
- Éditeur de contenu riche
- Gestion des topics
- Aperçu en temps réel

### 3. Via les seeders

Exécutez le seeder pour créer des cours d'exemple :
```bash
php artisan db:seed --class=CoursesWithImagesSeeder
```

### 4. Via le script PHP

Utilisez `examples/create_course_with_images.php` pour des insertions programmatiques.

## 🌐 API Endpoints

### Gestion des cours
```
GET    /api/forms              - Liste des cours
POST   /api/forms              - Créer un cours
GET    /api/forms/{id}         - Détails d'un cours
PUT    /api/forms/{id}         - Modifier un cours
DELETE /api/forms/{id}         - Supprimer un cours
POST   /api/forms/{id}/purchase - Acheter un cours
```

### Gestion des topics
```
GET    /api/topics?form_id={id} - Topics d'un cours
POST   /api/topics              - Créer un topic
GET    /api/topics/{id}         - Détails d'un topic
PUT    /api/topics/{id}         - Modifier un topic
DELETE /api/topics/{id}         - Supprimer un topic
```

### Upload d'images
```
POST   /api/upload/course-image    - Upload image de cours
POST   /api/upload/topic-image     - Upload image de topic
POST   /api/upload/multiple-images - Upload multiple images
DELETE /api/upload/delete-image    - Supprimer une image
```

## 💡 Exemples pratiques

### Exemple 1 : Cours de cuisine avec photos

```php
// Créer le cours
$course = Form::create([
    'user_id' => auth()->id(),
    'title' => 'Cuisine Française Traditionnelle',
    'type' => 'Exercise',
    'description' => 'Découvrez les secrets de la cuisine française',
    'level' => 'Débutant',
    'price' => 79.99,
    'image' => 'courses/french-cuisine.jpg',
    'tags' => 'cuisine,français,gastronomie',
    'state' => 'Published'
]);

// Ajouter un topic avec recette illustrée
Topic::create([
    'form_id' => $course->id,
    'title' => 'Coq au Vin',
    'content_type' => 'Text',
    'content' => '
        <h2>Coq au Vin Traditionnel</h2>
        <img src="/storage/topics/coq-au-vin-final.jpg" alt="Coq au vin" class="img-fluid mb-3">
        
        <h3>Ingrédients</h3>
        <div class="row">
            <div class="col-md-6">
                <img src="/storage/topics/ingredients-coq-au-vin.jpg" alt="Ingrédients" class="img-fluid">
            </div>
            <div class="col-md-6">
                <ul>
                    <li>1 coq fermier</li>
                    <li>75cl de vin rouge</li>
                    <li>200g de lardons</li>
                    <li>250g de champignons</li>
                </ul>
            </div>
        </div>
        
        <h3>Étapes de préparation</h3>
        <div class="step">
            <h4>Étape 1 : Préparer le coq</h4>
            <img src="/storage/topics/step1-coq.jpg" alt="Étape 1" class="img-fluid mb-2">
            <p>Découper le coq en morceaux...</p>
        </div>
    ',
    'order' => 1
]);
```

### Exemple 2 : Cours de programmation avec captures d'écran

```php
Topic::create([
    'form_id' => $webCourse->id,
    'title' => 'Configuration de l\'environnement',
    'content_type' => 'Text',
    'content' => '
        <h2>Installer Visual Studio Code</h2>
        <p>VS Code est l\'éditeur recommandé pour ce cours.</p>
        
        <h3>Téléchargement</h3>
        <img src="/storage/topics/vscode-download.png" alt="Télécharger VS Code" class="img-fluid mb-3">
        
        <h3>Installation</h3>
        <div class="row">
            <div class="col-md-4">
                <img src="/storage/topics/install-step1.png" alt="Étape 1" class="img-fluid mb-2">
                <p class="text-center">Étape 1</p>
            </div>
            <div class="col-md-4">
                <img src="/storage/topics/install-step2.png" alt="Étape 2" class="img-fluid mb-2">
                <p class="text-center">Étape 2</p>
            </div>
            <div class="col-md-4">
                <img src="/storage/topics/install-step3.png" alt="Étape 3" class="img-fluid mb-2">
                <p class="text-center">Étape 3</p>
            </div>
        </div>
        
        <h3>Extensions recommandées</h3>
        <img src="/storage/topics/vscode-extensions.png" alt="Extensions VS Code" class="img-fluid">
    ',
    'order' => 1
]);
```

## 🖼️ Gestion des images

### Stockage des images

Les images sont stockées dans `storage/app/public/` :
```
storage/app/public/
├── courses/          # Images de couverture des cours
│   ├── web-dev.jpg
│   ├── photography.jpg
│   └── cooking.jpg
└── topics/           # Images des topics
    ├── html-basics.png
    ├── css-flexbox.jpg
    └── recipe-step1.jpg
```

### URLs d'accès

- **Stockage local** : `/storage/courses/image.jpg`
- **URL complète** : `https://domain.com/storage/courses/image.jpg`
- **CDN** : `https://cdn.domain.com/courses/image.jpg`

### Upload via API

```javascript
// Upload d'une image de cours
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('course_id', courseId);

fetch('/api/upload/course-image', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    body: formData
})
.then(response => response.json())
.then(data => {
    console.log('Image uploadée:', data.full_url);
});
```

### Optimisation des images

```php
// Dans le contrôleur d'upload
use Intervention\Image\Facades\Image;

public function uploadCourseImage(Request $request)
{
    $file = $request->file('image');
    
    // Redimensionner l'image
    $image = Image::make($file)
        ->resize(800, 600, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        })
        ->encode('jpg', 85);
    
    // Sauvegarder
    $filename = 'courses/' . Str::random(20) . '.jpg';
    Storage::disk('public')->put($filename, $image);
    
    return response()->json([
        'path' => $filename,
        'url' => asset('storage/' . $filename)
    ]);
}
```

## ✅ Bonnes pratiques

### 1. Nommage des fichiers
```php
// ✅ Bon
'courses/web-development-intro-' . time() . '.jpg'
'topics/html-basics-' . Str::random(10) . '.png'

// ❌ Éviter
'image.jpg'
'photo1.png'
```

### 2. Tailles d'images recommandées
- **Couverture de cours** : 800x600px (ratio 4:3)
- **Images de topics** : 600x400px maximum
- **Captures d'écran** : Largeur max 800px

### 3. Formats supportés
- **JPEG** : Photos, images complexes
- **PNG** : Captures d'écran, images avec transparence
- **WebP** : Format moderne (si supporté)

### 4. Sécurité
```php
// Validation stricte
$request->validate([
    'image' => 'required|image|mimes:jpeg,png,jpg|max:2048'
]);

// Vérification du type MIME
$mimeType = $file->getMimeType();
if (!in_array($mimeType, ['image/jpeg', 'image/png'])) {
    throw new ValidationException('Type de fichier non autorisé');
}
```

### 5. Performance
- Utilisez un CDN pour servir les images
- Implémentez le lazy loading
- Générez des thumbnails automatiquement
- Compressez les images avant upload

### 6. Accessibilité
```html
<!-- ✅ Bon -->
<img src="/storage/topics/html-structure.png" 
     alt="Diagramme montrant la structure HTML avec head et body" 
     class="img-fluid">

<!-- ❌ Éviter -->
<img src="/storage/topics/image1.png">
```

### 7. Responsive design
```html
<div class="row">
    <div class="col-md-6">
        <img src="/storage/topics/before.jpg" 
             alt="Avant retouche" 
             class="img-fluid">
    </div>
    <div class="col-md-6">
        <img src="/storage/topics/after.jpg" 
             alt="Après retouche" 
             class="img-fluid">
    </div>
</div>
```

## 🚀 Démarrage rapide

1. **Créer un utilisateur tuteur** :
```bash
php artisan tinker
User::create([
    'name' => 'Professeur Dupont',
    'email' => 'prof@example.com',
    'password' => bcrypt('password'),
    'role' => 'Tutor',
    'state' => 'Active'
]);
```

2. **Exécuter le seeder** :
```bash
php artisan db:seed --class=CoursesWithImagesSeeder
```

3. **Créer le lien symbolique pour le stockage** :
```bash
php artisan storage:link
```

4. **Tester l'API** :
```bash
curl -X GET "http://localhost:8000/api/forms" \
     -H "Accept: application/json"
```

Votre plateforme NextLearn est maintenant prête à gérer des cours avec des images ! 🎉