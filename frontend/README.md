# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


## How the authentication works:
1.Login: The frontend sends the email and password to POST /user/login with credentials enabled. The backend checks the password against the stored hash. See UserLogin.jsx and user.js.

2.Token creation: If the credentials are valid, the backend creates a JWT containing the user ID, name, email, and role. It signs the token with JWT_SECRET and sets it as an HttpOnly cookie. See auth.js and user.js.

3.Verify before showing home: After login, the frontend calls GET /user/me. The browser sends the cookie because the request uses withCredentials: true. The authenticateToken middleware reads the cookie and verifies the JWT. If valid, /user/me returns the user data; if missing or invalid, it returns 401. See the protected route.

4.Display name: The frontend stores the returned user data and passes it to the navbar, which displays user.fullName. The name is returned by the backend—not read from the cookie in frontend JavaScript. See App.jsx and Navbar.jsx.

5.Refresh: When the app loads, useEffect calls /user/me again. That restores the user from the cookie after a refresh; it doesn’t replace backend token verification.