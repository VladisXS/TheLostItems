# Quick Reference - Lost & Found Website

## Project URLs

- **Public Site**: `http://localhost:5000/` or `http://localhost:5000/index.html`
- **Admin Panel**: `http://localhost:5000/admin.html`
- **API Base**: `http://localhost:5000/api`

## Admin Credentials

- **Email**: `vladislavvitiv@gmail.com`
- **Password**: (any password - generates JWT token)

## Color Scheme

- **Dark Green**: #1B4332 (Primary)
- **White**: #FFFFFF (Background)
- **Gold**: #D4A574 (Accents)
- **Light Green**: #2D6A4F (Secondary)

## Key Files

### Backend
- `backend/src/server.js` - Main server entry point
- `backend/config/database.js` - PostgreSQL connection
- `backend/src/routes/items.js` - Item API routes
- `backend/src/routes/auth.js` - Authentication routes
- `backend/.env` - Environment configuration

### Frontend
- `frontend/public/index.html` - Public page
- `frontend/public/admin.html` - Admin panel
- `frontend/css/styles.css` - Main styles
- `frontend/css/admin.css` - Admin styles
- `frontend/js/main.js` - Public page logic
- `frontend/js/admin.js` - Admin panel logic

## Starting the Project

### Option 1: Batch Script (Windows CMD)
```bash
start-server.bat
```

### Option 2: PowerShell
```powershell
.\start-server.ps1
```

### Option 3: Manual
```bash
cd backend
npm start
```

## Database Commands

### Connect to database
```bash
psql -U postgres -d lost_found_db
```

### View all items
```sql
SELECT * FROM items;
```

### Add sample item
```sql
INSERT INTO items (name, description, date_found, image_url) 
VALUES ('Item Name', 'Description', '2024-04-20', 'https://image.url');
```

### Delete all items
```sql
DELETE FROM items;
```

### Reset database
```sql
DROP DATABASE lost_found_db;
```

## API Endpoints

### Public (No auth required)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/items` | Get all items |
| GET | `/api/items/:id` | Get specific item |

### Admin (Requires JWT token)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/verify` | Verify token |
| POST | `/api/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

## Example API Calls

### Get all items
```bash
curl http://localhost:5000/api/items
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vladislavvitiv@gmail.com","password":"anything"}'
```

### Create item (with token)
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Item","description":"Desc","date_found":"2024-04-20","image_url":"url"}'
```

## Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 480px - 767px
- **Small Mobile**: < 480px

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to DB | Verify PostgreSQL running, check .env credentials |
| Admin login fails | Use correct email, check JWT_SECRET in .env |
| CORS errors | Backend must run on localhost:5000 |
| Page not loading | Check browser console (F12), verify backend running |
| Items not displaying | Check network tab, verify API endpoint |

## Development Commands

### Install dependencies
```bash
npm install
```

### Run with auto-reload (development)
```bash
npm run dev
```

### Run production server
```bash
npm start
```

### View npm scripts
```bash
npm run
```

## Environment Variables (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=lost_found_db
PORT=5000
JWT_SECRET=your-secret-key
ADMIN_EMAIL=vladislavvitiv@gmail.com
```

## File Structure Quick Guide

```
c:\ForTheWebSites\
├── backend/              # Node.js API
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth middleware
│   │   ├── routes/       # API routes
│   │   └── server.js
│   ├── config/
│   │   └── database.js
│   └── .env
├── frontend/             # HTML/CSS/JS UI
│   ├── public/           # HTML files
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript logic
│   └── img/              # Images
└── docs/                 # Documentation
```

## Browser DevTools Tips

- **Network Tab**: Check API calls and responses
- **Console**: View JavaScript errors
- **Application**: Check localStorage for JWT token
- **Elements**: Inspect CSS and HTML

## Common Errors & Fixes

**"Cannot find module 'express'"**
```bash
npm install
```

**"ECONNREFUSED" (PostgreSQL)**
- Start PostgreSQL service
- Check DB credentials in .env

**"Invalid token"**
- Clear localStorage in browser
- Login again to get new token

**"CORS blocked"**
- Backend must be running
- Check localhost:5000 availability

## Performance Tips

- Use search to filter items instead of loading all
- Optimize image URLs (use small thumbnails)
- Cache API responses in frontend when appropriate
- Use database indexes for frequently searched fields

## Security Notes

⚠️ Do not commit `.env` to Git
⚠️ Change JWT_SECRET in production
⚠️ Use HTTPS in production
⚠️ Validate all user inputs
⚠️ Keep dependencies updated

## Useful Links

- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [MDN Web Docs](https://developer.mozilla.org/)
