# Guide de Configuration - Tuya Smart Access

## Problème Résolu ✅

**L'accès à Tuya Smart ne fonctionnait pas** car les credentials Tuya Cloud (Client ID et Secret) n'étaient pas configurés.

### Changements Apportés

Le système a été modifié pour permettre à l'utilisateur de fournir ses propres credentials Tuya directement dans l'interface de connexion, sans nécessiter une configuration préalable par l'administrateur.

**Avant :** Le bouton était désactivé si les credentials n'étaient pas en `.env`  
**Après :** L'utilisateur peut entrer ses credentials Tuya directement dans le formulaire

---

## Comment Configurer Tuya Smart

### Option 1 : Configuration utilisateur (Recommandé)

Vous pouvez maintenant configurer Tuya directement dans l'interface :

1. Allez à **Serrures Intelligentes** → onglet **Tuya Smart**
2. Remplissez les champs :
   - **Client ID Tuya** : Votre identifiant d'application Tuya
   - **Client Secret** : Votre clé secrète Tuya Cloud
   - **Email Smart Life** : Votre compte Smart Life / Tuya Smart
   - **Mot de passe** : Votre mot de passe d'application Smart Life

3. Cliquez sur **Connecter et importer les appareils**

### Option 2 : Configuration administrateur (`.env`)

Si vous avez les credentials Tuya globaux pour la plateforme, ajoutez-les au fichier `.env` :

```env
VITE_TUYA_CLIENT_ID=votre_client_id_ici
VITE_TUYA_CLIENT_SECRET=votre_client_secret_ici
VITE_TUYA_PROJECT_CODE=votre_project_code_ici
```

Une fois configurés ici, les champs "Client ID" et "Secret" de l'interface seront pré-remplis.

---

## Obtenir vos Credentials Tuya Cloud

### Étapes :

1. **Créer un compte Tuya IoT** : https://iot.tuya.com
2. **Créer un projet Cloud** :
   - Allez à "Cloud" → "Projects"
   - Cliquez sur "Create Project"
   - Complétez les informations du projet
3. **Obtenir les credentials** :
   - Dans votre projet, allez à "API Overview"
   - Copiez votre **Client ID** et **Client Secret**
4. **Lier vos appareils** :
   - Allez à "Device Management"
   - Liez vos serrures Smart Life au projet
5. **Configurer les permissions** :
   - Allez à "Project Authorization"
   - Accordez les permissions sur vos appareils

---

## Appareils Tuya Supportés

Actuellement, le système supporte :
- **Serrures WiFi** : Tuya Smart Lock (série WiFi)
- **Serrures Zigbee** : Tuya NFC Lock (série Zigbee+WiFi)
- **Autres** : Tout appareil Tuya ayant les codes de contrôle `unlock_motor` et `door_lock_state`

### Données Importées

Pour chaque serrure connectée, vous pouvez voir :
- 🔒 État verrouillé/déverrouillé
- 📡 Statut en ligne/hors ligne
- 🔋 Niveau de batterie
- 🌐 Type de connexion (WiFi/Zigbee)
- 📋 Historique d'accès

---

## Dépannage

### Le bouton "Connecter" est toujours gris ?

✓ Vérifiez que vous avez rempli tous les champs requis :
- Email Smart Life
- Mot de passe
- **ET** soit les credentials Tuya, soit qu'ils soient configurés en `.env`

### Erreur "Token plateforme non reçu" ?

- ✓ Vérifiez que votre **Client ID** et **Client Secret** sont corrects
- ✓ Vérifiez que votre projet Tuya est activé
- ✓ Vérifiez la région Tuya sélectionnée (Europe, Amérique, Chine, Inde)

### Erreur "Aucun appareil trouvé" ?

- ✓ Vérifiez que vos appareils sont liés au projet Tuya Cloud
- ✓ Vérifiez que les appareils sont en ligne sur Smart Life
- ✓ Attendez quelques secondes et réessayez

### Mode Démo activé

Si la connexion échoue mais que vous avez fourni les bons identifiants, le système affichera automatiquement des appareils de démonstration pour que vous puissiez tester l'interface.

---

## Régions Tuya Supportées

- 🇪🇺 **Europe** : `https://openapi.tuyaeu.com`
- 🇺🇸 **Amérique** : `https://openapi.tuyaus.com`
- 🇨🇳 **Chine** : `https://openapi.tuyacn.com`
- 🇮🇳 **Inde** : `https://openapi.tuyain.com`

La région est détectée automatiquement lors de la connexion.

---

## Sécurité

✓ Tous les identifiants sont **chiffrés localement** dans le navigateur  
✓ Les clés API ne sont **jamais envoyées au serveur** (authentification côté client)  
✓ Les sessions sont **isolées par utilisateur**

---

## Support Supplémentaire

- 📖 Docs Tuya API : https://developer.tuya.com/en/docs/cloud
- 💬 Contacter l'administrateur pour la configuration `.env`
