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

    // Load guest canvas data from local storage
    const getGuestCanvas = () => {
        const data = localStorage.getItem("guestCanvas");
        return data ? JSON.parse(data) : { name: "Guest Canvas", elements: [] };
    };

    const [canvas, setCanvas] = useState(getGuestCanvas());

    const handleSave = () => {
        setShowSaveModal(true);
    };

    const handleCanvasUpdate = useCallback((updateData) => {
        const currentData = { ...canvas, elements: updateData.elements };
        localStorage.setItem("guestCanvas", JSON.stringify(currentData));
        setCanvas(currentData);
    }, [canvas]);

    const closeSaveModal = () => {
        setShowSaveModal(false);
    };

    return (
        <div className="h-screen bg-gray-100 relative">
            {/* HIGHLIGHT: Container for all top-right buttons */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors"
                >
                    Login
                </button>
                <button
                    onClick={() => navigate("/register")}
                    className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-black transition-colors"
                >
                    Register
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                >
                    Save Your Work
                </button>
            </div>

            <BoardProvider
                canvasId="guest"
                initialElements={canvas.elements}
                onCanvasUpdate={handleCanvasUpdate}
            >
                <ToolboxProvider>
                    <Toolbar />
                    <Board />
                    <Toolbox />
                </ToolboxProvider>
            </BoardProvider>

            {/* The Save Modal remains unchanged */}
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
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold"
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
        </div>
    );
};

export default GuestDashboard;