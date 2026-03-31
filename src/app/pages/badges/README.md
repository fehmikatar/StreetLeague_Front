# 🎖️ Badge Management System - Quick Start Guide

## What's New

Your Angular application now has a **complete badge/achievement management system** fully integrated! This guide will help you get started quickly.

## Quick Navigation

### Admin Routes Available

| Route | Purpose |
|-------|---------|
| `/app/admin/badges/dashboard` | View statistics and recent badges |
| `/app/admin/badges` | Browse all badges (grid/table view) |
| `/app/admin/badges/create` | Create new badge |
| `/app/admin/badges/{id}` | View badge details |
| `/app/admin/badges/{id}/edit` | Edit badge |

### From Admin Dashboard

Click **"🎖️ Gestion des Badges"** in the admin panel quick actions.

## Key Features

### 📊 Dashboard
- View badge statistics
- See level distribution
- Track total XP required
- Browse recent badges

### 📋 Catalog
- Browse all badges
- **Grid or Table view**
- Filter by level range
- Search by name/description
- Sort by: name, level, XP, creation date
- Quick edit/view actions

### ➕ Create Badge
- Real-time form validation
- Character counters for name/description
- Level slider (0-10) with tier display
- Suggested XP values
- Live icon preview
- Success confirmation

### 🔍 View Details
- Full badge information
- Icon and metadata
- Level tier classification
- Edit or delete options
- Copy icon URL functionality

### ✏️ Edit Badge
- Pre-populated form
- Same validation as create
- Update any field
- Confirmation toast

## Component Usage

### Use Badge Display Component

Show badges anywhere in your app:

```typescript
<app-badge-display
  [badge]="badgeData"
  style="detailed"
  size="md"
/>
```

**Styles**: default, compact, detailed, inline  
**Sizes**: sm, md, lg

### Use Badge Progress Widget

Show player progress toward earning a badge:

```typescript
<app-badge-progress
  [badge]="badgeData"
  [currentXp]="350"
  [showDetails]="true"
/>
```

Progress colors:
- 🔴 Red: 0-33% (early stage)
- 🟡 Yellow: 34-66% (mid-progress)
- 🟢 Green: 67-100% (nearly complete)

## Service API

Inject `BadgeService` to use in your components:

```typescript
import { BadgeService } from '@app/services/badge.service';

constructor(private badgeService = inject(BadgeService)) {}

// Get all badges
this.badgeService.getBadges().subscribe(badges => {
  console.log(badges);
});

// Get single badge
this.badgeService.getBadgeById(1).subscribe(badge => {
  console.log(badge);
});

// Create badge
this.badgeService.createBadge(badgeRequest).subscribe(newBadge => {
  console.log('Created:', newBadge);
});

// Update badge
this.badgeService.updateBadge(1, badgeRequest).subscribe(updated => {
  console.log('Updated:', updated);
});

// Delete badge
this.badgeService.deleteBadge(1).subscribe(() => {
  console.log('Deleted');
});

// Refresh cache
this.badgeService.refreshBadges().subscribe();

// Set filters
this.badgeService.setFilters({
  searchQuery: 'gold',
  minLevel: 5,
  maxLevel: 10,
  sortBy: 'level',
  sortOrder: 'desc'
});

// Get signals
const badges = this.badgeService.getBadgesSignal();
const loading = this.badgeService.getIsLoading();
const error = this.badgeService.getError();
```

## Badge Data Structure

```typescript
interface Badge {
  id: number;
  name: string;              // e.g., "Gold Winner"
  description: string;       // Optional, max 255 chars
  level: number;            // 0-10
  requiredXp: number;       // Min 0
  iconUrl: string;          // Valid image URL
  createdAt?: string;
  updatedAt?: string;
}
```

## Badge Level Tiers

| Tier | Level Range | Description | Use Case |
|------|-------------|-------------|----------|
| 🟤 Introductory | 0-2 | Basic achievements | Sign-ups, first login, basic tasks |
| 🔵 Intermediate | 3-5 | Intermediate achievements | Regular participation, progress |
| 🟣 Advanced | 6-8 | Advanced achievements | Milestones, expert tasks |
| 🟡 Master | 9-10 | Master/Legendary achievements | Master status, legendary deeds |

## Validation Messages

All messages are in French (as per requirement):

- ✓ "Le nom du badge est obligatoire"
- ✓ "Le nom ne doit pas dépasser 100 caractères"
- ✓ "La description ne doit pas dépasser 255 caractères"
- ✓ "Le niveau doit être ≥ 0"
- ✓ "Le niveau ne peut pas dépasser 10"
- ✓ "L'XP requis doit être ≥ 0"
- ✓ "L'URL de l'icône doit être valide"

## Styling with Tailwind

The system uses **Tailwind CSS** for styling and includes full **dark mode support**:

```html
<!-- Light mode -->
<div class="bg-white text-gray-900">Light</div>

<!-- Dark mode (automatic) -->
<div class="dark:bg-gray-900 dark:text-white">Dark</div>
```

## Environment Setup

Your API should be running at: `http://localhost:8085/api`

This is defined in: `src/environments/environment.ts`

```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8085/api'
};
```

## Features by Use Case

### 🎮 Game/Skill-Based Badges
```
Level 1-2: Starter Badge (100 XP)
Level 3-5: Intermediate Skill (500 XP)
Level 6-8: Advanced Skill (2000 XP)
Level 9-10: Master Status (10000 XP)
```

### 🏆 Achievement-Based Badges
```
Level 0: Participant (0 XP)
Level 2: Regular Player (1000 XP)
Level 5: Tournament Winner (5000 XP)
Level 10: Legendary Champion (50000 XP)
```

### 📈 Progression Badges
```
Level 1: First Steps (100 XP)
Level 3: Growing Strong (1000 XP)
Level 6: Expert Player (5000 XP)
Level 9: Elite Status (20000 XP)
```

## Common Tasks

### Create a New Badge

```typescript
const newBadge: BadgeRequest = {
  name: 'Gold Winner',
  description: 'Won a tournament in gold tier',
  level: 7,
  requiredXp: 5000,
  iconUrl: 'https://example.com/gold-badge.png'
};

this.badgeService.createBadge(newBadge).subscribe(badge => {
  // Badge created with id
  console.log(badge.id);
});
```

### List All Badges with Filtering

```typescript
this.badgeService.setFilters({
  searchQuery: 'win',
  minLevel: 5,
  sortBy: 'level',
  sortOrder: 'desc'
});

const filtered = this.badgeService.getBadgesSignal();
```

### Display Badges in Player Profile

```html
@for (badge of playerBadges; track badge.id) {
  <app-badge-display
    [badge]="badge"
    style="compact"
    size="md"
  />
}
```

### Show Progress Toward Badge

```html
<app-badge-progress
  [badge]="nextBadge"
  [currentXp]="userXp"
  [showDetails]="true"
/>
```

## Error Handling

All errors from the backend are properly handled:

```typescript
this.badgeService.createBadge(data).subscribe({
  next: (badge) => console.log('Success:', badge),
  error: (err) => console.log('Error:', err.message)
});
```

Error messages are parsed from:
- Backend `message` field
- String error responses
- HTTP error details
- Generic fallback messages

## Caching

Badges are automatically cached for **5 minutes** using sessionStorage:

```typescript
// Automatic cache-first approach
this.badgeService.getBadges(); // Uses cache if fresh

// Force refresh
this.badgeService.refreshBadges(); // Bypass cache
```

Cache is automatically invalidated on:
- Badge creation
- Badge update
- Badge deletion

## Responsive Design

All components are fully responsive:
- **Mobile** (320px+): Single column layouts
- **Tablet** (768px+): 2-3 column layouts
- **Desktop** (1024px+): Full grid layouts

## Dark Mode

Components automatically support system dark mode preference:

User preferences are determined by:
1. System/browser dark mode setting
2. Tailwind's `dark` class on root element
3. CSS media query `prefers-color-scheme`

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |
| Mobile Chrome | Latest | ✅ Fully supported |
| Mobile Safari | 14+ | ✅ Fully supported |

## Next Steps

1. **View the Dashboard**: Navigate to `/app/admin/badges/dashboard`
2. **Create Your First Badge**: Click "Create Badge" and fill the form
3. **Explore Catalog**: View all badges with different filters
4. **Edit & Delete**: Try updating and removing badges
5. **Integrate**: Use components in other parts of your app

## Troubleshooting

### Badges not loading?
- Check if backend is running on `localhost:8085`
- Verify `/api/badges` endpoint responds
- Check browser console for errors

### Form not validating?
- Ensure you're in the form component
- Check console for ReactiveFormsModule errors
- Verify validators are applied

### Images not showing?
- Check icon URLs are accessible
- Try opening URL directly in browser
- Ensure image format is PNG/SVG/JPG

### Routes not working?
- Verify you're accessing `/app/admin/badges`
- Check if authenticated (authGuard active)
- Clear browser cache if routes cached

## Support

For more details, see: [`BADGE_IMPLEMENTATION_GUIDE.md`](./BADGE_IMPLEMENTATION_GUIDE.md)

---

**Ready to get started?** Navigate to `/app/admin/badges/dashboard` now! 🚀
