import { useState, useEffect } from "react";
import { useApi } from "../context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { LogIn } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();
  const { login, googleLogin, migrateCanvas } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    // This hook should only check for the message once on component mount
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the location state to prevent the message from re-appearing on navigation
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      const guestCanvasData = localStorage.getItem("guestCanvas");
      if (guestCanvasData) {
        if (window.confirm("Do you want to save your work from the guest session?")) {
          await migrateCanvas(JSON.parse(guestCanvasData));
          localStorage.removeItem("guestCanvas");
        }
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const guestCanvas = JSON.parse(localStorage.getItem("guestCanvas"));
      await googleLogin(credentialResponse, guestCanvas);
      if (guestCanvas) {
        localStorage.removeItem("guestCanvas");
      }
      navigate("/");
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError("Google authentication failed.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-100">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl border border-stone-200 overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <LogIn className="mx-auto h-12 w-12 text-stone-700 mb-4" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-800">
              Welcome Back
            </h1>
            <p className="text-stone-600 mt-2">
              Sign in to access your gallery.
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg">
              <p className="font-bold">Success</p>
              <p>{success}</p>
            </div>
          )}
          
          {/* Google Login */}
          <div className="mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                width="100%"
                theme="outline"
                size="large"
              />
          </div>

          {/* Divider */}
          <div className="flex items-center my-8">
            <hr className="flex-grow border-t border-stone-300" />
            <span className="mx-4 text-xs font-semibold text-stone-500">OR</span>
            <hr className="flex-grow border-t border-stone-300" />
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Email Input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition"
            />

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
                <label htmlFor="remember-me" className="flex items-center gap-2 text-stone-600">
                    <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"/>
                    Remember me
                </label>
                <a href="#" className="font-semibold text-stone-800 hover:underline">
                    Forgot password?
                </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="bg-stone-50 p-6 border-t border-stone-200 text-center">
            <p className="text-sm text-stone-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-stone-800 hover:underline">
                    Create One
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Login;