# Performance Tracking System - Setup & Quick Start

## Prerequisites

✅ Angular 21 with standalone components  
✅ TypeScript with strict mode  
✅ Spring Boot backend running on `http://localhost:8085`  
✅ Tailwind CSS configured  
✅ Angular Router configured with auth guard  

---

## Installation Steps

### 1. Files Already Created

The following files have been automatically created in your project:

**Models & Services:**
- ✅ `src/app/models/performance.model.ts` - All DTOs and utilities
- ✅ `src/app/services/performance.service.ts` - API service with caching

**Components:**
- ✅ `src/app/components/performance-card/performance-card.component.ts` - Reusable card
- ✅ `src/app/pages/performances/performance-dashboard.component.ts` - Dashboard view
- ✅ `src/app/pages/performances/performance-form.component.ts` - Create/Edit form
- ✅ `src/app/pages/performances/performance-list.component.ts` - List/Table view
- ✅ `src/app/pages/performances/performance-detail.component.ts` - Detail page

**Routes:**
- ✅ Updated `src/app/app.routes.ts` with performance routes
- ✅ Updated `src/app/pages/admin.component.ts` with Performance button

---

## Quick Start Guide

### Accessing the System

1. **Start your dev server** (already running):
   ```bash
   npm run start
   ```

2. **Ensure backend is running** on `http://localhost:8085`:
   ```bash
   # Your Spring Boot server should be accepting requests
   curl http://localhost:8085/api/performances
   ```

3. **Login to the application**:
   - Navigate to `http://localhost:4200/auth/login`
   - Authenticate with valid credentials

4. **Access Performance Management**:
   - Navigate to Admin dashboard: `http://localhost:4200/app/admin`
   - Click "📊 Performance Tracking" button in Quick Actions
   - Or go directly to: `http://localhost:4200/app/admin/performances`

---

## Available Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/app/admin/performances` | PerformanceListComponent | List all performances (card/table) |
| `/app/admin/performances/create` | PerformanceFormComponent | Create new performance |
| `/app/admin/performances/{id}` | PerformanceDetailComponent | View performance details |
| `/app/admin/performances/{id}/edit` | PerformanceFormComponent | Edit existing performance |
| `/app/admin/performances/dashboard` | PerformanceDashboardComponent | Dashboard overview |

---

## Core Features Overview

### 📊 Dashboard
- System-wide statistics
- Quick action buttons
- Recent performances preview
- Rating distribution

### ✏️ Entry Form
- Create new performance records
- Sliders for score/assists (visual feedback)
- Time played presets (90m, 120m)
- Real-time rating tier display
- Calculated efficiency metrics
- Full validation before submission

### 📋 List View
- Card or Table display modes
- Multiple filter criteria
- Sorting options (rating, goals, date, etc.)
- Quick actions (View/Edit)
- Empty state with CTA

### 🔍 Detail View
- All performance metrics
- Calculated insights
- 5-tier rating visualization
- Edit & Delete functionality
- Performance history

---

## Form Field Validation

**All fields are validated both client-side and server-side:**

| Field | Type | Constraints | Example |
|-------|------|-------------|---------|
| Player ID | Number | Required, > 0 | 5 |
| Match ID | Number | Required, > 0 | 10 |
| Goals | Integer | 0-20 | 2 |
| Assists | Integer | 0-15 | 1 |
| Distance | Decimal | 0-50 km | 11.5 |
| Time Played | Integer | 0-120 min | 90 |
| Rating | Decimal | 0.0-10.0 | 8.2 |

---

## Testing Data

### Test Performance Creation

Use this sample data in the form to test:

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

This creates:
- 2 goals with 1 assist
- 11.5 km distance (realistic)
- Full 90-minute match
- 8.2 rating (Excellent tier)

---

## Rating Scale Quick Reference

Use this when entering performance ratings:

```
10.0 ⭐⭐⭐⭐⭐ Man of the match - Perfect performance
 9.0 ⭐⭐⭐⭐⭐ Outstanding - Exceptional
 8.0 ⭐⭐⭐⭐ Excellent - Dominant
 7.0 ⭐⭐⭐ Good - Solid, reliable
 6.0 ⭐⭐ Satisfactory - Average, did the job
 5.0 ⭐ Below Average - Struggled
 0.0 ❌ Poor - Very difficult
```

---

## Troubleshooting

### Issue: "Performance not found" error

**Solution:** 
- Verify player exists in database (`GET /api/players/{id}`)
- Verify match exists in database (`GET /api/matches/{id}`)
- Check that player ID and match ID are correct integers

### Issue: Form validation errors

**Common causes:**
- Goals outside 0-20 range
- Distance outside 0-50 km
- Time played outside 0-120 minutes
- Rating outside 0-10 range
- Missing required fields

### Issue: Performance creation succeeds but doesn't redirect

**Check:**
- Ensure routing is correctly configured
- Check browser console for error messages
- Verify `/app/admin/performances/{id}` route is accessible

### Issue: Cached data not updating

**Solution:**
- Manually refresh using the "🔄 Refresh" button
- Clear sessionStorage: `sessionStorage.removeItem('performances_cache')`
- The cache auto-invalidates after 5 minutes

### Issue: Backend connection error

**Verify:**
- Backend is running on `http://localhost:8085`
- CORS is properly configured (if different origin)
- Network connectivity is working
- Check browser Network tab for failed requests

---

## Configuration

### Cache Duration
If you need to change the cache duration, edit `src/app/services/performance.service.ts`:

```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// Change to, e.g., 10 minutes:
const CACHE_DURATION = 10 * 60 * 1000;
```

### API Base URL
If backend is on a different port/domain:

```typescript
const API_BASE_URL = 'http://localhost:8085/api/performances';
const PLAYER_API_URL = 'http://localhost:8085/api/players';

// Update to your backend URL if different
```

---

## Next Steps - Planned Features

1. **Performance Charts** (In development)
   - Rating trend over time
   - Goals distribution histogram
   - Efficiency radar chart
   - Distance trend analysis

2. **Leaderboards**
   - Top scorers ranking
   - Best defenders/cleansheets
   - Hidden MVP ratings

3. **Player Comparison**
   - Side-by-side metrics
   - Radar charts
   - Career statistics

4. **Advanced Analytics**
   - Performance alerts
   - Team stats aggregation
   - Export functionality

---

## Key Metrics Explained

### Goals per Minute
- **Formula:** Total Goals ÷ Total Minutes Played
- **Use:** Measure offensive efficiency
- **Example:** 2 goals ÷ 90 min = 0.022 per minute

### Assists per Minute
- **Formula:** Total Assists ÷ Total Minutes
- **Use:** Measure playmaking ability
- **Example:** 1 assist ÷ 90 min = 0.011 per minute

### Distance per Minute
- **Formula:** Total Distance ÷ Total Minutes
- **Use:** Track stamina/work rate
- **Example:** 11.5 km ÷ 90 min = 0.128 km/min

### Efficiency Score
- **Formula:** Weighted combination of all metrics
- **Weights:**
  - Goals efficiency: 25%
  - Assists efficiency: 20%
  - Stamina: 20%
  - Playing time: 15%
  - Rating: 20%
- **Result:** 0-10 score

---

## Performance Optimization Tips

1. **Use Card View for quick browsing**
   - Fetches all performances
   - Displays 6-10 items with pagination (upcoming)

2. **Use Table View for detailed analysis**
   - Better for sorting/filtering
   - Shows all metrics at once

3. **Filter before sorting**
   - Reduces data set first
   - Faster computed signal updates

4. **Leverage cache**
   - First load fetches from API
   - Subsequent loads (within 5 min) use cache
   - Refresh only when needed

---

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (responsive design)

---

## Support Resources

- **Angular Docs**: https://angular.dev
- **Signals API**: https://angular.dev/guide/signals
- **Standalone Components**: https://angular.dev/guide/standalone-components
- **Reactive Forms**: https://angular.dev/guide/reactive-forms

---

## Quick Commands

```bash
# Start dev server
npm run start

# Run tests
npm run test

# Build for production
npm run build

# Lint code
npm run lint
```

---

**Ready to go!** 🚀

Navigate to `/app/admin/performances` and start logging performances.

For detailed system documentation, see `PERFORMANCE_SYSTEM_GUIDE.md`
