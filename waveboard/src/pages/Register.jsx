import { useState, useEffect } from "react";
import { useApi } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Brush, User } from "lucide-react";

function Register() {
    // --- All your existing state, useEffects, and handler functions remain the same ---
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { register, googleLogin, isAuthenticated } = useApi();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await register(form.name, form.email, form.password);
            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/login", {
                    state: { message: "Registration successful! Please login." },
                });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const guestCanvas = JSON.parse(localStorage.getItem("guestCanvas"));
            await googleLogin(credentialResponse, guestCanvas);
            localStorage.removeItem("guestCanvas");
            navigate("/");
        } catch (err) {
            setError("Google registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleFailure = () => {
        setError("Google authentication failed.");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center md:p-4 bg-white">
            <div className="w-full max-w-4xl flex flex-col lg:flex-row  overflow-y-hidden ">
                
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
                            {/* <Brush className="mx-auto h-10 w-10 text-stone-700 mb-4" /> */}
                            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-800">
                                Join the Studio
                            </h1>
                            <p className="text-stone-600 mt-2">Begin your creative journey.</p>
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

                        <form className="space-y-4" onSubmit={handleRegister}>
                             <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Your Full Name"
                                required
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition"
                            />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="Email Address"
                                required
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition"
                            />
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Create Password"
                                required
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-6 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-all duration-300 shadow-lg disabled:opacity-50"
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>
                    </div>

                     <div className="mt-8 text-center text-sm">
                        <p className="text-stone-600">
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold text-stone-800 hover:underline cursor-pointer">
                                Sign In
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

export default Register;