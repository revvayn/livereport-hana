import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // penting untuk session cookie
});

export const syncData = async () => {
  const res = await API.get("/data/sync");
  return res.data;
};

export default API;
