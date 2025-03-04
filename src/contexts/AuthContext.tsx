import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";

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
  logout: () => Promise<void>;
  updateProfile: (
    data: Partial<User>,
    saveToServer?: boolean
  ) => Promise<User | null>;
  fetchUserProfile: () => Promise<User | null>;
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
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (user) {
          const result = await fetchUserProfile();
          if (!result) {
            setUser(null);
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      if (!user || !user.id) return null;

      const response = await fetch(
        `http://127.0.0.1:8000/profile/?user=${user.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.auth_user) {
          const userData: User = {
            id: data.auth_user.id,
            email: data.auth_user.email || "",
            firstName: data.auth_user.first_name || "",
            lastName: data.auth_user.last_name || "",
            username: data.auth_user.username || "",
            dateOfBirth: data.auth_user.birthday || "",
            country: data.auth_user.country || "",
            region: data.auth_user.region || "",
            phone: data.auth_user.phone || "",
            gender: data.auth_user.gender || "",
            district: data.auth_user.district || "",
            placeOfEducation: data.auth_user.place_of_education || "",
            publishPhone: data.auth_user.publish_phone || false,
            publicStatus: data.auth_user.public_status || false,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          return userData;
        }
      } else if (response.status === 401) {
        setUser(null);
        localStorage.removeItem("user");
        return null;
      }
      return user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return user;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();

      const basicUser: User = {
        id: data.user || "",
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

      setUser(basicUser);
      localStorage.setItem("user", JSON.stringify(basicUser));

      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await fetchUserProfile();
      } catch (error) {
        console.warn("Could not fetch full profile after login:", error);
      }

      return basicUser;
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
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      const response = await fetch("http://127.0.0.1:8000/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password1: password,
          password2: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await response.json();

      const basicUser: User = {
        id: data.user || "",
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

      setUser(basicUser);
      localStorage.setItem("user", JSON.stringify(basicUser));

      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await fetchUserProfile();
      } catch (error) {
        console.warn("Could not fetch full profile after signup:", error);
      }

      return basicUser;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("http://127.0.0.1:8000/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");

      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
  };

  const updateProfile = async (data: Partial<User>, saveToServer = false) => {
    if (!user) return null;

    try {
      const updatedUser: User = {
        ...user,
        ...data,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (saveToServer) {
        setIsLoading(true);

        const serverData = {
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
        };

        const response = await fetch(
          `http://127.0.0.1:8000/profile/?user=${updatedUser.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify(serverData),
          }
        );

        if (!response.ok) {
          console.warn(
            `Server returned ${response.status} when updating profile`
          );

          if (response.status === 401) {
            const refreshResult = await fetchUserProfile();
            if (!refreshResult) {
              setUser(null);
              localStorage.removeItem("user");
              return null;
            }

            const retryResponse = await fetch(
              `http://127.0.0.1:8000/profile/?user=${updatedUser.id}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify(serverData),
              }
            );

            if (!retryResponse.ok) {
              console.error("Profile update failed even after session refresh");
              return updatedUser;
            }
          }
        }
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      return user;
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
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
