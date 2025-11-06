# API Integration Documentation

## Login API

The admin dashboard now integrates with the `/auth/login` API endpoint.

### Setup

1. **Configure API Base URL**
   
   Create a `.env` file in the root directory (copy from `.env.example`):
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

   Change the URL to match your backend server.

2. **API Service**
   
   The API service is located at `src/lib/api.ts` and provides:
   - Login functionality
   - Token management (stored in localStorage)
   - Authentication state checking
   - Logout functionality

### Login Endpoint

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "admin@hacmieu.com",
  "password": "your_password"
}
```

**Expected Response**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@hacmieu.com",
    "name": "Admin Name",
    "role": "admin"
  }
}
```

**Error Response**:
```json
{
  "message": "Invalid credentials"
}
```

### Features

1. **Authentication State**
   - Persisted in localStorage
   - Auto-login on page refresh if token exists
   - Token included in all API requests via Authorization header

2. **Login Form**
   - Email validation
   - Password visibility toggle
   - Loading state during authentication
   - Error message display
   - Disabled submit button during loading

3. **Security**
   - JWT token stored in localStorage
   - Token automatically included in API requests
   - Logout clears all stored credentials

### Usage in Code

```typescript
// Login
await apiService.login({ email, password });

// Logout
apiService.logout();

// Check authentication
const isAuth = apiService.isAuthenticated();

// Get current user
const user = apiService.getUser();
```

### Customization

To modify the API behavior, edit `src/lib/api.ts`:

- Change token storage mechanism
- Add refresh token logic
- Modify request headers
- Add interceptors for error handling
- Customize response format

### Error Handling

The login page handles various error scenarios:
- Network errors
- Invalid credentials
- Server errors (4xx, 5xx)
- Timeout errors

All errors are displayed to the user with appropriate messages in Vietnamese.
