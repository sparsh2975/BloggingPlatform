# Visitor Management API

A lightweight REST API built with **Express.js** that manages a list of current visitors entirely in memory — no database required.

---

## Project Structure

```
visitors-api/
├── src/
│   ├── server.js              # Entry point — binds Express app to a port
│   ├── app.js                 # App factory — wires middleware & routes
│   ├── middleware/
│   │   ├── logger.js          # Request logger (timestamp, method, status, duration)
│   │   └── errorHandler.js    # Centralized error handler
│   ├── routes/
│   │   └── visitors.js        # All /visitors endpoints
│   └── store/
│       └── visitors.js        # In-memory store with CRUD helpers
└── package.json
```

---

## Getting Started

```bash
cd visitors-api
npm install
npm start          # production
npm run dev        # development (auto-restart on file changes, Node ≥ 18)
```

The server starts on **http://localhost:3000**

---

## API Endpoints

| Method   | Endpoint            | Description                     | Body           |
|----------|---------------------|---------------------------------|----------------|
| `GET`    | `/`                 | API info & available endpoints  | —              |
| `GET`    | `/visitors`         | List all current visitors       | —              |
| `GET`    | `/visitors/count`   | Get total active visitor count  | —              |
| `GET`    | `/visitors/:id`     | Get a specific visitor by ID    | —              |
| `POST`   | `/visitors`         | Check in a new visitor          | `{ "name": "Alice" }` |
| `DELETE` | `/visitors/:id`     | Check out (remove) a visitor    | —              |

---

## Example Usage

### Check in a visitor
```bash
curl -X POST http://localhost:3000/visitors \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'
```
```json
{
  "success": true,
  "visitor": { "id": 1, "name": "Alice", "checkInTime": "2024-01-15T10:30:00.000Z" }
}
```

### List all visitors
```bash
curl http://localhost:3000/visitors
```
```json
{
  "success": true,
  "total": 1,
  "visitors": [
    { "id": 1, "name": "Alice", "checkInTime": "2024-01-15T10:30:00.000Z" }
  ]
}
```

### Get visitor count
```bash
curl http://localhost:3000/visitors/count
```
```json
{ "success": true, "count": 1 }
```

### Get visitor by ID
```bash
curl http://localhost:3000/visitors/1
```

### Check out a visitor
```bash
curl -X DELETE http://localhost:3000/visitors/1
```
```json
{
  "success": true,
  "message": "Visitor \"Alice\" has been checked out.",
  "visitor": { "id": 1, "name": "Alice", "checkInTime": "2024-01-15T10:30:00.000Z" }
}
```

---

## Error Responses

All errors return a consistent JSON shape:

```json
{
  "success": false,
  "error": "Visitor with ID 99 not found."
}
```

| Status | Scenario                              |
|--------|---------------------------------------|
| `400`  | Missing / invalid `name` field        |
| `400`  | Non-integer or negative ID in URL     |
| `404`  | Visitor ID does not exist             |
| `404`  | Unknown route                         |
| `500`  | Unexpected server error               |
