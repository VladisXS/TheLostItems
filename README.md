# Lost & Found - Clonfert College

A full-stack web application for managing lost and found items at Clonfert College. Students can browse found items while administrators can manage the inventory.

## Features

- 🔍 **Item Discovery**: Students can search and view found items
- 👨‍💼 **Admin Panel**: Staff can add, edit, and delete found items
- 🔐 **Secure Authentication**: JWT-based admin authentication
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop
- 🎨 **Irish School Theme**: Dark green and gold color scheme
- 🗄️ **PostgreSQL Database**: Reliable data storage

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT

## Directory Structure

```
.
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── itemController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── items.js
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── css/
│   │   ├── styles.css
│   │   └── admin.css
│   ├── js/
│   │   ├── main.js
│   │   └── admin.js
│   ├── public/
│   │   ├── index.html
│   │   └── admin.html
│   └── img/
├── README.md
└── .gitignore
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

### Setup Instructions

1. **Clone the repository**
   ```bash
   cd c:\ForTheWebSites
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE lost_found_db;
   
   \c lost_found_db
   
   CREATE TABLE items (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     description TEXT NOT NULL,
     date_found DATE NOT NULL,
     image_url VARCHAR(500),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
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

5. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

6. **Open the frontend**
   
   Open `frontend/public/index.html` in your browser, or serve it through the Express static middleware (already configured).

## Usage

### Public Pages

- **Home Page** (`index.html`): Browse all found items with search functionality
- **Item Cards**: View item details including name, description, and date found

### Admin Panel

- **Login** (`admin.html`): Access with email `vladislavvitiv@gmail.com`
- **Add Item**: Create new found item entries with photo, name, description, and date
- **Edit Item**: Modify existing item information
- **Delete Item**: Remove items from the database

## API Endpoints

### Public Endpoints
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID

### Admin Endpoints (Require JWT Token)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

## Design

### Colors
- **Dark Green**: #1B4332 (Primary)
- **White**: #FFFFFF (Background)
- **Gold**: #D4A574 (Accents)
- **Light Green**: #2D6A4F (Secondary)

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: 480px - 767px
- Small Mobile: < 480px

## Security Features

- ✅ Admin-only access restricted to `vladislavvitiv@gmail.com`
- ✅ JWT token-based authentication
- ✅ CORS protection
- ✅ Input sanitization to prevent XSS
- ✅ Database-level data protection

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database and table exist

### CORS Errors
- Make sure backend is running on `http://localhost:5000`
- Check CORS configuration in `backend/src/server.js`

### Admin Login Issues
- Verify you're using the email: `vladislavvitiv@gmail.com`
- Check JWT_SECRET in `.env`

## Future Enhancements

- [ ] Photo upload functionality
- [ ] Email notifications for new items
- [ ] Advanced search filters
- [ ] User registration system
- [ ] Item claiming mechanism
- [ ] Admin dashboard analytics

## License

ISC

## Contact

For issues or questions, contact the Clonfert College administration office.
