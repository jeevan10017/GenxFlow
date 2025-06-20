const BackendURL = process.env.REACT_APP_BACKEND_URL
const API_BASE_URL = `${BackendURL}/api/canvas`; 

export const updateCanvas =  async (canvasId, elements) => {
    try{
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('User not authenticated');
        }
        const response = await fetch(`${API_BASE_URL}/${canvasId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ elements }),
        });

       const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update canvas');
        }
        return data;
    }
    catch (error) {
        console.error('Error updating canvas:');
        throw error;
    }
}