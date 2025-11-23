import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // adjust if needed
});

// ✅ On app start, immediately set token if it exists
const storedToken = localStorage.getItem("token");
if (storedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

// ✅ Utility for login/logout updates
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token); // ensure stored too
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

export default api;
