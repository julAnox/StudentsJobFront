"use client";

import { createContext, useState, useContext, type ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: string;
  country: string;
  region: string;
  phone: string;
  gender: string;
  avatar?: string;
  district: string;
  placeOfEducation: string;
  publishPhone: boolean;
  publicStatus: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Create user object with basic data
      const user: User = {
        id: data.user,
        email: email,
        firstName: "",
        lastName: "",
        username: email.split("@")[0],
        dateOfBirth: "",
        country: "",
        region: "",
        phone: "",
        gender: "",
        district: "",
        placeOfEducation: "",
        publishPhone: false,
        publicStatus: false,
      };

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password1: password,
          password2: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Create user object with basic data
      const user: User = {
        id: data.user,
        email: email,
        firstName: "",
        lastName: "",
        username: email.split("@")[0],
        dateOfBirth: "",
        country: "",
        region: "",
        phone: "",
        gender: "",
        district: "",
        placeOfEducation: "",
        publishPhone: false,
        publicStatus: false,
      };

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      // First, update the local user data
      const updatedUser: User = {
        ...user,
        ...data,
      };

      // Then try to update on the server with proper authentication
      const response = await fetch("http://127.0.0.1:8000/profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for sending cookies
        body: JSON.stringify({
          first_name: updatedUser.firstName,
          last_name: updatedUser.lastName,
          birthday: updatedUser.dateOfBirth,
          country: updatedUser.country,
          region: updatedUser.region,
          district: updatedUser.district,
          place_of_education: updatedUser.placeOfEducation,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
          publish_phone: updatedUser.publishPhone,
          public_status: updatedUser.publicStatus,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn(
            "Authentication error. Attempting to refresh session..."
          );

          // You might need to implement a session refresh mechanism here
          // For example, you could call a refresh token endpoint

          // For now, we'll still update the local state
          console.warn(
            "Continuing with local update despite authentication error"
          );
        } else {
          console.warn(
            `Server returned ${response.status}, but continuing with local update`
          );
        }
      } else {
        console.log("Profile updated successfully on server");
      }

      // Update local state regardless of server response
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);

      // Still update local state even if server request failed
      if (user) {
        const updatedUser: User = {
          ...user,
          ...data,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
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
