const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const pool = require('../../config/database');

async function ensureUsersTableExists() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            google_id VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            photo VARCHAR(500),
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');
}

// Google OAuth Strategy - only initialize if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET') {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            await ensureUsersTableExists();

            const { id, displayName, emails, photos } = profile;
            const email = emails[0].value;
            const photo = photos[0].value;

            // Check if user exists in database
            let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [id]);

            if (result.rows.length === 0) {
                // Create new user
                result = await pool.query(
                    'INSERT INTO users (google_id, name, email, photo) VALUES ($1, $2, $3, $4) RETURNING *',
                    [id, displayName, email, photo]
                );
            }

            return done(null, result.rows[0]);
        } catch (error) {
            return done(error, null);
        }
    }));
} else {
    console.warn('⚠️  Google OAuth disabled: Missing or invalid GOOGLE_CLIENT_SECRET in .env');
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
