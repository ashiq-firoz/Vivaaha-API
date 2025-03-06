# Express.js Server Component For Designers Den 

This is an **Express.js backend project** built to manage authentication, Google OAuth, and RESTful APIs using **MongoDB**. It features modular directory architecture for better scalability and maintainability.

---

## 🗂️ Project Structure
```
├───config             # Configuration files
├───controllers        # Contains logic for handling requests
├───middleware         # Middleware functions (e.g., authentication)
├───models             # Mongoose schemas and models
└───routes             # Application routes
```

### 🛠️ Key Functionalities
1. **Authentication:**
   - Email/password-based login.
   - Google OAuth integration via `/api/auth/google`.
2. **Middleware:**
   - `auth` middleware for token verification.
3. **Database:**
   - Models for MongoDB collections defined using **Mongoose**.

---

## 📜 API Routes

| Endpoint                 | Method | Description                       |
|--------------------------|--------|-----------------------------------|
| `/api/auth/login`        | POST   | User login (email/password)       |
| `/api/auth/register`     | POST   | User registration                 |
| `/api/auth/google`       | GET    | Google OAuth                      |

### 🛡️ JWT Token Generation
Upon login, a **JWT token** is created:
```javascript
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

---

## 🏗️ Installation

### Using **npm**:
```bash
npm install
```

### Using **yarn**:
```bash
yarn install
```

---

## 🔧 Scripts

- **Development Mode**:
  ```bash
  npm run dev
  ```
  or
  ```bash
  yarn dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```
  or
  ```bash
  yarn start
  ```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following keys:

```env
PORT=3001
FRONTEND_URL=   # Frontend application URL
BACKEND_URL=    # Backend application URL
MONGODB_URI=    # MongoDB connection string
JWT_SECRET=     # Secret for JWT signing
GOOGLE_CLIENT_ID=      # Google OAuth client ID
GOOGLE_CLIENT_SECRET=  # Google OAuth client secret
GOOGLE_CALLBACK_URL=   # Callback URL for Google OAuth
MAILSERVER_URL=  # appscript deployment url
```

---

## ✨ Features

- **Secure Authentication**: 
  JWT-based user authentication for session management.
- **Google OAuth**:
  Simplified user login with Google accounts.
- **Scalable Architecture**:
  Organized folder structure for scalability and maintenance.
- **MongoDB Integration**:
  Powerful NoSQL database support using **Mongoose**.

---

## 🚀 Get Started

1. Clone the repository:
   ```bash
   git clone https://github.com/hyperbala/backend-online-shop.git
   cd backend-online-shop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. Set up the `.env` file.

4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

5. Access the application at `http://localhost:3001`.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).