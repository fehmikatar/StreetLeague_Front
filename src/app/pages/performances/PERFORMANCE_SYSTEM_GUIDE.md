# Performance Tracking System - Implementation Guide

## Overview

A comprehensive **Player Performance Tracking System** for the Street League frontend, integrating with a Spring Boot REST API backend running on `http://localhost:8085`. The system tracks and analyzes individual player match performances with advanced metrics, visualizations, and career statistics.

---

## System Architecture

### Core Components

#### 1. **Data Models** (`src/app/models/performance.model.ts`)
- **PerformanceRequest**: Create/Update performance data
- **PerformanceResponse**: API response structure
- **CareerStats**: Aggregated player statistics
- **Performance Rating Tiers**: 6-tier rating system (0-10 scale)
- **Utility Functions**: Calculations and transformations

**Key Constants:**
- `PERFORMANCE_RATING_TIERS`: Outstanding (9-10) → Poor (0-4.9)
- Rating color-coding for visual feedback

### 2. **Performance Service** (`src/app/services/performance.service.ts`)
Angular Signal-based service for all performance operations

**Features:**
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ 5-minute cache with sessionStorage
- ✅ Computed filtered and sorted performances
- ✅ Career statistics calculation
- ✅ Real-time validation before API calls
- ✅ Automatic cache invalidation

**Key Methods:**
- `getPerformances(playerId?)` - Get all/player performances
- `getPerformanceById(id)` - Get single record
- `createPerformance(request)` - Log new performance
- `updatePerformance(id, request)` - Update existing
- `deletePerformance(id)` - Delete record
- `getPlayerCareerStats(playerId)` - Calculate aggregate stats
- `setFilters(filters)` - Apply filter criteria
- `setSortBy(option)` - Apply sort option

---

## UI Components

### 1. **Performance Dashboard** 
**Route:** `/app/admin/performances/dashboard`  
**File:** `src/app/pages/performances/performance-dashboard.component.ts`

**Features:**
- 📊 System statistics (total performances, excellent count, avg rating, total goals)
- ⚡ Quick actions (Log Performance, View All, Refresh)
- 🎯 Recent performances grid (last 6)
- 📈 Rating distribution by tier
- 🔄 Real-time data refresh

### 2. **Performance Entry Form**
**Route:** `/app/admin/performances/create`  
**Route (Edit):** `/app/admin/performances/{id}/edit`  
**File:** `src/app/pages/performances/performance-form.component.ts`

**Fields:**
- Player ID (required, number)
- Match ID (required, number)
- Goals/Score (0-20, slider + input)
- Assists (0-15, slider + input)
- Distance Covered (0-50km, decimal input)
  - Help text: "Average player covers 8-12 km per match"
- Time Played (0-120 min, presets: 90m, 120m, or custom)
- Performance Rating (0-10, slider with visual feedback)
  - Color-coded: Red (0-3), Yellow (3-6), Green (6-10)

**Calculated Metrics Display:**
- Goals per minute
- Assists per minute
- Distance per minute
- Efficiency score (weighted calculation)

**Features:**
- ✅ Real-time validation with error messages
- ✅ Rating tier indicator
- ✅ Success notification
- ✅ Auto-redirect to detail page after creation
- ✅ Edit mode with pre-filled data

### 3. **Performance List/Table**
**Route:** `/app/admin/performances`  
**File:** `src/app/pages/performances/performance-list.component.ts`

**Views:**
- 🎯 Card View (default) - Grid layout with key metrics
- 📋 Table View - Tabular data with sortable columns

**Columns (Table):**
- Player ID, Match ID
- Goals, Assists, Distance, Time
- Rating, Actions (View/Edit)

**Filters:**
- Minimum rating (5.0, 6.0, 7.0, 8.0, 9.0)
- Goals scored (0, 1-5, 6-10, 11+)
- Custom sort options

**Sort Options:**
- Newest/Oldest First
- Rating High/Low
- Most Goals/Fewest Goals
- Most Assists
- Most Distance

**Features:**
- ✅ Dual view mode toggle
- ✅ Real-time filtered/sorted results
- ✅ Filter count display
- ✅ Clear filters functionality
- ✅ Empty state with CTA

### 4. **Performance Card (Reusable)**
**File:** `src/app/components/performance-card/performance-card.component.ts`

**Displays:**
- Match ID & Date
- Rich rating display with tier label
- 5-metric grid: Goals, Assists, Distance, Played, Efficiency
- Quick action buttons: View Details, Edit

**Features:**
- ✅ Hover effects with shadow
- ✅ Color-coded rating
- ✅ Efficiency calculation
- ✅ Responsive layout

### 5. **Performance Detail Page**
**Route:** `/app/admin/performances/{id}`  
**File:** `src/app/pages/performances/performance-detail.component.ts`

**Sections:**
1. **Record Information Panel**
   - Performance ID, Player ID, Match ID
   - Date recorded

2. **Overall Rating Showcase**
   - Large rating display (6 scale tiers)
   - Tier label & description
   - Emoji indicator

3. **Performance Metrics Panel**
   - Color-coded cards: Goals, Assists, Distance, Played, Efficiency
   - Large numbers for quick readability

4. **Performance Insights**
   - Goals per minute
   - Assists per minute
   - Distance per minute
   - Game completion %

5. **Actions**
   - Edit button
   - Delete button with confirmation modal

**Features:**
- ✅ Delete confirmation dialog
- ✅ Loading states
- ✅ Error handling
- ✅ Back navigation

---

## API Integration

### Base URL
```typescript
API_BASE_URL = 'http://localhost:8085/api/performances'
PLAYER_API_URL = 'http://localhost:8085/api/players'
```

### Endpoints Used

1. **GET /api/performances** - Get all performances (optionally filtered by playerId)
2. **GET /api/performances/{id}** - Get single performance
3. **POST /api/performances** - Create performance record
4. **PUT /api/performances/{id}** - Update performance record
5. **DELETE /api/performances/{id}** - Delete performance record

### Request/Response Format

**Create/Update Request:**
```json
{
  "playerId": 5,
  "matchId": 10,
  "score": 2,
  "assists": 1,
  "distanceCovered": 11.5,
  "timePlayed": 90,
  "rating": 8.2
}
```

**Response:**
```json
{
  "id": 1,
  "playerId": 5,
  "matchId": 10,
  "score": 2,
  "assists": 1,
  "distanceCovered": 11.5,
  "timePlayed": 90,
  "rating": 8.2,
  "createdAt": "2024-03-31T10:30:00Z",
  "updatedAt": "2024-03-31T10:30:00Z"
}
```

### Validation

**Client-side validation** (before API call):
- Player ID: Required, must be > 0
- Match ID: Required, must be > 0
- Score: 0-20 goals
- Assists: 0-15 assists
- Distance: 0-50 km
- Time Played: 0-120 minutes
- Rating: 0-10 (decimal allowed)

**Error Handling:**
- `404 Not Found` - Performance or player not found
- `400 Bad Request` - Invalid field data
- `409 Conflict` - Player doesn't exist
- `422 Unprocessable Entity` - Match doesn't exist
- `500 Server Error` - Generic server error

---

## Calculations & Metrics

### Career Statistics Aggregation
```typescript
calculateCareerStats(performances[]): {
  totalGames,
  totalGoals,
  totalAssists,
  totalDistance,
  averageRating,
  averageGoalsPerMatch,
  averageAssistsPerMatch,
  averageDistancePerMatch,
  bestPerformance,
  worstPerformance,
  trend: 'improving' | 'declining' | 'stable',
  consistencyScore: 0-100
}
```

### Efficiency Calculation
Weighted formula combining:
- Goals efficiency (25% weight): score/20 × 10
- Assists efficiency (20% weight): assists/15 × 10
- Stamina/Distance (20% weight): distance/50 × 10
- Playing time (15% weight): time/120 × 10
- Rating (20% weight): rating/10 × 10

**Result:** 0-10 normalized score

### Performance Trend
- **Improving**: Recent avg rating > previous avg + 0.5
- **Declining**: Recent avg rating < previous avg - 0.5
- **Stable**: Between thresholds

### Consistency Score
Based on standard deviation of ratings:
- Formula: `100 - (stdDev × 25)`
- Range: 0-100 (100 = most consistent)

---

## Performance Rating Scale

| Rating | Tier | Emoji | Description |
|--------|------|-------|-------------|
| 9.0-10.0 | Outstanding | ⭐⭐⭐⭐⭐ | Man of the match |
| 8.0-8.9 | Excellent | ⭐⭐⭐⭐ | Dominant display |
| 7.0-7.9 | Good | ⭐⭐⭐ | Solid performance |
| 6.0-6.9 | Satisfactory | ⭐⭐ | Average, did the job |
| 5.0-5.9 | Below Average | ⭐ | Struggled at times |
| 0.0-4.9 | Poor | ❌ | Very difficult match |

---

## Routing Configuration

**Admin Performance Routes:**
```typescript
// Dashboard
{ path: 'admin/performances/dashboard', component: PerformanceDashboardComponent }

// CRUD routes (specific before parameter-based)
{ path: 'admin/performances/create', component: PerformanceFormComponent }
{ path: 'admin/performances/:id/edit', component: PerformanceFormComponent }
{ path: 'admin/performances/:id', component: PerformanceDetailComponent }
{ path: 'admin/performances', component: PerformanceListComponent }
```

**Admin Button Integration:**
Added to `admin.component.ts`:
```html
<button (click)="router.navigate(['/app/admin/performances/dashboard'])" 
  class="...📊 Performance Tracking">
```

---

## State Management

### Signals (Angular Signals API)
```typescript
// Core state
performances: Signal<PerformanceResponse[]>
selectedPerformance: Signal<PerformanceResponse | null>
isLoading: Signal<boolean>
error: Signal<string | null>
filters: Signal<PerformanceFilter>
sortBy: Signal<PerformanceSortOption>

// Computed
filteredPerformances: Computed<PerformanceResponse[]>
  // Auto-updates when performances, filters, or sortBy changes
```

### Caching
- **Duration:** 5 minutes (300,000 ms)
- **Storage:** sessionStorage
- **Key:** `performances_cache`
- **Auto-invalidation:** On create/update/delete
- **Manual refresh:** Call `getPerformances()` again

---

## Usage Flows

### Flow 1: Log Performance After Match
```
1. Admin navigates to Performance Dashboard
2. Clicks "Log Performance" button
3. Form opens with validation
4. Fill in metrics:
   - Select player & match
   - Input goals (0-20)
   - Input assists (0-15)
   - Enter distance (0-50 km)
   - Select time played (90/120/custom)
   - Set rating with visual tier indicator
5. Review calculated efficiency
6. Submit → Success notification
7. Auto-redirect to performance detail page
8. System updates all lists in real-time
```

### Flow 2: View Player Performance History
```
1. Navigate to Performance List (`/app/admin/performances`)
2. Select filter criteria (rating, goals, sort order)
3. Choose view mode (Card or Table)
4. Click on performance to view details
5. See calculated metrics & insights
6. Edit or delete if needed
```

### Flow 3: Find Exceptional Performances
```
1. Go to Performance List
2. Filter: "Rating: 8.0+" (Excellent)
3. Sort: "Rating High to Low"
4. View cards or table
5. Click Details to see full metrics
```

---

## Future Enhancements (Planned)

### 1. **Performance Charts** (In Progress)
- Line chart: Rating progression over time
- Bar chart: Goals per match distribution
- Radar chart: 5-dimension efficiency comparison
- Area chart: Distance covered trend (stamina tracking)

### 2. **Leaderboard Component**
- Top scorers (by season/all-time)
- Top assistants
- Highest rated players
- Most distance covered
- Sortable & filterable

### 3. **Player Comparison Widget**
- Compare 2-3 players side-by-side
- Normalized radar chart
- Highlight best in each category
- Career stats comparison

### 4. **Advanced Features**
- Performance alerts (rating drops, fatigue indicators)
- Team aggregate statistics
- Predictive insights
- Export to CSV
- Performance badges/achievements

---

## File Structure

```
src/app/
├── models/
│   └── performance.model.ts (DTOs, interfaces, utilities)
├── services/
│   └── performance.service.ts (API & state management)
├── components/
│   └── performance-card/
│       └── performance-card.component.ts
├── pages/
│   └── performances/
│       ├── performance-dashboard.component.ts
│       ├── performance-form.component.ts
│       ├── performance-list.component.ts
│       └── performance-detail.component.ts
└── app.routes.ts (updated with performance routes)
```

---

## Testing the System

### Quick Test Checklist

- [ ] Dashboard loads with empty state
- [ ] Create form validates all fields
- [ ] Rating tier changes colors with slider
- [ ] Efficiency calculation displays correctly
- [ ] Performance creation redirects to detail
- [ ] List view filters work (minimum rating, goals)
- [ ] Sort options change order correctly
- [ ] View toggle (Card/Table) works
- [ ] Detail page shows all metrics
- [ ] Edit pre-fills form correctly
- [ ] Delete confirmation modal works
- [ ] Admin button navigates to dashboard
- [ ] Caching works (5-min duration)

---

## API Availability

Ensure your Spring Boot backend is running:
```bash
# Backend should be running on
http://localhost:8085/api/performances
http://localhost:8085/api/players
```

Test with dummy data via Postman/curl:
```bash
curl -X POST http://localhost:8085/api/performances \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": 5,
    "matchId": 10,
    "score": 2,
    "assists": 1,
    "distanceCovered": 11.5,
    "timePlayed": 90,
    "rating": 8.2
  }'
```

---

## Support & Resources

- **Angular Signals**: Official Angular documentation
- **Standalone Components**: Angular 14+ feature
- **Reactive Forms**: Angular Forms API
- **TypeScript**: Strict mode enabled

---

**Last Updated:** March 31, 2026  
**Version:** 1.0 (Core System Complete)  
**Status:** Production-Ready for Core CRUD Operations
