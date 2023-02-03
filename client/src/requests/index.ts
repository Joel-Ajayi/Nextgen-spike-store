import axios from "axios";

export const apiInstance = axios.create({
  url: "/api",
  method: "POST",
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
});

export const uploadsInstance = axios.create({
  url: "/uploads",
  method: "POST",
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
});
