# 🔧 Backend Requirements - User Profile & Photo Upload

## Frontend Requests à Implémenter

### 1. Récupérer le Profil Utilisateur

**Request:**
```
GET /api/users/{userId}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "Félini",
  "lastName": "Katar",
  "email": "fehmi2013.kastar@gmail.com",
  "phone": "+33 6 12 34 56 78",
  "role": "Joueur • Admin",
  "registrationDate": "2026-01-15T10:30:00",
  "profileImageUrl": "/api/users/1/profile-image/content"
}
```

---

### 2. Mettre à Jour le Profil

**Request:**
```
PUT /api/users/{userId}
Content-Type: application/json

{
  "firstName": "Félini",
  "lastName": "Katar",
  "email": "fellini2013.kastar@gmail.com",
  "phone": "+33 6 12 34 56 77"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "Félini",
  "lastName": "Katar",
  "email": "fellini2013.kastar@gmail.com",
  "phone": "+33 6 12 34 56 77",
  "updatedAt": "2026-04-05T14:30:00"
}
```

**Errors:**
- `400 Bad Request` - Email déjà utilisé ou format invalide
- `404 Not Found` - User non trouvé

---

### 3. Upload Photo de Profil

**Request:**
```
POST /api/users/{userId}/profile-image
Content-Type: multipart/form-data

file: <image_file>
userId: 1
```

**Response (200 OK):**
```json
{
  "message": "Photo de profil uploadée avec succès",
  "imageUrl": "/api/users/1/profile-image/content",
  "fileName": "profile_1_2026-04-05.jpg",
  "fileSize": 245678,
  "uploadedAt": "2026-04-05T14:30:00"
}
```

**Errors:**
- `400 Bad Request` - Aucun fichier fourni ou format invalide
- `413 Payload Too Large` - Image > 5MB
- `404 Not Found` - User non trouvé
- `415 Unsupported Media Type` - Format image non supporté (JPG, PNG, GIF, WebP)

---

### 4. Récupérer l'URL de la Photo

**Request:**
```
GET /api/users/{userId}/profile-image
```

**Response (200 OK):**
```json
{
  "imageUrl": "/api/users/1/profile-image/content"
}
```

**ou** (Alternative):
```json
{
  "id": 1,
  "imageUrl": "/api/users/1/profile-image/content",
  "uploadedAt": "2026-04-05T14:30:00"
}
```

**Errors:**
- `404 Not Found` - Pas d'image pour cet utilisateur
- `404 Not Found` - User non trouvé

---

### 5. Afficher le Contenu de l'Image

**Request:**
```
GET /api/users/{userId}/profile-image/content
```

**Response (200 OK):**
- Binary image data
- Content-Type: image/jpeg (ou image/png, image/gif, image/webp)

**Headers Recommandés:**
```
Content-Type: image/jpeg
Content-Length: 245678
Cache-Control: public, max-age=86400
```

**Errors:**
- `404 Not Found` - Image non trouvée

---

## 🗂️ Structure de Stockage Recommandée

### Option 1: Base de Données (BLOB)
```
users table:
├── id
├── firstName
├── lastName
├── email
├── phone
├── profileImageData (BLOB) ← Stocke l'image
├── profileImageMimeType (VARCHAR)
├── profileImageSize (BIGINT)
└── profileImageUploadedAt (DATETIME)
```

### Option 2: Système de Fichiers
```
/uploads/profile-images/
├── user_1_2026-04-05.jpg
├── user_2_2026-04-03.png
├── ...
└── metadata.json (optionnel - stocke mapping user->fichier)
```

### Option 3: Cloud Storage (AWS S3, Azure Blob, etc.)
```
s3://bucket-name/profile-images/
├── user-{userId}-{timestamp}.jpg
└── ...

users table:
├── id
├── firstName
├── lastName
├── email
├── profileImageS3Url
└── ...
```

---

## 💻 Code Java Recommandé (Spring Boot)

### Controller
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody UserUpdateDTO dto) {
        // Valider et mettre à jour
        User user = userService.updateUser(userId, dto);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        // Télécharger et stocker
        String imageUrl = userService.uploadProfileImage(userId, file);
        return ResponseEntity.ok(Map.of(
            "imageUrl", imageUrl,
            "message", "Photo de profil uploadée"
        ));
    }

    @GetMapping("/{userId}/profile-image")
    public ResponseEntity<?> getProfileImageUrl(@PathVariable Long userId) {
        String imageUrl = userService.getProfileImageUrl(userId);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @GetMapping("/{userId}/profile-image/content")
    public ResponseEntity<byte[]> getProfileImageContent(@PathVariable Long userId) {
        byte[] imageData = userService.getProfileImageData(userId);
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_JPEG)
            .body(imageData);
    }
}
```

### Service
```java
@Service
public class UserService {

    public String uploadProfileImage(Long userId, MultipartFile file) {
        // 1. Valider la taille (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new FileSizeExceededException("Image trop grande");
        }

        // 2. Valider le type MIME
        String contentType = file.getContentType();
        if (!contentType.matches("image/(jpeg|png|gif|webp)")) {
            throw new InvalidFileTypeException("Format image non supporté");
        }

        // 3. Sauvegarder
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        byte[] imageData = file.getBytes();
        user.setProfileImageData(imageData);
        user.setProfileImageMimeType(contentType);
        user.setProfileImageSize(file.getSize());
        user.setProfileImageUploadedAt(LocalDateTime.now());

        userRepository.save(user);

        return "/api/users/" + userId + "/profile-image/content";
    }

    public byte[] getProfileImageData(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        if (user.getProfileImageData() == null) {
            throw new ImageNotFoundException("Pas d'image pour cet utilisateur");
        }

        return user.getProfileImageData();
    }
}
```

---

## ✅ Validation Checklist

- [ ] Endpoint PUT pour mettre à jour le profil
- [ ] Validation de l'email (non-duplication)
- [ ] Endpoint POST pour upload de photo
- [ ] Validation de la taille d'image (max 5MB)
- [ ] Validation du type MIME (JPG, PNG, GIF, WebP)
- [ ] Stockage de l'image (DB, FS, ou Cloud)
- [ ] Endpoint GET pour récupérer l'URL
- [ ] Endpoint GET pour afficher l'image
- [ ] Cache headers pour les images
- [ ] Gestion des erreurs (400, 404, 413, 415)
- [ ] Logging des opérations
- [ ] Tests unitaires

---

## 🧪 Test cURL

### Récupérer le profil
```bash
curl http://localhost:8085/api/users/1
```

### Mettre à jour le profil
```bash
curl -X PUT http://localhost:8085/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Félini",
    "lastName": "Katar",
    "email": "new.email@example.com",
    "phone": "+33 6 12 34 56 77"
  }'
```

### Uploader une photo
```bash
curl -X POST http://localhost:8085/api/users/1/profile-image \
  -F "file=@/path/to/image.jpg" \
  -F "userId=1"
```

### Récupérer le profil image content
```bash
curl http://localhost:8085/api/users/1/profile-image/content \
  --output profile.jpg
```

---

**Status:** ✅ Frontend prêt à consommer ces endpoints

