const environment = require('../config/environment');

async function requestWithSession(page, method, route, data) {
  const url = new URL(route, environment.baseURL);
  if (url.origin !== new URL(environment.baseURL).origin) {
    throw new Error('Refusing Snipe-IT request outside the configured base URL.');
  }
  const csrfToken = await page.locator('meta[name="csrf-token"]').getAttribute('content');
  if (!csrfToken) {
    throw new Error('Authenticated Snipe-IT page has no CSRF token.');
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await page.evaluate(async ({ requestUrl, requestMethod, requestBody, csrf }) => {
      const headers = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrf,
      };
      const options = { method: requestMethod, credentials: 'same-origin', headers };
      if (requestBody !== undefined) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(requestBody);
      }
      const response = await fetch(requestUrl, options);
      const text = await response.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch { body = null; }
      return {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type') || '',
        retryAfter: response.headers.get('retry-after'),
        body,
      };
    }, {
      requestUrl: url.href,
      requestMethod: method,
      requestBody: data,
      csrf: csrfToken,
    });
    if (result.status !== 429) return result;
    if (attempt === 1) {
      throw new Error(`Snipe-IT rate-limited ${method} ${url.pathname} after bounded retries (HTTP 429).`);
    }
    const retrySeconds = Number(result.retryAfter);
    const delay = Number.isFinite(retrySeconds) && retrySeconds > 0
      ? Math.min(retrySeconds, 120)
      : Math.min(2 ** attempt, 10);
    await page.waitForTimeout(delay * 1000);
  }
  throw new Error(`Snipe-IT rate-limited ${method} ${url.pathname}.`);
}

async function listAllRows(page, route, query = {}) {
  const limit = 500;
  let offset = 0;
  let expectedTotal = null;
  const rows = [];
  const seenIds = new Set();
  for (let pageNumber = 0; pageNumber < 1000; pageNumber += 1) {
    const url = new URL(route, environment.baseURL);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('sort', 'id');
    url.searchParams.set('order', 'asc');
    const result = await requestWithSession(page, 'GET', `${url.pathname}${url.search}`);
    if (result.status !== 200 || !result.body || !Array.isArray(result.body.rows)) {
      throw new Error(`Could not read ${route} inventory (HTTP ${result.status}).`);
    }
    if (!Number.isInteger(result.body.total)) {
      throw new Error(`Snipe-IT returned no total count for ${route}.`);
    }
    if (expectedTotal === null) expectedTotal = result.body.total;
    if (result.body.total !== expectedTotal) {
      throw new Error(`Inventory total changed while reading ${route}; aborting snapshot.`);
    }
    for (const row of result.body.rows) {
      const id = String(row.id);
      if (!id || id === 'undefined' || seenIds.has(id)) {
        throw new Error(`Invalid or duplicate ID while reading ${route}.`);
      }
      seenIds.add(id);
      rows.push(row);
    }
    if (rows.length >= expectedTotal) break;
    if (!result.body.rows.length) {
      throw new Error(`Pagination ended early while reading ${route}.`);
    }
    offset += result.body.rows.length;
  }
  if (rows.length !== expectedTotal) {
    throw new Error(`Incomplete paginated inventory for ${route}: expected ${expectedTotal}, got ${rows.length}.`);
  }
  return rows;
}

function selectAssetFixture(models, statusLabels, categories) {
  const assetCategoryIds = new Set(categories
    .filter((category) => String(category.category_type).toLowerCase() === 'asset')
    .map((category) => String(category.id)));
  const model = models.find((candidate) =>
    candidate.deleted_at == null && candidate.category &&
    assetCategoryIds.has(String(candidate.category.id))
  );
  const statusLabel = statusLabels.find((candidate) =>
    candidate.deleted_at == null &&
    String(candidate.type).toLowerCase() === 'deployable'
  );
  if (!model || !statusLabel) {
    const error = new Error('No active Asset-category Model or deployable Status Label exists in the live API inventory.');
    error.code = 'FIXTURE_BLOCKED';
    throw error;
  }
  return { model, statusLabel };
}

async function discoverAssetFixture(page) {
  const [models, statusLabels, categories] = await Promise.all([
    listAllRows(page, '/api/v1/models'),
    listAllRows(page, '/api/v1/statuslabels'),
    listAllRows(page, '/api/v1/categories'),
  ]);
  return selectAssetFixture(models, statusLabels, categories);
}

function unwrapPayload(body) {
  if (!body) return null;
  return body.payload || body.data || body;
}

module.exports = {
  discoverAssetFixture,
  listAllRows,
  requestWithSession,
  selectAssetFixture,
  unwrapPayload,
};
