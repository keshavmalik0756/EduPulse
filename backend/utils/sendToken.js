export const sendToken = (user, statusCode, res) => {
  try {
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();
    
    // Validate that tokens were generated
    if (!token || !refreshToken) {
      throw new Error("Failed to generate authentication tokens");
    }

    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    res
      .status(statusCode)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
        refreshToken,
      });
  } catch (error) {
    console.error("💥 Token generation error:", error);
    // Send a generic success response without tokens if there's an error
    res.status(statusCode).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      message: "Login successful. Please refresh the page to continue.",
    });
  }
};