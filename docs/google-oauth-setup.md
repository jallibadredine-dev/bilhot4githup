# Configuration Google OAuth pour HOVA PMS

## Prérequis
Pour que le bouton "Continuer avec Google" fonctionne, configurez le provider Google dans Supabase Dashboard **et** créez les credentials OAuth dans Google Cloud Console.

---

## Étape 1 — Google Cloud Console

1. Rendez-vous sur https://console.cloud.google.com
2. Sélectionnez (ou créez) votre projet
3. Naviguez vers **APIs & Services > Credentials**
4. Cliquez **+ CREATE CREDENTIALS → OAuth 2.0 Client ID**
5. Type d'application : **Web application**
6. Ajoutez les URIs de redirection autorisées :
   ```
   https://<votre-projet>.supabase.co/auth/v1/callback
   ```
   (Remplacez `<votre-projet>` par l'identifiant de votre projet Supabase — ex: `zbhnmwreyijjqikuiqin`)
7. Notez le **Client ID** et le **Client Secret** générés

---

## Étape 2 — Supabase Dashboard

1. Rendez-vous sur https://supabase.com/dashboard/project/zbhnmwreyijjqikuiqin/auth/providers
2. Trouvez **Google** dans la liste des providers
3. Activez le toggle **Enable Sign in with Google**
4. Collez le **Client ID** (Google)
5. Collez le **Client Secret** (Google)
6. Sauvegardez

---

## Étape 3 — Replit Secrets

Ajoutez les secrets suivants dans les Replit Secrets (onglet Secrets) pour référence et usage backend futur :

| Clé                    | Valeur                      |
|------------------------|-----------------------------|
| `GOOGLE_CLIENT_ID`     | Votre Client ID Google      |
| `GOOGLE_CLIENT_SECRET` | Votre Client Secret Google  |

> Ces secrets ne sont pas utilisés directement par le frontend (le SDK Supabase gère le flux OAuth),
> mais servent de référence pour les futurs endpoints backend et les intégrations tierces.

---

## Vérification

Après configuration :
1. Ouvrez l'app HOVA et cliquez **Inscription** ou **Connexion**
2. Cliquez **Continuer avec Google**
3. La fenêtre Google s'ouvre, vous choisissez votre compte
4. Vous êtes redirigé vers HOVA — pour les **nouveaux utilisateurs** : le wizard de qualification (étapes 2-5) s'affiche automatiquement avant d'accéder au PMS
5. Pour les utilisateurs existants : connexion directe au dashboard

---

## Code concerné

```javascript
// src/components/modules/AuthPage.jsx — LoginForm.handleGoogle()
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin },
});

// src/App.jsx — ensureUserProfile()
// Détecte les nouveaux utilisateurs OAuth (app_metadata.provider !== 'email')
// et déclenche le wizard de qualification (showGoogleOnboarding = true)
const isOAuthProvider = user.app_metadata?.provider && user.app_metadata.provider !== 'email';
```

---

## Troubleshooting

| Erreur | Solution |
|--------|----------|
| `provider is not enabled` | Activer le provider Google dans Supabase Dashboard |
| `redirect_uri_mismatch` | Vérifier l'URI de callback dans Google Cloud Console |
| Boucle infinie après connexion | Vérifier que `redirectTo: window.location.origin` correspond à l'URL de l'app |
