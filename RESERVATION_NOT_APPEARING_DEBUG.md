# 🐛 Réservation n'apparaît pas - Guide de Debugging

## Problème
Après avoir fait une réservation dans booking-form, la nouvelle réservation n'apparaît pas dans la page "Mes Réservations de Terrain" sur matches.component.

## Cause Probable
**409 Conflict Error** du backend = Créneau déjà réservé au moment de la tentative.

## Diagnostic (Étapes)

### Étape 1: Open Console Logs
1. Va à http://localhost:4200
2. **Appuie sur F12** → onglet "Console"
3. Lis tous les logs

### Étape 2: Essayer une Réservation
1. Fais une nouvelle réservation
2. Regarde les logs dans la console

### Étape 3: Interprète les Logs

**Si tu vois ✅ Réservation réussie:**
```
📤 Envoi de réservation au backend: {userId: 1, sportSpaceId: 5, startTime: "...", endTime: "..."}
✅ Réservation créée avec succès: {id: 123, ...}
📋 Réservation ajoutée à myReservations$: {...}
🔄 loadMyReservations() appelée pour userId: 1
✅ Réservations chargées depuis backend: 7 réservations
```
→ **Tout marche!** Les réservations devraient s'afficher après navigation

**Si tu vois ❌ Erreur 409:**
```
📤 Envoi de réservation au backend: {userId: 1, sportSpaceId: 5, ...}
❌ Erreur lors de la création de réservation: {...}
Status: 409
Message: "Créneau déjà réservé" ou similaire
```
→ **Le créneau est déjà réservé** par quelqu'un d'autre! Choisis un autre horaire.

**Si tu vois ❌ Erreur Another:**
```
Status: 500 ou 400 ou autre
Message: "..." (détails du backend)
```
→ **Erreur au backend** - Partage les logs entiers avec le backend team.

## Changements Appliqués

### 1. booking-form.component.ts
```typescript
// Avant navigate, recharge les réservations du backend
this.bookingService.loadMyReservations();

// Puis navigate après 2s
setTimeout(() => {
  this.router.navigate(['/app/matches']);
}, 2000);
```

**Effet:** S'assure que `myReservations$` a les données fraîches du backend avant d'afficher la page matches.

### 2. booking.service.ts - reserveField()
```typescript
// Ajoute du logging
console.log('📤 Envoi de réservation au backend:', backendPayload);

// Plus: catchError complèt
catchError(err => {
  console.error('❌ Erreur lors de la création de réservation:', err);
  console.error('Status:', err.status);
  console.error('Message:', err?.error?.message || err?.message);
  return throwError(() => err);
})
```

### 3. booking.service.ts - loadMyReservations()
```typescript
console.log('🔄 loadMyReservations() appelée pour userId:', storedId);
this.getUserReservations(storedId).subscribe({
  next: (res) => {
    console.log('✅ Réservations chargées depuis backend:', res.length, 'réservations');
    this.myReservationsSubject.next(res);
  },
  error: (err) => {
    console.error('❌ Erreur lors du chargement des réservations:', err);
  }
});
```

### 4. booking-form.component.ts - Error Handler
```typescript
// Améliore le message d'erreur
if (err?.status === 409) {
  errorMsg = 'Ce créneau est déjà réservé (conflit). Merci de choisir un autre horaire.';
}
```

## Scénarios de Test Recommandés

### ✅ Test 1: Réservation Normale
1. Choisis un créneau libre
2. Fais la réservation
3. Vérifie les logs (vert/✅)
4. Navigue vers matches
5. **Attends:** La nouvelle réservation apparaît dans la liste

### ⚠️ Test 2: Double Booking (pour voir 409)
1. **Deux navigateurs** ouverts sur http://localhost:4200
2. **Browser 1:** Réserve 14:00-15:00 pour esprit
3. **Browser 2:** Tente de réserver SAME créneau
4. **Browser 2:** Devrait voir erreur 409 en console
5. **UI:** Message "Ce créneau est déjà réservé"

### 🔧 Test 3: Vérifier Timing
1. Fais une réservation
2. Avant que la page matches se charge, ouvre DevTools
3. Cherche le log `✅ Réservations chargées depuis backend`
4. Compte combien de réservations sont affichées

## Fichiers Modifiés

- `src/app/pages/booking-form.component.ts` (Error handler amélioré + loadMyReservations call)
- `src/app/services/booking.service.ts` (Logging + imports + reservation loading)

## Prochaines Étapes si Problème Persiste

1. **409 Persiste?** → Problème de validation backend ou de concurrence
   - Vérifier backend ne double-valide pas
   - Vérifier pas de race condition à la DB

2. **Réservation ne charge pas?** → Problème de user_id ou localStorage
   - Vérifier `localStorage.getItem('user_id')` retourne bien un ID
   - Vérifier Backend API `/bookings/user/{userId}` fonctionne

3. **Page ne se rafraîchit pas?** → Problème de ChangeDetection
   - Vérifier `this.cdr.detectChanges()` est appelée dans matches.component

---
**Status:** ✅ Prêt à tester avec logs détaillés
