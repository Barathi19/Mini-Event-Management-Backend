# Mini Event Management System

A simple **Event Management backend** built with **NestJS** and **MongoDB**.  
Users can create events, register attendees, and view attendee lists, with **capacity checks** and **timezone-aware event times**.

---

## Tech Stack

- **Backend:** NestJS, TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Validation:** class-validator & class-transformer

---

## Features

- Create events with **name**, **location**, **start & end time**, **max capacity**
- Prevent **duplicate events** on the same day & location
- Register attendees with **unique email check**
- Prevent **overbooking**
- List attendees with **pagination**
- List all events with **booked** and **remaining slots**

---

## API Endpoints

### Create Event

**POST** `/events`

**Request Body:**

```json
{
  "name": "Event 1",
  "location": "Chennai",
  "startTime": "2025-12-11T11:00:00Z",
  "endTime": "2025-12-11T12:00:00Z",
  "maxCapacity": 20
}
```

### List All Events

**GET** `/events?timezone=Asia/Kolkata`

**Sample Response:**

```json
[
  {
    "name": "Event 1",
    "location": "Chennai",
    "startTime": "11 Dec 2025, 11:00",
    "endTime": "11 Dec 2025, 12:00",
    "maxCapacity": 20,
    "booked": 5,
    "slotsLeft": 15
  }
]
```

### Register Attendee

**POST** `/events/{event_id}/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### List Event Attendees

**POST** `/events/{event_id}/attendees?page=1&limit=10`

**Sample Response:**

```json
{
  "data": [{ "name": "John Doe", "email": "john@example.com" }],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 5,
    "lastPage": 1
  }
}
```

---

## Notes

- Event uniqueness: per day & location
- Attendee limit: enforced by maxCapacity
- Booked & remaining slots: returned in GET /events
- Timezone support: all dates adjust according to the specified timezone

---
