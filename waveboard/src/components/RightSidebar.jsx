import React, { useState } from 'react';
import axios from 'axios';
import { Users, Settings, Share2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

const RightSidebar = ({ canvas, navigate, connectedUsers = [], isConnected = false, isDarkMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState('users');
  const [shareEmail, setShareEmail] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const BackendURL = process.env.REACT_APP_BACKEND_URL;

  const handleShare = () => {
    setShowShareModal(true);
    setError("");
    setSuccess("");
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      setError("Email address is required");
      return;
    }
    setShareLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.put(
        `${BackendURL}/api/canvas/share/${canvas._id}`,
        { sharedEmail: shareEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Canvas shared with ${shareEmail}!`);
      setShareEmail("");
      setTimeout(() => setShowShareModal(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share canvas");
    } finally {
      setShareLoading(false);
    }
  };

  const closeShareModal = () => setShowShareModal(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this canvas? This cannot be undone.')) {
      try {
        await axios.delete(`${BackendURL}/api/canvas/${canvas._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Canvas deleted!');
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting canvas");
      }
    }
  };

  const toggleSection = (section) => setActiveSection(activeSection === section ? '' : section);
  const getUserDisplayName = (user) => user.username || user.name || user.email || 'Anonymous';
  const getUserInitial = (user) => getUserDisplayName(user).charAt(0).toUpperCase();

  if (isCollapsed) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setIsCollapsed(false)}
          className={`p-2 rounded-lg shadow-lg hover:shadow-xl transition-all ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        >
          <Settings size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed top-4 right-4 w-72 border rounded-lg shadow-lg z-40 max-h-[calc(100vh-2rem)] flex flex-col transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-3 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Canvas Info</h3>
          <button onClick={() => setIsCollapsed(true)} className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Details Section */}
          <div className={`p-3 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <h4 className={`font-medium mb-1.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{canvas?.title || 'Untitled'}</h4>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Created: {new Date(canvas.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Users Section */}
          <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <button onClick={() => toggleSection('users')} className={`w-full flex items-center justify-between p-3 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center space-x-2">
                <Users size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Users ({connectedUsers.length})</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${activeSection === 'users' ? '' : '-rotate-90'} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
            {activeSection === 'users' && (
              <div className="px-3 pb-3 mt-1 space-y-1.5">
                {connectedUsers.length > 0 ? connectedUsers.map((user) => (
                  <div key={user.id} className={`flex items-center space-x-2 p-1.5 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">{getUserInitial(user)}</div>
                    <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{getUserDisplayName(user)}</p>
                  </div>
                )) : <p className={`text-center text-xs py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>You're the only one here.</p>}
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <button onClick={() => toggleSection('actions')} className={`w-full flex items-center justify-between p-3 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center space-x-2">
                <Settings size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Actions</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${activeSection === 'actions' ? '' : '-rotate-90'} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
            {activeSection === 'actions' && (
              <div className="px-3 pb-3 mt-1 space-y-1.5">
                <button onClick={handleShare} className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-900/40 hover:bg-blue-900/60' : 'bg-blue-50 hover:bg-blue-100'}`}>
                  <Share2 size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Share Canvas</span>
                </button>
                <button onClick={handleDelete} className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-red-900/40 hover:bg-red-900/60' : 'bg-red-50 hover:bg-red-100'}`}>
                  <Trash2 size={16} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Delete Canvas</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <button onClick={() => navigate('/')} className={`w-full px-3 py-1.5 rounded-md transition-colors text-sm ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
            Dashboard
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-md mx-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Share Canvas</h3>
            {error && <div className={`p-3 rounded-md mb-4 text-sm ${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'}`}>{error}</div>}
            {success && <div className={`p-3 rounded-md mb-4 text-sm ${isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>{success}</div>}
            <form onSubmit={handleShareSubmit}>
              <div className="mb-4">
                <label htmlFor="shareEmail" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Share with email:</label>
                <input
                  type="email"
                  id="shareEmail"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="user@example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={closeShareModal} className={`px-4 py-2 rounded-md transition ${isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Cancel</button>
                <button type="submit" disabled={shareLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50">
                  {shareLoading ? "Sharing..." : "Share"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RightSidebar;