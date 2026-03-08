# MultiPark API Documentation (Discovered)

## Authentication
- Bookings API: `X-Api-Key: <key>` header
- Other endpoints (/vehicles, /spots): Use JWT Bearer token (separate auth, not accessible with API key)
- Parks endpoint: Public (no auth needed)

## Base URLs
- Bookings API: `https://api.multipark.pt/api/v1/bookings-api`
- General API: `https://api.multipark.pt/api/v1`

## Discovered Endpoints

### GET /health → 200
```json
{"status":"ok","timestamp":"...","version":"1.0.0"}
```

### GET /availability → 200
Required params: `checkIn`, `checkOut` (ISO 8601), `vehicleType`, `parkingType`
- vehicleType: MOTORCYCLE, CAR, VAN, TRUCK
- parkingType: COVERED, UNCOVERED, INDOOR, VIP
```json
{"available":true,"totalSpots":1124,"availableSpots":1094,"message":"1094 spot(s) available for the selected dates"}
```

### POST /bookings → Create Booking
Required fields:
- checkIn: ISO 8601 date string
- checkOut: ISO 8601 date string
- checkInTime: string "HH:MM"
- checkOutTime: string "HH:MM"
- parkingType: COVERED | UNCOVERED | INDOOR | VIP

Response includes: id, bookingNumber, status, pricing { total, currency }

### PUT /bookings/:id → Update Booking

### GET /api/v1/parks → 200 (Public)
Returns list of parks:
```json
{
  "parks": [
    {
      "id": "cmhbzsfy2005ex5i4vw25jxbs",
      "name": "Skypark - Porto",
      "address": "Av. do Aeroporto 294, 4470-558 Moreira, Portugal",
      "lat": 41.238...,
      "lng": -8.667...,
      "featured": false,
      "status": "..."
    }
  ]
}
```

### Endpoints requiring JWT (not accessible with API key):
- /api/v1/vehicles → 401
- /api/v1/spots → 401

## Parking Types
- COVERED (Coberto)
- UNCOVERED (Descoberto)
- INDOOR (Interior)
- VIP

## Vehicle Types
- MOTORCYCLE
- CAR
- VAN
- TRUCK
