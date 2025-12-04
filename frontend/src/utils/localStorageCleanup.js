// Utility to clean up localStorage from invalid data
export const cleanInvalidLocalStorage = () => {
  try {
    // Clean up invalid user data
    const user = localStorage.getItem("user");
    if (user === "undefined" || user === undefined || user === null) {
      localStorage.removeItem("user");
    }
    
    // Clean up invalid token data
    const token = localStorage.getItem("token");
    if (token === "undefined" || token === undefined) {
      localStorage.removeItem("token");
    }
    
    // Clean up invalid refresh token data
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken === "undefined" || refreshToken === undefined) {
      localStorage.removeItem("refreshToken");
    }
    
    // Clean up invalid userId data
    const userId = localStorage.getItem("userId");
    if (userId === "undefined" || userId === undefined) {
      localStorage.removeItem("userId");
    }
    
    console.log("LocalStorage cleanup completed");
  } catch (error) {
    console.error("Error cleaning localStorage:", error);
  }
};

// Run cleanup on module load
cleanInvalidLocalStorage();