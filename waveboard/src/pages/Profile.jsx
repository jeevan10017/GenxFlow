import React, { useEffect, useState, useCallback } from "react";
import { useApi } from "../context/AppContext";
import { Link } from "react-router-dom";
import {
  Plus,
  Share2,
  Trash2,
  Palette,
  LogOut,
  BookUser,
  Image,
  X,
} from "lucide-react";

function Profile() {
  const { user, canvasService, logout } = useApi();
  const [canvases, setCanvases] = useState([]);
  const [canvasName, setCanvasName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareCanvasId, setShareCanvasId] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState("");

  const fetchCanvases = useCallback(async () => {
    try {
      const res = await canvasService.getAllCanvases();
      setCanvases(res.data);
    } catch (err) {
      setError("Failed to fetch canvases");
    }
  }, [canvasService]);

  useEffect(() => {
    if (user) fetchCanvases();
  }, [user, fetchCanvases]);

  const handleCreateCanvas = async (e) => {
    e.preventDefault();
    if (!canvasName.trim()) {
      setError("Canvas name cannot be empty.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await canvasService.createCanvas(canvasName);
      setCanvases((prev) => [res.data, ...prev]);
      setCanvasName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create canvas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (canvasId) => {
    if (window.confirm("Are you sure you want to permanently delete this canvas?")) {
      try {
        await canvasService.deleteCanvas(canvasId);
        setCanvases((prev) => prev.filter((c) => c._id !== canvasId));
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting canvas.");
      }
    }
  };
  
  const handleShareCanvas = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      setError("Please enter an email address to share.");
      return;
    }
    setShareLoading(true);
    setError("");
    setShareSuccess("");
    try {
      await canvasService.shareCanvas(shareCanvasId, shareEmail);
      setShareSuccess(`Canvas shared successfully with ${shareEmail}!`);
      fetchCanvases(); // Refresh canvases to show shared status
      setTimeout(() => {
        closeShareModal();
      }, 2000); // Close modal after 2 seconds on success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share canvas.");
    } finally {
      setShareLoading(false);
    }
  };

  const openShareModal = (canvasId) => {
    setShareCanvasId(canvasId);
    setError("");
    setShareSuccess("");
    setShareEmail("");
  };

  const closeShareModal = () => {
    setShareCanvasId(null);
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Palette className="w-16 h-16 text-stone-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 font-sans">
     <header className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-30">
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-3">
      {/* Logo */}
      <img 
        src="/logo_light_nobg.png" 
        alt="App Logo" 
        className="h-10 w-auto drop-shadow-md"
      />

      <h1 className="font-serif text-2xl font-bold text-stone-800">
        My Gallery
      </h1>
    </div>
          <div className="flex items-center gap-4">
                        {/* HIGHLIGHT: Display the user's name here */}
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-sm text-stone-800">{user.name}</p>
                            <p className="text-xs text-stone-500">{user.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Create Canvas Section */}
        <div className="bg-white p-8 rounded-xl  border border-stone-200 mb-12">
          <h2 className="font-serif text-3xl font-bold text-stone-800 mb-2">
            Start a New Creation
          </h2>
          <p className="text-stone-600 mb-6">
            Give your new canvas a title to begin.
          </p>
          <form onSubmit={handleCreateCanvas} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="e.g., 'Sketches of Venice', 'Character Concepts'..."
              value={canvasName}
              onChange={(e) => setCanvasName(e.target.value)}
              className="flex-grow w-full px-5 py-3 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center gap-2 px-8 py-3 bg-stone-800 text-white font-bold rounded-lg hover:bg-stone-900 transition-colors shadow-md disabled:opacity-60"
            >
              <Plus className="h-5 w-5" />
              {loading ? "Creating..." : "Create"}
            </button>
          </form>
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>

        {/* Canvases Grid */}
        <div>
          <h3 className="font-serif text-3xl font-bold text-stone-800 mb-8">
            Your Collection
          </h3>
          {canvases.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-stone-300 rounded-xl">
              <Image
                className="mx-auto h-16 w-16 text-stone-400 mb-4"
                strokeWidth={1.5}
              />
              <h4 className="text-xl font-semibold text-stone-700">
                Your gallery is empty.
              </h4>
              <p className="text-stone-500 mt-2">
                Create your first canvas above to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {canvases.map((canvas) => (
                <Link
                  to={`/canvas/${canvas._id}`}
                  key={canvas._id}
                  className="group block"
                >
                  <div className="bg-white rounded-xl  border border-stone-200 h-full flex flex-col justify-between hover:shadow-2xl hover:border-stone-300 transition-all duration-300 cursor-pointer">
                    <div className="p-6">
                      <h4 className="font-serif text-2xl font-bold text-stone-800 truncate mb-2 group-hover:text-indigo-600 transition-colors">
                        {canvas.name}
                      </h4>
                      <p className="text-sm text-stone-500 mb-4">
                        Created: {new Date(canvas.createdAt).toLocaleDateString()}
                      </p>
                      {canvas.shared_with && canvas.shared_with.length > 0 && (
                        <div className="flex items-center text-xs text-blue-600 font-semibold mb-4">
                          <BookUser className="h-4 w-4 mr-2" />
                          Shared with {canvas.shared_with.length} collaborator(s)
                        </div>
                      )}
                    </div>
                     <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-between items-center">
                    <Link
                      to={`/canvas/${canvas._id}`}
                      className="font-semibold text-stone-800 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      Open Canvas
                    </Link>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openShareModal(canvas._id);
                          }}
                          className="p-2 text-stone-500 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                          title="Share"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(canvas._id);
                          }}
                          className="p-2 text-stone-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {shareCanvasId && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeShareModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <div className="flex justify-between items-center p-6 border-b border-stone-200">
                <h3 className="font-serif text-2xl font-bold text-stone-800">Share Canvas</h3>
                <button onClick={closeShareModal} className="p-2 rounded-full hover:bg-stone-200 transition-colors">
                    <X className="h-5 w-5 text-stone-600" />
                </button>
            </div>
            <form onSubmit={handleShareCanvas} className="p-6">
              {shareSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg mb-4">
                      <p>{shareSuccess}</p>
                  </div>
              )}
              {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-4">
                      <p>{error}</p>
                  </div>
              )}
              <label htmlFor="shareEmail" className="block text-sm font-semibold text-stone-700 mb-2">
                Enter email address of collaborator:
              </label>
              <input
                type="email"
                id="shareEmail"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="collaborator@example.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 transition"
                required
              />
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={closeShareModal}
                  className="px-6 py-2 text-sm font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shareLoading}
                  className="px-6 py-2 text-sm font-semibold text-white bg-stone-800 hover:bg-stone-900 rounded-lg transition-colors disabled:opacity-50"
                >
                  {shareLoading ? "Sharing..." : "Share"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;