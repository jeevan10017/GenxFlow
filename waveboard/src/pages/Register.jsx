import { useState, useEffect } from "react";
import { useApi } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Brush, User } from "lucide-react";

function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { register, googleLogin, isAuthenticated } = useApi();
    const navigate = useNavigate();

    // Redirect if already authenticated
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
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-100">
            <div className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl border border-stone-200 overflow-hidden">
                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <Brush className="mx-auto h-12 w-12 text-stone-700 mb-4" />
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-800">
                            Join the Studio
                        </h1>
                        <p className="text-stone-600 mt-2">Begin your creative journey with us.</p>
                    </div>

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

                    <div className="mb-6">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            width="100%"
                            theme="outline"
                            size="large"
                        />
                    </div>

                    <div className="flex items-center my-8">
                        <hr className="flex-grow border-t border-stone-300" />
                        <span className="mx-4 text-xs font-semibold text-stone-500">OR</span>
                        <hr className="flex-grow border-t border-stone-300" />
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
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
                            className="w-full py-4 px-6 bg-stone-800 text-white font-bold rounded-md hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-all duration-300 shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Creating Account..." : "Create Account with Email"}
                        </button>
                    </form>
                </div>

                <div className="bg-stone-50 p-6 border-t border-stone-200 text-center space-y-4">
                    <p className="text-sm text-stone-600">
                        Already have an account?{" "}
                        <Link to="/login" className="font-bold text-stone-800 hover:underline cursor-pointer">
                            Sign In
                        </Link>
                    </p>
                    <p className="text-sm text-stone-600">
                        Or{' '}
                        <Link to="/guest" className="font-bold text-stone-800 hover:underline flex items-center justify-center gap-2 cursor-pointer">
                             <User className="h-4 w-4" /> Continue as a Guest
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;