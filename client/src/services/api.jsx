const BASE_URL = "http://localhost:5000/api";

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getQuestion = async (role, token) => {
  const res = await fetch(`${BASE_URL}/question?role=${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const submitAnswer = async (data, token) => {
  const res = await fetch(`${BASE_URL}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getHistory = async (token) => {
  const res = await fetch(`${BASE_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};