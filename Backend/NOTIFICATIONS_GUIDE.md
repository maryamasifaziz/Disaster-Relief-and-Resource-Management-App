# Notification System Guide

## How Notifications Work

### Overview
Notifications are **manual alerts** created by Government users to communicate important information to all app users (Citizens, Rescue Workers, NGOs).

### Key Points:
1. **NOT Automatic** - Notifications are NOT automatically created by the system
2. **Manual Creation** - Only Government users can create notifications
3. **Public Display** - All users can view active notifications
4. **Active/Inactive** - Notifications can be activated or deactivated (soft delete)

---

## Who Can Do What?

### 👤 **Citizen / Rescue Worker / NGO**
- ✅ **View** active notifications (on Dashboard and Alerts tab)
- ❌ Cannot create, edit, or delete notifications

### 🏛️ **Government**
- ✅ **View** all notifications (active and inactive)
- ✅ **Create** new notifications
- ✅ **Update** notifications (title, message, active status)
- ✅ **Delete** notifications (deactivates them)

---

## How to Create Notifications

### Option 1: Via Frontend (Recommended)
1. Login as a **Government** user
2. Go to the **"Alerts"** tab
3. Tap **"New Notification"**
4. Enter:
   - **Title**: Short alert title (e.g., "Flood Warning")
   - **Message**: Detailed message for all users
5. Tap **"Create Notification"**

### Option 2: Via API (Postman/curl)
```bash
POST http://localhost:3000/api/notifications
Headers:
  Authorization: Bearer <government_user_token>
Body:
{
  "title": "Emergency Alert",
  "message": "All citizens are advised to stay indoors due to severe weather conditions."
}
```

### Option 3: Direct SQL (For Testing)
```sql
INSERT INTO Notification (title, message, datetime_sent, is_active, created_by)
VALUES (
  'Test Alert',
  'This is a test notification',
  NOW(),
  1,
  <government_user_id>
);
```

---

## When to Use Notifications

Notifications should be used for:
- ⚠️ **Emergency alerts** (floods, earthquakes, cyclones)
- 📢 **Public announcements** (evacuation orders, shelter openings)
- 🚨 **Safety warnings** (weather alerts, road closures)
- 📋 **Important updates** (resource availability, rescue operations)

---

## Notification Lifecycle

1. **Created** by Government user → `is_active = 1`
2. **Visible** to all users on Dashboard and Alerts tab
3. **Can be deactivated** by Government → `is_active = 0` (soft delete)
4. **Can be reactivated** by Government if needed

---

## API Endpoints

### Get Active Notifications (All Users)
```
GET /api/notifications/active
Authorization: Bearer <token>
```

### Get All Notifications (Government Only)
```
GET /api/notifications
Authorization: Bearer <government_token>
```

### Create Notification (Government Only)
```
POST /api/notifications
Authorization: Bearer <government_token>
Body: { "title": "...", "message": "..." }
```

### Update Notification (Government Only)
```
PATCH /api/notifications/:notificationId
Authorization: Bearer <government_token>
Body: { "title": "...", "message": "...", "is_active": true/false }
```

### Delete Notification (Government Only)
```
DELETE /api/notifications/:notificationId
Authorization: Bearer <government_token>
```

---

## Example Notification Scenarios

### Scenario 1: Flood Warning
```json
{
  "title": "Flood Warning - District A",
  "message": "Heavy rainfall expected. All residents in low-lying areas are advised to evacuate to designated shelters. Emergency services are on standby."
}
```

### Scenario 2: Shelter Opening
```json
{
  "title": "New Shelter Opened",
  "message": "Emergency shelter opened at City Hall. Capacity: 500. Food and medical supplies available."
}
```

### Scenario 3: Resource Request
```json
{
  "title": "Urgent: Medical Supplies Needed",
  "message": "District B medical center requires immediate supplies. NGOs with medical resources please contact emergency hotline."
}
```

---

## Troubleshooting

### Q: Why don't I see any notifications?
**A:** 
- Check if any Government user has created notifications
- Verify notifications have `is_active = 1` in database
- Check your user role (all roles can view active notifications)

### Q: How do I test notifications?
**A:**
1. Create a Government user account
2. Login and go to Alerts tab
3. Create a test notification
4. Login with a different role (Citizen) to verify it appears

### Q: Can notifications be scheduled?
**A:** Currently no. Notifications are sent immediately when created. Future enhancement could add scheduling.

---

## Database Schema

```sql
Notification Table:
- notification_id (PK)
- title (VARCHAR 150)
- message (TEXT)
- datetime_sent (DATETIME)
- is_active (BOOLEAN)
- created_by (FK → Users.user_id)
```

