import axios from "axios";

export const axiosInstance = axios.create({
  withCredentials: true,
  method: "POST",
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
});
