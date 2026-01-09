import { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "UPDATE_PROFILE":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null,
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const hasInitialized = useRef(false);
  const lastUserId = useRef(null);

  // Sync Clerk user state with our auth context - only when user actually changes
  useEffect(() => {
    if (isLoaded) {
      const currentUserId = clerkUser?.id || null;
      
      // Only dispatch if user actually changed or first initialization
      if (!hasInitialized.current || lastUserId.current !== currentUserId) {
        hasInitialized.current = true;
        lastUserId.current = currentUserId;
        
        if (isSignedIn && clerkUser) {
          const userData = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            name: clerkUser.fullName || clerkUser.firstName || "User",
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            picture: clerkUser.imageUrl || `https://ui-avatars.com/api/?name=${clerkUser.firstName || 'User'}&background=D2691E&color=fff&size=200`,
            createdAt: clerkUser.createdAt,
            lastSignInAt: clerkUser.lastSignInAt,
          };
          dispatch({ type: "LOGIN_SUCCESS", payload: userData });
        } else {
          dispatch({ type: "LOGOUT" });
        }
      }
    }
  }, [isSignedIn, clerkUser, isLoaded]);

  const logout = async () => {
    try {
      await signOut();
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const updateProfile = async (profileData) => {
    try {
      if (!state.user) {
        throw new Error("No user logged in");
      }

      // Handle profile picture field mapping
      const processedData = {
        ...profileData
      };
      
      if (profileData.profilePicture) {
        processedData.picture = profileData.profilePicture;
        delete processedData.profilePicture;
      }

      // Update the state (Clerk profile updates should be done via Clerk dashboard or API)
      dispatch({ type: "UPDATE_PROFILE", payload: processedData });
      
      return { success: true };
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isLoaded,
        logout,
        clearError,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
