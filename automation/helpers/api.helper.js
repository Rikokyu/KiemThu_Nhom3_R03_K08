const { request } = require('@playwright/test');

async function createAPIContext(baseURL, token, extraHeaders = {}) {
  const headers = { Accept: 'application/json', ...extraHeaders };
  if (token) headers.Authorization = `Bearer ${token}`;
  return request.newContext({ baseURL, extraHTTPHeaders: headers, timeout: 15_000 });
}

async function jsonResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

function apiErrorMessage(body) {
  for (const value of [body && body.message, body && body.error, body && body.messages]) {
    if (typeof value === 'string') return value;
  }
  return '';
}

module.exports = { apiErrorMessage, createAPIContext, jsonResponse };
