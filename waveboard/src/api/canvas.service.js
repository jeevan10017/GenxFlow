import apiClient from './apiClient';

const API_URL = '/api/canvas';

const getAllCanvases = () => {
  return apiClient.get(`${API_URL}/profile`);
};

const createCanvas = (name) => {
  return apiClient.post(`${API_URL}/create`, { name });
};

const loadCanvas = (canvasId) => {
  return apiClient.get(`${API_URL}/${canvasId}`);
};

const updateCanvas = (canvasId, elements) => {
  return apiClient.put(`${API_URL}/${canvasId}`, { elements });
};

const deleteCanvas = (canvasId) => {
  return apiClient.delete(`${API_URL}/${canvasId}`);
};

const shareCanvas = (canvasId, sharedEmail) => {
  return apiClient.put(`${API_URL}/share/${canvasId}`, { sharedEmail });
};

const canvasService = {
  getAllCanvases,
  createCanvas,
  loadCanvas,
  updateCanvas,
  deleteCanvas,
  shareCanvas,
};

export default canvasService;