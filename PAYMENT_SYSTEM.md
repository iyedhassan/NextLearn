# 💳 Système de Paiement avec Validation Administrative

## ✅ Implémentation Complète

### 📊 Base de Données

#### Table `payments`
```sql
- id
- user_id (étudiant)
- form_id (cours)
- admin_id (administrateur validateur)
- invoice_id (facture générée après acceptation)
- payment_number (PAY-XXXXXXXXXXXX)
- amount (montant)
- payment_method (méthode de paiement)
- payment_details (JSON - détails additionnels)
- status (pending, accepted, rejected)
- rejection_reason (raison du rejet)
- validated_at (date de validation)
- created_at, updated_at, deleted_at
```

### 🔄 Workflow Complet

#### 1️⃣ Étudiant - Initier un Paiement
**Endpoint**: `POST /api/payments`

**Requête**:
```json
{
  "form_id": 17,
  "payment_method": "Carte Bancaire",
  "payment_details": {
    "card_last4": "1234",
    "transaction_ref": "TXN-ABC123"
  }
}
```

**Réponse**:
```json
{
  "message": "Paiement créé avec succès. En attente de validation administrative.",
  "payment": {
    "id": 1,
    "payment_number": "PAY-ABCDEF123456",
    "amount": 79.99,
    "status": "pending",
    "form": { "title": "Masterclass Photographie" }
  }
}
```

**Actions automatiques**:
- ✅ Création du paiement avec status `pending`
- ✅ Création d'une admission NON approuvée
- ✅ Notification à l'étudiant : "Paiement en attente de validation"
- ❌ **AUCUN accès au cours à ce stade**

---

#### 2️⃣ Étudiant - Consulter ses Paiements
**Endpoint**: `GET /api/payments`

**Réponse**:
```json
{
  "data": [
    {
      "id": 1,
      "payment_number": "PAY-ABCDEF123456",
      "amount": 79.99,
      "status": "pending",
      "form": { "title": "Masterclass Photographie" },
      "created_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

**Statuts possibles**:
- ⏳ `pending` - En attente de validation
- ✅ `accepted` - Validé, accès au cours débloqué
- ❌ `rejected` - Rejeté, avec raison

---

#### 3️⃣ Admin - Voir les Paiements en Attente
**Endpoint**: `GET /api/payments?status=pending`

**Réponse**:
```json
{
  "data": [
    {
      "id": 1,
      "payment_number": "PAY-ABCDEF123456",
      "user": { "name": "Jean Apprenant", "email": "student@gmail.com" },
      "form": { "title": "Masterclass Photographie" },
      "amount": 79.99,
      "payment_method": "Carte Bancaire",
      "status": "pending",
      "created_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

---

#### 4️⃣ Admin - Accepter un Paiement
**Endpoint**: `POST /api/payments/{id}/accept`

**Actions automatiques**:
1. ✅ Mise à jour : `status = accepted`
2. ✅ Approbation de l'admission (`is_approved = true`)
3. ✅ Génération automatique de la facture (Invoice)
4. ✅ Liaison facture ↔ paiement
5. ✅ Notification à l'étudiant : "Paiement accepté ✅"
6. ✅ **Accès au cours débloqué**

**Réponse**:
```json
{
  "message": "Paiement accepté avec succès.",
  "payment": {
    "id": 1,
    "status": "accepted",
    "admin": { "name": "Admin NextLearn" },
    "invoice": {
      "invoice_number": "INV-XYZ123",
      "total": 79.99,
      "status": "Paid"
    }
  }
}
```

---

#### 5️⃣ Admin - Rejeter un Paiement
**Endpoint**: `POST /api/payments/{id}/reject`

**Requête**:
```json
{
  "reason": "Informations de paiement invalides"
}
```

**Actions automatiques**:
1. ❌ Mise à jour : `status = rejected`
2. ❌ L'admission reste NON approuvée
3. ❌ AUCUNE facture générée
4. ❌ Notification à l'étudiant : "Paiement rejeté ❌" + raison
5. ❌ **Aucun accès au cours**

---

### 🎯 Règles de Gestion

#### ✅ Validations
- Un étudiant ne peut avoir qu'**un seul paiement actif** (pending ou accepted) par cours
- Seuls les **administrateurs** peuvent accepter/rejeter les paiements
- Un paiement déjà traité (accepted/rejected) **ne peut plus être modifié**

#### 🔐 Sécurité
- Tous les endpoints nécessitent une authentification (`auth:sanctum`)
- Les étudiants ne voient que **leurs propres paiements**
- Les admins voient **tous les paiements**

#### 📝 Traçabilité
- `admin_id` : Qui a validé/rejeté
- `validated_at` : Quand
- `rejection_reason` : Pourquoi (si rejeté)
- Toutes les actions génèrent des **notifications**

---

### 🧾 Génération de Facture

**Uniquement si le paiement est accepté** :
```json
{
  "invoice_number": "INV-XYZ123",
  "user_id": 3,
  "form_id": 17,
  "subtotal": 79.99,
  "total": 79.99,
  "status": "Paid",
  "payment_method": "Carte Bancaire",
  "payment_id": "PAY-ABCDEF123456",
  "paid_at": "2026-01-15T01:00:00Z"
}
```

---

### 📱 Intégration Frontend (À Implémenter)

#### Dashboard Étudiant - Onglet "Mes Paiements"
```javascript
// Afficher les paiements avec statut visuel
GET /api/payments

// Statuts :
// ⏳ pending - Badge jaune "En attente"
// ✅ accepted - Badge vert "Validé"
// ❌ rejected - Badge rouge "Rejeté" + raison
```

#### Dashboard Admin - Section "Paiements en Attente"
```javascript
// Liste des paiements à valider
GET /api/payments?status=pending

// Boutons d'action :
// ✅ Valider → POST /api/payments/{id}/accept
// ❌ Rejeter → POST /api/payments/{id}/reject + modal pour raison
```

---

### 🚀 Prochaines Étapes

1. **Frontend Étudiant** :
   - Formulaire de paiement dans `CourseDetailsModal`
   - Onglet "Mes Paiements" dans `StudentDashboard`
   - Affichage du statut sur chaque cours

2. **Frontend Admin** :
   - Section "Paiements en Attente" dans `AdminDashboard`
   - Tableau avec actions Accepter/Rejeter
   - Modal de rejet avec champ "Raison"

3. **Notifications** :
   - Badge de notification pour nouveaux paiements (admin)
   - Alertes en temps réel pour l'étudiant

---

## ✅ Système Prêt à l'Emploi !

Toute la logique backend est **complète et fonctionnelle**. Il ne reste plus qu'à créer les interfaces utilisateur pour permettre aux étudiants d'initier des paiements et aux administrateurs de les valider.
