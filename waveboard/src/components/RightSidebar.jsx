import React, { useState } from 'react';
import axios from 'axios';
import { Users, Settings, Share2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

const RightSidebar = ({ canvas, navigate, connectedUsers = [], isConnected = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState('users');
  const [shareEmail, setShareEmail] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const handleShare = async () => {
    setShowShareModal(true);
    setError("");
    setSuccess("");
  };
  const BackendURL = process.env.REACT_APP_BACKEND_URL; 

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      setError("Email address is required");
      return;
    }

    if (!canvas?._id) {
      setError("No canvas selected for sharing");
      return;
    }

    setShareLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.put(
        `${BackendURL}/api/canvas/share/${canvas._id}`,
        { sharedEmail: shareEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (res.status === 200) {
        setSuccess(`Canvas shared successfully with ${shareEmail}!`);
        setShareEmail("");
        setTimeout(() => {
          setShowShareModal(false);
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share canvas");
    } finally {
      setShareLoading(false);
    }
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setShareEmail("");
    setError("");
    setSuccess("");
  };


  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this canvas? This action cannot be undone.')) {
      try {
        const res = await axios.delete(
         `${BackendURL}/api/canvas/${canvas._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.status === 200) {
          alert('Canvas deleted successfully!');
          navigate('/'); // Navigate back to dashboard
        } else {
          alert('Failed to delete canvas');
        }
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting canvas");
      }
    }
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  // Function to get user display name - handles different possible user object structures
  const getUserDisplayName = (user) => {
    return user.username || user.name || user.email || 'Anonymous User';
  };

  // Function to get user initial for avatar
  const getUserInitial = (user) => {
    const name = getUserDisplayName(user);
    return name.charAt(0).toUpperCase();
  };

  if (isCollapsed) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Settings size={20} className="text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Canvas Info</h3>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Canvas Details */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">{canvas?.title || canvas?.name || 'Untitled Canvas'}</h4>
            <p className="text-sm text-gray-600 mb-3">
              Created: {canvas?.createdAt ? new Date(canvas.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
            <p className="text-sm text-gray-600">
              Last modified: {canvas?.updatedAt ? new Date(canvas.updatedAt).toLocaleDateString() : 'Never'} 
            </p>
          </div>

          {/* Connected Users Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('users')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">
                  Connected Users ({connectedUsers.length})
                </span>
              </div>
              {activeSection === 'users' ? (
                <ChevronDown size={16} className="text-gray-500" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
            </button>

            {activeSection === 'users' && (
              <div className="px-4 pb-4">
                {!isConnected ? (
                  <div className="text-center py-4">
                    <div className="text-red-500 text-sm">Not connected to server</div>
                  </div>
                ) : connectedUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-gray-500 text-sm">Only you are here</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connectedUsers.map((user, index) => (
                      <div
                        key={user.id || user._id || index}
                        className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {getUserInitial(user)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">
                            {getUserDisplayName(user)}
                          </div>
                          <div className="text-xs text-gray-500">Online</div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Canvas Actions Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('actions')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Settings size={18} className="text-gray-600" />
                <span className="font-medium text-gray-800">Canvas Actions</span>
              </div>
              {activeSection === 'actions' ? (
                <ChevronDown size={16} className="text-gray-500" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
            </button>

            {activeSection === 'actions' && (
              <div className="px-4 pb-4 space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Share2 size={18} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Share Canvas</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} className="text-red-600" />
                  <span className="text-sm font-medium text-red-800">Delete Canvas</span>
                </button>
              </div>
            )}
          </div>

          {/* Connection Status */}
          <div className="p-4">
            <div className="text-xs text-gray-500 mb-2">Connection Status</div>
            <div className={`flex items-center space-x-2 text-sm ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{isConnected ? 'Real-time collaboration active' : 'Connection lost'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Share Canvas</h3>
            
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-500 p-3 rounded-md mb-4 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleShareSubmit}>
              <div className="mb-4">
                <label htmlFor="shareEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter email address to share with:
                </label>
                <input
                  type="email"
                  id="shareEmail"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeShareModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shareLoading}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition ${
                    shareLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
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