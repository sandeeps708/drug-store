import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

export const fetchConfig = () =>
  axios.get(`${API_BASE}/config`).then((res) => res.data);

export const fetchDrugs = (company) => {
  const url = company
    ? `${API_BASE}/drugs?company=${encodeURIComponent(company)}`
    : `${API_BASE}/drugs`;
  return axios.get(url).then((res) => res.data);
};

export const fetchCompanies = () =>
  axios.get(`${API_BASE}/drugs/companies`).then((res) => res.data);
