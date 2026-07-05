# Guide Rapide - Insérer des Cours avec Photos

## ✅ Ce qui fonctionne maintenant

Votre système NextLearn peut maintenant gérer des cours avec des images ! Voici ce qui a été mis en place :

### 🎯 Fonctionnalités disponibles

1. **Création de cours avec images de couverture**
2. **Chapitres avec contenu riche (HTML + images)**
3. **API complète pour la gestion des cours**
4. **Interface de test pour visualiser les cours**
5. **Upload d'images sécurisé**

## 🚀 Comment utiliser

### Méthode 1 : Via le script PHP (Recommandé pour débuter)

```bash
# Créer des cours d'exemple
php create_sample_course.php
```

### Méthode 2 : Via l'API REST

#### Créer un cours avec image
```bash
curl -X POST "http://localhost:8000/api/forms" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Mon Cours de Cuisine" \
  -F "type=Exercise" \
  -F "description=Apprenez la cuisine française" \
  -F "level=Débutant" \
  -F "price=89.99" \
  -F "tags=cuisine,français,gastronomie" \
  -F "image=@/chemin/vers/votre/image.jpg" \
  -F "state=Published"
```

#### Ajouter un chapitre avec contenu riche
```bash
curl -X POST "http://localhost:8000/api/topics" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": 1,
    "title": "Les Bases de la Pâtisserie",
    "content_type": "Text",
    "content": "<h2>Introduction</h2><p>Découvrez les secrets...</p><img src=\"/storage/topics/patisserie-intro.jpg\" class=\"img-fluid\">",
    "order": 1,
    "is_preview": true
  }'
```

### Méthode 3 : Via l'interface de test

1. **Démarrer le serveur** :
```bash
php artisan serve
```

2. **Ouvrir l'interface de test** :
```
http://localhost:8000/test_courses_display.html
```

## 📁 Structure des fichiers

```
NextLearn-Clean/
├── storage/app/public/
│   ├── courses/          # Images de couverture
│   └── topics/           # Images des chapitres
├── public/storage/       # Lien symbolique
├── create_sample_course.php    # Script de création
├── test_courses_display.html   # Interface de test
└── test_api_courses.php        # Tests API
```

## 🔧 Endpoints API disponibles

### Cours (Forms)
- `GET /api/forms` - Liste des cours
- `POST /api/forms` - Créer un cours (avec upload d'image)
- `GET /api/forms/{id}` - Détails d'un cours
- `PUT /api/forms/{id}` - Modifier un cours
- `DELETE /api/forms/{id}` - Supprimer un cours

### Chapitres (Topics)
- `GET /api/topics?form_id={id}` - Chapitres d'un cours
- `POST /api/topics` - Créer un chapitre
- `PUT /api/topics/{id}` - Modifier un chapitre
- `DELETE /api/topics/{id}` - Supprimer un chapitre

### Upload d'images
- `POST /api/upload/course-image` - Upload image de cours
- `POST /api/upload/topic-image` - Upload image de chapitre
- `POST /api/upload/multiple-images` - Upload multiple
- `DELETE /api/upload/delete-image` - Supprimer une image

## 💡 Exemples concrets

### Exemple 1 : Cours de photographie

```php
$course = Form::create([
    'title' => 'Photographie Numérique',
    'type' => 'Exercise',
    'description' => 'Maîtrisez votre appareil photo',
    'level' => 'Débutant',
    'price' => 129.99,
    'image' => 'courses/photo-course.jpg',
    'state' => 'Published'
]);

// Ajouter un chapitre avec images
Topic::create([
    'form_id' => $course->id,
    'title' => 'Règle des Tiers',
    'content' => '
        <h2>La Règle des Tiers</h2>
        <img src="/storage/topics/rule-of-thirds.jpg" class="img-fluid">
        <p>Technique fondamentale de composition...</p>
    ',
    'order' => 1
]);
```

### Exemple 2 : Cours de cuisine

```php
$course = Form::create([
    'title' => 'Cuisine Française',
    'type' => 'Exercise',
    'description' => 'Les secrets de la gastronomie française',
    'level' => 'Intermédiaire',
    'price' => 89.99,
    'image' => 'courses/cuisine-francaise.jpg'
]);

// Chapitre avec recette illustrée
Topic::create([
    'form_id' => $course->id,
    'title' => 'Coq au Vin',
    'content' => '
        <h2>Coq au Vin Traditionnel</h2>
        <img src="/storage/topics/coq-au-vin.jpg" class="img-fluid mb-3">
        
        <h3>Ingrédients</h3>
        <div class="row">
            <div class="col-md-6">
                <img src="/storage/topics/ingredients.jpg" class="img-fluid">
            </div>
            <div class="col-md-6">
                <ul>
                    <li>1 coq fermier</li>
                    <li>75cl de vin rouge</li>
                    <li>200g de lardons</li>
                </ul>
            </div>
        </div>
    '
]);
```

## 🎨 Bonnes pratiques pour les images

### Tailles recommandées
- **Couverture de cours** : 800x600px (ratio 4:3)
- **Images de chapitres** : 600x400px max
- **Captures d'écran** : Largeur max 800px

### Formats supportés
- JPEG (photos, images complexes)
- PNG (captures d'écran, transparence)
- GIF (animations simples)

### Optimisation
```html
<!-- Responsive -->
<img src="/storage/topics/image.jpg" class="img-fluid" alt="Description">

<!-- Avec légende -->
<div class="text-center">
    <img src="/storage/topics/demo.jpg" class="img-fluid mb-2">
    <p><small>Démonstration étape par étape</small></p>
</div>

<!-- Galerie côte à côte -->
<div class="row">
    <div class="col-md-6">
        <img src="/storage/topics/avant.jpg" class="img-fluid">
        <p class="text-center">Avant</p>
    </div>
    <div class="col-md-6">
        <img src="/storage/topics/apres.jpg" class="img-fluid">
        <p class="text-center">Après</p>
    </div>
</div>
```

## 🔍 Tests et vérifications

### Vérifier que tout fonctionne
```bash
# Tester l'API
php test_api_courses.php

# Vérifier les cours créés
curl http://localhost:8000/api/forms

# Voir un cours spécifique
curl http://localhost:8000/api/forms/19
```

### Interface de test
Ouvrez `http://localhost:8000/test_courses_display.html` pour :
- Voir tous les cours avec leurs images
- Filtrer par niveau, type, prix
- Voir les détails et chapitres
- Tester l'interface utilisateur

## 🚨 Résolution de problèmes

### Images ne s'affichent pas
```bash
# Vérifier le lien symbolique
php artisan storage:link

# Vérifier les permissions
chmod -R 755 storage/app/public
```

### Erreur 404 sur les images
- Vérifiez que les fichiers existent dans `storage/app/public/`
- Vérifiez que le lien symbolique `public/storage` existe
- Vérifiez l'URL dans la base de données

### Erreur d'upload
- Vérifiez la taille max des fichiers (2MB par défaut)
- Vérifiez les permissions d'écriture sur `storage/`
- Vérifiez que l'utilisateur est authentifié

## 🎉 Prochaines étapes

1. **Personnaliser les exemples** selon vos besoins
2. **Ajouter plus d'images** dans les dossiers de stockage
3. **Créer vos propres cours** avec le script ou l'API
4. **Intégrer dans votre frontend** avec les exemples JavaScript
5. **Ajouter des fonctionnalités** comme la compression d'images

Votre système NextLearn est maintenant prêt à gérer des cours avec des photos de manière professionnelle ! 🚀