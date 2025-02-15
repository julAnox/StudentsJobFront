import { createContext, useContext, useState, ReactNode } from "react";
import { User, AuthContextType } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const mockUser: User = {
        id: "",
        email,
        firstName: "",
        lastName: "",
        username: "",
        dateOfBirth: "",
        country: "",
        region: "",
        phone: "",
      };
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      return mockUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        firstName: "",
        lastName: "",
        username: email.split("@")[0],
        dateOfBirth: "",
        country: "",
        region: "",
        phone: "",
      };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return null;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
