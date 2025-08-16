import { useState, useEffect } from "react";
import { useApi } from "../context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { LogIn, User } from "lucide-react";

function Login() {
    // --- All your existing state, useEffects, and handler functions remain the same ---
    // (No changes needed for the logic)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const location = useLocation();
    const { login, googleLogin, migrateCanvas, isAuthenticated } = useApi();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (location.state?.message) {
            setSuccess(location.state.message);
            navigate(location.pathname, { replace: true, state: {} });
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
        <div className="min-h-screen w-full flex items-center justify-center md:p-4 bg-white">
            <div className="w-full max-w-4xl flex flex-col lg:flex-row   overflow-hidden ">
                
                {/* --- Image Section --- */}
                <div className="w-full lg:w-2/5 min-h-[250px] lg:min-h-0 relative">
                    <img
                        className="h-full w-full object-cover"
                        src="/thin.png"
                        alt="Abstract gradient background"
                    />
                </div>

                {/* --- Form Section --- */}
                <div className="w-full lg:w-3/5 flex flex-col justify-center p-8 sm:p-12">
                    <div>
                        <div className="text-center mb-8">
                            <LogIn className="mx-auto h-10 w-10 text-stone-700 mb-4" />
                            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-800">
                                Welcome Back
                            </h1>
                            <p className="text-stone-600 mt-2">Sign in to access your gallery.</p>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg text-sm">
                                <p>{error}</p>
                            </div>
                        )}
                        {success && (
                             <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-r-lg text-sm">
                                <p>{success}</p>
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleFailure}
                                width="100%"
                                theme="outline"
                                size="large"
                            />
                        </div>

                        <div className="flex items-center my-6">
                            <hr className="flex-grow border-t border-stone-300" />
                            <span className="mx-4 text-xs font-semibold text-stone-500">OR</span>
                            <hr className="flex-grow border-t border-stone-300" />
                        </div>

                        <form className="space-y-4" onSubmit={handleLogin}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-6 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-all duration-300 shadow-lg disabled:opacity-50"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-stone-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-stone-800 hover:underline cursor-pointer">
                                Create One
                            </Link>
                        </p>
                         <p className="text-stone-600 mt-2">
                            Or{' '}
                            <Link to="/guest" className="font-bold text-stone-800 hover:underline inline-flex items-center gap-1 cursor-pointer">
                                <User className="h-4 w-4" /> Continue as Guest
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;