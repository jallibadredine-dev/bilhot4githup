# Guide de Dépannage - Connexion TTHotel/TTLock

## Erreur: "invalid account or invalid password"

Si vous recevez cette erreur lors de la connexion à TTHotel, cela signifie que:
1. L'email n'existe pas sur TTLock
2. Le mot de passe est incorrect
3. Le compte n'a pas accès aux serrures intelligentes

## Comment Vérifier Votre Compte TTHotel

### Étape 1: Tester Directement sur TTLock
1. Accédez à https://www.ttlock.com (site officiel TTLock)
2. Essayez de vous connecter avec votre **email exacte** et **mot de passe exacte**
3. Vérifiez que vous pouvez accéder aux serrures/appareils

### Étape 2: Vérifier les Détails du Compte
Si vous êtes connecté sur ttlock.com:
- Allez à **Mon Compte** / **Account Settings**
- Vérifiez que l'email affiché correspond exactement à celui que vous utilisez
- Assurez-vous que les **serrures intelligentes** sont liées à ce compte

### Étape 3: Réinitialiser le Mot de Passe (si oublié)
1. Sur https://www.ttlock.com, cliquez sur **Mot de passe oublié**
2. Suivez les instructions pour réinitialiser
3. Attendez la confirmation par email
4. Essayez à nouveau avec le nouveau mot de passe

### Étape 4: Vérifier l'Email du Compte
Le compte peut être créé avec:
- Une adresse email directe: `user@example.com`
- Un numéro de téléphone converti en format d'email
- Un identifiant unique TTLock

**Assurez-vous d'utiliser EXACTEMENT le même email/identifiant utilisé lors de la création du compte TTLock.**

## Test Technique

Vous pouvez aussi tester directement depuis le terminal:

```bash
# Remplacez avec VOTRE email et mot de passe réels
EMAIL="votre-email@example.com"
PASSWORD="votre-mot-de-passe"

# Calculer le MD5 du mot de passe (tel que TTLock l'attend)
MD5_PASSWORD=$(echo -n "$PASSWORD" | md5sum | cut -d' ' -f1)

# Tester l'authentification
curl -X POST https://api.ttlock.com/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=4bfda77c44f1463aa1005222f28787cc&client_secret=e9a239827303299addd7bec18ddbc9af&grant_type=password&username=$EMAIL&password=$MD5_PASSWORD"
```

Si la réponse contient `access_token`, votre compte est valide!
Si elle contient `"errcode": 10007`, vérifiez l'email/mot de passe.

## Points Importants

- **Sensibilité à la casse**: L'email TTLock est généralement insensible à la casse, mais le mot de passe EST sensible à la casse
- **Espaces**: Assurez-vous qu'il n'y a pas d'espaces au début/fin de l'email ou du mot de passe
- **Caractères spéciaux**: Si votre mot de passe contient des caractères spéciaux, vérifiez qu'il est entré correctement
- **Compte existant**: Vous devez avoir un compte TTLock/TTHotel ACTIF avec au moins UNE serrure intelligente liée

## Besoin d'Aide?

1. **Créer un nouveau compte TTLock**: https://www.ttlock.com/register
2. **Documentation TTLock**: https://open.ttlock.com/doc
3. **Support TTLock**: https://www.ttlock.com/support

---

**Mise à jour**: Le backend a été amélioré pour mieux gérer le hachage MD5. Si vous aviez une erreur avant, réessayez maintenant!
