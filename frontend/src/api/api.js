const API_BASE_URL = "http://localhost:4001/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "API request failed");
  }

  return result;
}

export const investorsAPI = {
  getAll: () => request("/investors"),
  getById: (id) => request(`/investors/${id}`),
  create: (data) =>
    request("/investors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/investors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/investors/${id}`, {
      method: "DELETE",
    }),
};

export const portfoliosAPI = {
  getAll: () => request("/portfolios"),
  getById: (id) => request(`/portfolios/${id}`),
  create: (data) =>
    request("/portfolios", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/portfolios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/portfolios/${id}`, {
      method: "DELETE",
    }),
};

export const stocksAPI = {
  getAll: () => request("/stocks"),
  getById: (id) => request(`/stocks/${id}`),
  create: (data) =>
    request("/stocks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/stocks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/stocks/${id}`, {
      method: "DELETE",
    }),
};

export const transactionsAPI = {
  getAll: () => request("/transactions"),
  getById: (id) => request(`/transactions/${id}`),
  create: (data) =>
    request("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/transactions/${id}`, {
      method: "DELETE",
    }),
};
