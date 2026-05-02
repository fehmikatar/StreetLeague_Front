# Profile Image Upload & Profile Update - 403 Forbidden Issue

## Problem Summary

The frontend is receiving **HTTP 403 Forbidden** errors on multiple user endpoints:

**Read Operations (✅ WORKING):**
- ✅ `GET /api/users/{userId}` - Load profile data (works successfully)

**Write Operations (❌ FAILING):**
- ❌ `PATCH /api/users/{userId}` - Update profile (returns 403)
- ❌ `POST /api/users/{userId}/profile-image` - Upload profile image (returns 403)  
- ❌ `GET /api/users/{userId}/profile-image` - Retrieve profile image metadata (returns 403)

All endpoints return `403 Forbidden` status code with no additional error details.

## What the Frontend is Doing Correctly

✅ **Authentication is working properly:**
- `authInterceptor` adds `Authorization: Bearer {token}` header to all requests
- Token is correctly retrieved from `localStorage.getItem('auth_token')`
- `GET /api/users/{userId}` successfully loads profile data
- All booking endpoints work and display correctly enriched data

✅ **Request format is correct:**
- Profile update sends `PATCH` with proper JSON body including password
- Profile image upload sends `FormData` with fields: `file` and `userId`
- GET request includes `userId` path parameter
- All requests include proper Authorization header

## Backend Issue - Permission Levels

The 403 errors indicate the backend has **different authorization levels**:

1. **✅ Read permission granted** - User can GET their own profile
2. **❌ Write permission denied** - User cannot PATCH their own profile (403)
3. **❌ Image permission denied** - User cannot access profile-image endpoints (403)

This suggests the backend security is configured to:
- Allow authenticated users to READ profile data
- Deny authenticated users from MODIFYING profile data
- Deny authenticated users from accessing image endpoints

The user IS authenticated (token works), but is NOT **authorized** to perform write operations.

## Solution - Backend Authorization Configuration Required

The 403 errors indicate insufficient **authorization permissions** for the authenticated user. The user IS authenticated (gets 200 for GET), but is DENIED for write operations.

### Primary Issue: User Role/Permission Configuration

The backend likely has a permission model that needs to grant write access:

```java
// ❌ CURRENT (denies write)
@PreAuthorize("hasRole('ADMIN')")  // Too restrictive!
@PatchMapping("/{userId}")
public ResponseEntity<?> updateProfile(...) { }

// ✅ CORRECT - Allow user to modify own profile
@PatchMapping("/{userId}")
@PreAuthorize("@authService.isUserOrAdmin(#userId)")
public ResponseEntity<?> updateProfile(
    @PathVariable Long userId,
    @RequestBody UserUpdateRequest dto,
    @AuthenticationPrincipal UserDetails user) {
    
    // Allow the user to modify their own profile
    if (!getCurrentUserId(user).equals(userId) && !hasAdminRole(user)) {
        return ResponseEntity.status(403).build();
    }
    
    // Proceed with update
    return ResponseEntity.ok(userService.updateProfile(userId, dto));
}
```

### Secondary Issue: Profile Image Endpoints Missing Authorization

Similar to the profile update, the image endpoints need to allow authenticated users:

```java
// ✅ CORRECT - Allow authenticated user to upload their own image
@PostMapping("/{userId}/profile-image")
@PreAuthorize("isAuthenticated()")  // ← Fix: Allow any authenticated user
public ResponseEntity<?> uploadProfileImage(
    @PathVariable Long userId,
    @RequestParam("file") MultipartFile file,
    @AuthenticationPrincipal UserDetails user) {
    
    Long currentUserId = getCurrentUserId(user);
    if (!currentUserId.equals(userId)) {
        return ResponseEntity.status(403).build();
    }
    
    String imageUrl = userService.storeProfileImage(userId, file);
    return ResponseEntity.ok(new ImageUploadResponse(imageUrl));
}

// ✅ CORRECT - Allow authenticated user to retrieve their own image
@GetMapping("/{userId}/profile-image")
@PreAuthorize("isAuthenticated()")  // ← Fix: Allow any authenticated user
public ResponseEntity<?> getProfileImageUrl(
    @PathVariable Long userId,
    @AuthenticationPrincipal UserDetails user) {
    
    String imageUrl = userService.getProfileImageUrl(userId);
    return ResponseEntity.ok(new ImageUrlResponse(imageUrl));
}
```

### Check the Current Permission Model

Debug by checking what roles/permissions the authenticated user has:

```java
@GetMapping("/me/permissions")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> getCurrentUserPermissions(@AuthenticationPrincipal UserDetails user) {
    return ResponseEntity.ok(new PermissionsResponse(
        user.getUsername(),
        user.getAuthorities()  // ← Shows what roles user has
    ));
}
```

Then test from frontend:
```bash
curl -X GET http://localhost:8085/api/users/me/permissions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should show something like:
# {"username": "fehmikatar@gmail.com", "authorities": ["ROLE_USER"]}
```

## Debugging with curl/Postman

### Test the Endpoints with Bearer Token

Use `curl` or Postman to verify:

```bash
# Get auth token first
curl -X POST http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fehmikatar@gmail.com","password":"***"}'

# Use token to GET profile image
curl -X GET http://localhost:8085/api/users/2/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Should return 200 with imageUrl, not 403
```

## Frontend Changes Made

The frontend has been enhanced with better error logging:

```typescript
// Console output will now show:
🔐 Token d'authentification détecté (première 20 car): eyJhbGciOiJIUzI1...
❌ 403 Forbidden: Vérifiez que le backend autorise POST /api/users/{userId}/profile-image
   - L'authentification Bearer token doit être acceptée
   - Les permissions utilisateur doivent être vérifiées
```

## Debugging Steps

1. **Check if token exists:**
   ```javascript
   localStorage.getItem('auth_token')  // Should return a non-empty JWT
   ```

2. **Check if request includes Authorization header:**
   - Open DevTools → Network tab
   - Try to upload an image
   - Look for the POST request to `/api/users/2/profile-image`
   - Check the "Authorization" header in the request

3. **Backend logs:**
   - Should show the incoming request with Bearer token
   - Should show permission check logic
   - Should identify why 403 is returned

## Expected Behavior After Fix

Once backend permissions are configured correctly:

1. ✅ User navigates to profile page → Profile loads (already works)
2. ✅ User clicks "Modifier" → Edit form appears  
3. ✅ User changes first name + enters password → "✅ Profil mise à jour!" message
4. ✅ User clicks camera icon → File dialog opens
5. ✅ User selects image → Preview displays + "✅ Photo de profil téléchargée!" message
6. ✅ Profile is now updated in backend with new values
7. ✅ Profile photo is stored and displayed on next login

## Summary

**Frontend Status:** ✅ Ready for testing
- All UI implemented
- Error handling in place
- Authorization header being sent correctly
- Ready to handle successful responses

**Backend Status:** ❌ Needs permission configuration
- Read operations work (profile loads successfully)
- Write operations blocked by permission model (403 errors)
- Image endpoints blocked by permission model (403 errors)
- Need to grant `ROLE_USER` permission for profile write operations

## Related Endpoints

**Working Fine (✅):**
- ✅ `GET /api/users/{userId}` - Load profile (WORKS - 200 OK)
- ✅ `GET /api/bookings/user/{userId}` - Load reservations (WORKS - 200 OK)
- ✅ All read-only booking endpoints (WORK - shows enriched data in logs)

**Broken (❌ - returns 403):**
- ❌ `PATCH /api/users/{userId}` - Update profile (403 Forbidden)
- ❌ `POST /api/users/{userId}/profile-image` - Upload image (403 Forbidden)
- ❌ `GET /api/users/{userId}/profile-image` - Get image URL (403 Forbidden)

**Pattern:** All **write operations** and **image operations** on user endpoints return 403, while **read operations** work successfully.

This confirms it's a **permission/authorization issue**, not authentication.

## Testing the Fix

### Before Backend Changes

Current state (logs confirm):
```
✅ GET /api/users/2 → 200 OK (Profile loads)
❌ PATCH /api/users/2 → 403 Forbidden (Update denied)
❌ POST /api/users/2/profile-image → 403 Forbidden (Upload denied)
❌ GET /api/users/2/profile-image → 403 Forbidden (URL retrieval denied)
```

### After Backend Changes

Expected state:
```
✅ GET /api/users/2 → 200 OK (Profile loads)
✅ PATCH /api/users/2 → 200 OK (Update succeeds)
✅ POST /api/users/2/profile-image → 200 OK (Upload succeeds)
✅ GET /api/users/2/profile-image → 200 OK (URL retrieved)
```

## Next Steps for Backend Team

1. **Review permission model** - Check `@PreAuthorize` annotations on write endpoints
2. **Verify user roles** - Ensure authenticated users have enough permissions
3. **Test permission endpoint** - Call `/api/users/me/permissions` to see what roles assigned
4. **Update Spring Security config** - Allow authenticated users for write operations
5. **Test with curl** - Verify PATCH and POST work with valid token
6. **Check backend logs** - Look for permission rejection messages when 403 returned

