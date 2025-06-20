import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

  const BackendURL = process.env.REACT_APP_BACKEND_URL;
function Profile() {
  const [user, setUser] = useState(null);
  const [canvases, setCanvases] = useState([]);
  const [canvasName, setCanvasName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareCanvasId, setShareCanvasId] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BackendURL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setError("Failed to fetch profile");
      }
    };

    const fetchCanvases = async () => {
      try {
        const res = await axios.get(
          `${BackendURL}/api/canvas/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCanvases(res.data);
      } catch (err) {
        setError("Failed to fetch canvases");
      }
    };

    fetchProfile();
    fetchCanvases();
  }, [token, navigate]);

  const handleCreateCanvas = async (e) => {
    e.preventDefault();
    if (!canvasName.trim()) {
      setError("Canvas name can't be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${BackendURL}/api/canvas/create`,
        { name: canvasName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCanvases([...canvases, res.data]);
      setCanvasName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create canvas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (canvasId) => {
    try {
      const res = await axios.delete(
        `${BackendURL}/api/canvas/${canvasId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 200) {
        setCanvases((prev) => prev.filter((c) => c._id !== canvasId));
      } else {
        setError("Failed to delete canvas");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting canvas");
    }
  };

  const handleShareCanvas = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      setError("Email address is required");
      return;
    }

    if (!shareCanvasId) {
      setError("No canvas selected for sharing");
      return;
    }

    setShareLoading(true);
    setError("");
    setShareSuccess("");

    try {
      const res = await axios.put(
        `${BackendURL}/api/canvas/share/${shareCanvasId}`,
        { sharedEmail: shareEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (res.status === 200) {
        setShareSuccess(`Canvas shared successfully with ${shareEmail}!`);
        setShareEmail("");
        setShareCanvasId(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share canvas");
    } finally {
      setShareLoading(false);
    }
  };

  const openShareModal = (canvasId) => {
    setShareCanvasId(canvasId);
    setError("");
    setShareSuccess("");
  };

  const closeShareModal = () => {
    setShareCanvasId(null);
    setShareEmail("");
    setError("");
    setShareSuccess("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex justify-center items-center">
        <div className="relative">
          <div className="relative"> <svg className="w-8 h-8 animate-bounce" viewBox="0 0 24 24" fill="none"> <path d="M12 19l7-7 3 3-7 7-3-3z" fill="currentColor" className="text-yellow-400"/> <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" fill="currentColor" className="text-gray-600"/> </svg> <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"> <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div> </div> </div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-400 opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
        
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
            Welcome, {user.name}
          </h1>
          <p className="text-xl text-purple-200 font-light">Create, share, and manage your digital canvases</p>
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-8 text-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{canvases.length}</div>
                <div className="text-sm">Total Canvases</div>
              </div>
              <div className="w-px h-8 bg-purple-400"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {canvases.reduce((sum, canvas) => sum + (canvas.shared_with?.length || 0), 0)}
                </div>
                <div className="text-sm">Shared With</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 p-4 rounded-xl mb-8 animate-in slide-in-from-top duration-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {shareSuccess && (
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/50 text-green-200 p-4 rounded-xl mb-8 animate-in slide-in-from-top duration-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {shareSuccess}
            </div>
          </div>
        )}

        {/* Create Canvas Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-12 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Create New Canvas</h2>
          </div>
          <form onSubmit={handleCreateCanvas} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter your canvas name..."
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg ${
                loading ? "opacity-50 cursor-not-allowed transform-none" : ""
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Canvas"
              )}
            </button>
          </form>
        </div>

        {/* Canvases Grid */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <svg className="w-8 h-8 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
            </svg>
            Your Creative Canvases
          </h2>

          {canvases.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <svg className="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No canvases yet</h3>
              <p className="text-purple-200 text-lg max-w-md mx-auto">
                Start your creative journey by creating your first canvas above. Let your imagination flow!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {canvases.map((canvas, index) => (
                <div
                  key={canvas._id}
                  className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {canvas.name}
                        </h3>
                        <div className="space-y-1 text-sm text-purple-200">
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {new Date(canvas.createdAt).toLocaleDateString()}
                          </p>
                          <p className="flex items-center font-mono text-xs">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            {canvas._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {canvas.shared_with && canvas.shared_with.length > 0 && (
                      <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                        <p className="text-sm text-green-200 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                          </svg>
                          Shared with {canvas.shared_with.length} user{canvas.shared_with.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/canvas/${canvas._id}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Open
                      </Link>
                      <button
                        className="px-4 py-3 bg-green-500/20 border border-green-400/30 text-green-300 rounded-xl hover:bg-green-500/30 transform hover:scale-105 transition-all duration-200 font-medium"
                        onClick={() => openShareModal(canvas._id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                      <button
                        className="px-4 py-3 bg-red-500/20 border border-red-400/30 text-red-300 rounded-xl hover:bg-red-500/30 transform hover:scale-105 transition-all duration-200 font-medium"
                        onClick={() => handleDelete(canvas._id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share Modal */}
        {shareCanvasId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Share Canvas</h3>
              </div>
              <form onSubmit={handleShareCanvas}>
                <div className="mb-6">
                  <label htmlFor="shareEmail" className="block text-sm font-medium text-purple-200 mb-3">
                    Enter email address to share with:
                  </label>
                  <input
                    type="email"
                    id="shareEmail"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={closeShareModal}
                    className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={shareLoading}
                    className={`flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg ${
                      shareLoading ? "opacity-50 cursor-not-allowed transform-none" : ""
                    }`}
                  >
                    {shareLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Sharing...
                      </div>
                    ) : (
                      "Share Canvas"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;