# Setup Guide - Lost & Found Website

## Step-by-Step Installation

### 1. Install PostgreSQL

Download and install PostgreSQL from: https://www.postgresql.org/download/windows/

Remember your PostgreSQL password during installation.

### 2. Create Database

Open PostgreSQL Command Line Interface (psql):

```cmd
psql -U postgres
```

Then run the SQL commands to create the database and tables:

```sql
CREATE DATABASE lost_found_db;

\c lost_found_db

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date_found DATE NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_date ON items(date_found);

-- Optional: Insert sample data
INSERT INTO items (name, description, date_found, image_url) VALUES
('Black Nike Hoodie', 'Found near the gym. Size M.', '2024-04-15', 'https://via.placeholder.com/300x200?text=Black+Nike+Hoodie'),
('Blue Backpack', 'Found in the library.', '2024-04-14', 'https://via.placeholder.com/300x200?text=Blue+Backpack'),
('Silver Watch', 'Found near cafeteria.', '2024-04-13', 'https://via.placeholder.com/300x200?text=Silver+Watch');
```

### 3. Configure Backend

Navigate to the backend folder and create a `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=lost_found_db
PORT=5000
JWT_SECRET=your-secret-key-change-this
ADMIN_EMAIL=vladislavvitiv@gmail.com
```

### 4. Start Backend Server

```bash
cd backend
npm start
```

The server will start at `http://localhost:5000`

### 5. Open Frontend

Open your browser and go to:
- **Public Site**: `http://localhost:5000/` or open `frontend/public/index.html`
- **Admin Panel**: `http://localhost:5000/admin.html` or open `frontend/public/admin.html`

### 6. Admin Login

Use these credentials:
- **Email**: `vladislavvitiv@gmail.com`
- **Password**: (any password - the system will generate a JWT token)

## Project Structure

```
c:\ForTheWebSites\
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Authentication
│   │   ├── routes/       # API endpoints
│   │   └── server.js     # Main server file
│   ├── config/
│   │   └── database.js   # PostgreSQL connection
│   ├── .env              # Environment variables
│   ├── package.json      # Dependencies
│   └── setup-database.sql # Database setup
├── frontend/             # HTML/CSS/JavaScript frontend
│   ├── public/
│   │   ├── index.html    # Public page
│   │   └── admin.html    # Admin panel
│   ├── css/
│   │   ├── styles.css    # Main styles
│   │   └── admin.css     # Admin styles
│   ├── js/
│   │   ├── main.js       # Public page logic
│   │   └── admin.js      # Admin panel logic
│   └── img/              # Images folder
└── README.md             # Project documentation
```

## API Endpoints

### Public Endpoints

- `GET /api/items` - Get all found items
- `GET /api/items/:id` - Get specific item

### Admin Endpoints (Require Token)

- `POST /api/auth/login` - Login to get JWT token
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

## Features

✅ **Public Page**
- Browse all found items
- Search items by name or description
- Responsive design (mobile, tablet, desktop)

✅ **Admin Panel**
- Secure login (email-based)
- Add new found items
- Edit existing items
- Delete items
- View all items

✅ **Design**
- Irish school theme with dark green and gold colors
- Clean, simple interface
- Mobile-friendly layout

## Troubleshooting

### Cannot connect to database
- Verify PostgreSQL is running
- Check DB credentials in `.env` file
- Ensure database and tables exist

### Cannot login to admin
- Use email: `vladislavvitiv@gmail.com`
- Check JWT_SECRET in `.env`
- Clear browser cache/cookies

### CORS errors
- Backend must be running on `http://localhost:5000`
- Check CORS settings in `backend/src/server.js`

### Frontend not loading
- Ensure backend server is running
- Check browser console for errors (F12)
- Verify file paths are correct

## Development Tips

**For development with auto-reload:**
```bash
cd backend
npm run dev
```

**View database:**
```cmd
psql -U postgres -d lost_found_db
SELECT * FROM items;
```

**Reset database:**
```sql
DROP DATABASE lost_found_db;
-- Then re-run database creation commands
```

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend installed and ready
3. ✅ Frontend created and styled
4. ✅ Admin authentication implemented
5. ✅ CRUD operations working
6. 🚀 Ready for testing!
