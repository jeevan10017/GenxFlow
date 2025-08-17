import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";
import Toolbar from "../components/Toolbar";
import Toolbox from "../components/Toolbox";
import BoardProvider from "../store/BoardProvider";
import ToolboxProvider from "../store/toolboxProvider";

const GuestDashboard = () => {
    const navigate = useNavigate();
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);

    const getGuestCanvas = () => {
        const data = localStorage.getItem("guestCanvas");
        return data ? JSON.parse(data) : { name: "Guest Canvas", elements: [] };
    };

    const [canvas, setCanvas] = useState(getGuestCanvas());

    const handleSave = () => {
        setShowSaveModal(true);
    };

    const handleAiBrushAttempt = useCallback(() => {
        setShowAiModal(true);
    }, []);

    const handleCanvasUpdate = useCallback((updateData) => {
        const currentData = { name: "Guest Canvas", elements: updateData.elements };
        localStorage.setItem("guestCanvas", JSON.stringify(currentData));
    }, []);

    const closeSaveModal = () => {
        setShowSaveModal(false);
    };
    
    const closeAiModal = () => {
        setShowAiModal(false);
    };

    return (
        <div className={`h-screen bg-gray-100 relative font-sans ${isDarkMode ? 'dark' : ''}`}>
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
                <img 
                    src={isDarkMode ? "/logo_dark_nobg.png" : "/logo_light_nobg.png"}
                    alt="App Logo" 
                    className="h-10 w-auto drop-shadow-md"
                />

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/login")}
                        className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-black transition-colors dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                    >
                        Register
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-zinc-950 text-white font-semibold rounded-lg shadow-md hover:bg-gray-950 dark:bg-zinc-950 dark:hover:bg-gray-900"
                    >
                        Save
                    </button>
                </div>
            </div>

            <BoardProvider
                canvasId="guest"
                initialElements={canvas.elements}
                onCanvasUpdate={handleCanvasUpdate}
            >
                <ToolboxProvider 
                    isGuest={true} 
                    onAiBrushAttempt={handleAiBrushAttempt}
                    isDarkMode={isDarkMode}
                >
                    <Toolbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                    <Board isDarkMode={isDarkMode} />
                    <Toolbox isDarkMode={isDarkMode} />
                </ToolboxProvider>
            </BoardProvider>

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
                        <h2 className="text-2xl font-bold mb-4">Save Your Masterpiece!</h2>
                        <p className="mb-6 text-gray-600">
                            Create an account or log in to save your drawing and access it from anywhere.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate("/register")}
                                className="w-full py-3 bg-gray-950 text-white rounded-lg font-semibold"
                            >
                                Register
                            </button>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold"
                            >
                                Login
                            </button>
                        </div>
                        <button
                            onClick={closeSaveModal}
                            className="mt-6 text-sm text-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* AI Brush Authentication Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-xl transform transition-all duration-300 scale-100">
                        <h2 className="text-2xl font-bold mb-4">Unlock AI-Powered Tools</h2>
                        <p className="mb-6 text-gray-600">
                            Create an account or log in to use the AI brush and other smart features.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate("/register")}
                                className="w-full py-3 bg-zinc-950 text-white rounded-lg font-semibold hover:bg-gray-950 transition-colors"
                            >
                                Register
                            </button>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Login
                            </button>
                        </div>
                        <button
                            onClick={closeAiModal}
                            className="mt-6 text-sm text-gray-500 hover:text-gray-700"
                        >
                            Continue without AI
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestDashboard;