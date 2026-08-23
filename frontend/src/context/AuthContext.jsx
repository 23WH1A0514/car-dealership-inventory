import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext = createContext();

function getUserFromToken(token) {
  if (!token) return null;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return payload;
  } catch (error) {
    console.error("Invalid token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return getUserFromToken(savedToken);
  });

  const login = (newToken) => {
    localStorage.setItem("token", newToken);

    setToken(newToken);
    setUser(getUserFromToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isLoggedIn: !!token,
        isAdmin: user?.role === "admin"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}