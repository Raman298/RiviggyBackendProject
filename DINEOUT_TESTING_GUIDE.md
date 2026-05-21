# Dineout Feature - Testing Guide

## 🧪 Testing the Table Booking Feature

This guide provides comprehensive testing instructions for the Dineout feature.

---

## 🌐 Browser Testing

### 1. Access the Booking Form

**URL:** `http://localhost:5000/api/dineout`

**Expected Result:**
- Beautiful booking form displays
- Date picker shows only future dates
- All fields are visible and styled correctly
- Form is responsive on mobile/desktop

### 2. Fill Valid Booking Form

**Test Data:**
```
Restaurant Name: The Italian Kitchen
Booking Date: 2024-12-25 (future date)
Booking Time: 19:00 (7:00 PM)
Number of Guests: 4
Cuisine Type: Italian
Your Name: John Doe
Email: john@example.com
Phone: 9876543210
Special Requests: Window seat preferred
```

**Expected Result:**
- Form submits successfully
- Success page displays with booking confirmation
- Booking ID is generated (format: `DIN-xxxxxxxx-timestamp`)
- Confirmation shows booking details

### 3. Test Form Validation

**Test Invalid Phone:**
- Enter: `12345` (less than 10 digits)
- Expected: Error message "Please enter a valid 10-digit phone number"

**Test Past Date:**
- Select: Yesterday's date
- Expected: Error message "Please select a future date"

**Test Missing Fields:**
- Leave Restaurant Name blank
- Click Submit
- Expected: "This field is required" error

---

## 🔌 API Testing (cURL/Postman)

### 1. Create Booking (POST)

```bash
curl -X POST "http://localhost:5000/api/dineout/book" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "restaurantName=The%20Italian%20Kitchen&bookingDate=2024-12-25&bookingTime=19:00&guestCount=4&cuisineType=Italian&userName=John%20Doe&userEmail=john%40example.com&userPhone=9876543210&specialRequests=Window%20seat"
```

**Expected Response:**
```html
200 OK - Success page with booking confirmation
```

### 2. Get User Bookings (GET)

```bash
curl "http://localhost:5000/api/dineout/bookings?email=john@example.com"
```

**Expected Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "id": 1,
      "booking_id": "DIN-abc123-1703072800000",
      "restaurant_name": "The Italian Kitchen",
      "booking_date": "2024-12-25",
      "booking_time": "19:00:00",
      "guest_count": "4",
      "cuisine_type": "Italian",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "user_phone": "9876543210",
      "status": "Confirmed",
      "created_at": "2024-05-19T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Booking Detail (GET)

```bash
curl "http://localhost:5000/api/dineout/booking/DIN-abc123-1703072800000"
```

**Expected Response:**
```json
{
  "success": true,
  "booking": {
    "id": 1,
    "booking_id": "DIN-abc123-1703072800000",
    "restaurant_name": "The Italian Kitchen",
    "booking_date": "2024-12-25",
    "booking_time": "19:00:00",
    "guest_count": "4",
    "cuisine_type": "Italian",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "user_phone": "9876543210",
    "special_requests": "Window seat",
    "status": "Confirmed",
    "created_at": "2024-05-19T10:30:00.000Z"
  }
}
```

### 4. Update Booking (PATCH)

```bash
curl -X PATCH "http://localhost:5000/api/dineout/booking/DIN-abc123-1703072800000" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingDate": "2024-12-26",
    "bookingTime": "20:00",
    "guestCount": "5",
    "specialRequests": "Window seat, no onions"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": { ... }
}
```

### 5. Cancel Booking (DELETE)

```bash
curl -X DELETE "http://localhost:5000/api/dineout/booking/DIN-abc123-1703072800000"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "booking": {
    "status": "Cancelled",
    ...
  }
}
```

### 6. Get All Bookings (Admin) (GET)

```bash
# All bookings
curl "http://localhost:5000/api/dineout/admin/all"

# Filter by status
curl "http://localhost:5000/api/dineout/admin/all?status=Confirmed"

# Filter by date
curl "http://localhost:5000/api/dineout/admin/all?date=2024-12-25"

# Filter by both
curl "http://localhost:5000/api/dineout/admin/all?status=Confirmed&date=2024-12-25"
```

**Expected Response:**
```json
{
  "success": true,
  "total": 5,
  "bookings": [ ... ]
}
```

---

## 🗄️ Database Testing

### 1. Connect to PostgreSQL

```bash
# Windows
psql -U riviggy_user -d riviggy_dineout -h localhost

# macOS/Linux
psql -U riviggy_user -d riviggy_dineout -h localhost
```

### 2. View All Bookings

```sql
SELECT * FROM table_bookings;
```

### 3. View Recent Bookings

```sql
SELECT booking_id, restaurant_name, booking_date, booking_time, 
       user_name, user_email, status, created_at 
FROM table_bookings 
ORDER BY created_at DESC 
LIMIT 10;
```

### 4. Filter by User Email

```sql
SELECT * FROM table_bookings WHERE user_email = 'john@example.com';
```

### 5. Filter by Status

```sql
SELECT * FROM table_bookings WHERE status = 'Confirmed';
SELECT * FROM table_bookings WHERE status = 'Cancelled';
```

### 6. Filter by Date Range

```sql
SELECT * FROM table_bookings 
WHERE booking_date BETWEEN '2024-12-01' AND '2024-12-31';
```

### 7. Count Bookings

```sql
-- Total bookings
SELECT COUNT(*) as total FROM table_bookings;

-- By status
SELECT status, COUNT(*) as count FROM table_bookings GROUP BY status;

-- By restaurant
SELECT restaurant_name, COUNT(*) as count FROM table_bookings GROUP BY restaurant_name;
```

### 8. Update Booking Status (Manual)

```sql
UPDATE table_bookings 
SET status = 'Cancelled' 
WHERE booking_id = 'DIN-abc123-1703072800000';
```

### 9. Delete Old Bookings (Maintenance)

```sql
DELETE FROM table_bookings 
WHERE booking_date < CURRENT_DATE AND status = 'Cancelled';
```

---

## 📊 Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Riviggy Dineout API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Booking Form",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/dineout"
      }
    },
    {
      "name": "Create Booking",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/dineout/book",
        "body": {
          "mode": "urlencoded",
          "urlencoded": [
            {"key": "restaurantName", "value": "The Italian Kitchen"},
            {"key": "bookingDate", "value": "2024-12-25"},
            {"key": "bookingTime", "value": "19:00"},
            {"key": "guestCount", "value": "4"},
            {"key": "cuisineType", "value": "Italian"},
            {"key": "userName", "value": "John Doe"},
            {"key": "userEmail", "value": "john@example.com"},
            {"key": "userPhone", "value": "9876543210"}
          ]
        }
      }
    },
    {
      "name": "Get User Bookings",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/dineout/bookings?email=john@example.com"
      }
    },
    {
      "name": "Get Booking Detail",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/dineout/booking/DIN-abc123-1703072800000"
      }
    },
    {
      "name": "Update Booking",
      "request": {
        "method": "PATCH",
        "url": "http://localhost:5000/api/dineout/booking/DIN-abc123-1703072800000",
        "body": {
          "mode": "raw",
          "raw": "{\"guestCount\": \"5\", \"bookingTime\": \"20:00\"}"
        }
      }
    },
    {
      "name": "Cancel Booking",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:5000/api/dineout/booking/DIN-abc123-1703072800000"
      }
    },
    {
      "name": "Get All Bookings (Admin)",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/dineout/admin/all"
      }
    }
  ]
}
```

---

## 🎯 Test Scenarios

### Scenario 1: Basic Booking
1. Open `http://localhost:5000/api/dineout`
2. Fill in all fields with valid data
3. Click "Confirm Booking"
4. Verify success page
5. Check database for new record

### Scenario 2: Form Validation
1. Try submitting with empty fields
2. Try past date
3. Try invalid phone (< 10 digits)
4. Verify error messages display

### Scenario 3: User Bookings
1. Create multiple bookings from same email
2. Query `/api/dineout/bookings?email=xyz`
3. Verify all bookings returned

### Scenario 4: Update Booking
1. Create booking
2. Send PATCH request with new date/time
3. Verify database updated
4. Verify returned booking has new values

### Scenario 5: Cancel Booking
1. Create booking
2. Send DELETE request
3. Verify status changed to "Cancelled"
4. Verify data not deleted, just status updated

### Scenario 6: Admin Dashboard
1. Create multiple bookings
2. Query `/api/dineout/admin/all`
3. Filter by status
4. Filter by date
5. Verify results correct

---

## ✅ Test Checklist

### Frontend
- [ ] Booking form displays correctly
- [ ] Form validation works (date, phone, required)
- [ ] Form submits successfully
- [ ] Success page shows booking ID
- [ ] Navbar button links correctly
- [ ] Responsive design works (mobile/desktop)

### API
- [ ] POST /api/dineout/book creates booking
- [ ] GET /api/dineout/bookings returns user bookings
- [ ] GET /api/dineout/booking/:id returns detail
- [ ] PATCH /api/dineout/booking/:id updates booking
- [ ] DELETE /api/dineout/booking/:id cancels booking
- [ ] GET /api/dineout/admin/all returns all bookings
- [ ] Query filters work correctly

### Database
- [ ] Bookings saved to PostgreSQL
- [ ] Booking IDs are unique
- [ ] Dates/times stored correctly
- [ ] Status field updates correctly
- [ ] Timestamps (created_at, updated_at) work
- [ ] Indexes improve query performance

### Integration
- [ ] Server starts without errors
- [ ] PostgreSQL connection successful
- [ ] EJS templates render correctly
- [ ] Environment variables loaded
- [ ] No console errors

---

## 🚨 Common Test Issues

| Issue | Solution |
|-------|----------|
| Form not showing | Check server running, view file exists |
| POST request error | Check required fields in body |
| Database error | Verify PostgreSQL running, DB exists |
| 404 on GET routes | Check routing setup in index.js |
| Validation not working | Check form validation in controller |

---

## 📈 Performance Testing

### Load Testing
```bash
# Using Apache Bench (if installed)
ab -n 1000 -c 10 http://localhost:5000/api/dineout/admin/all

# Using curl loop
for i in {1..100}; do
  curl "http://localhost:5000/api/dineout/bookings?email=test@example.com"
done
```

### Query Performance
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM table_bookings WHERE user_email = 'john@example.com';
EXPLAIN ANALYZE SELECT * FROM table_bookings WHERE booking_date = '2024-12-25';
```

---

## 📝 Notes

- Always use future dates for testing
- Use valid 10-digit phone numbers
- Replace `DIN-abc123-1703072800000` with actual booking IDs
- Test with various email addresses
- Verify database constraints work

---

## 🎉 All Tests Pass!

If all tests pass, your Dineout feature is working perfectly! 

