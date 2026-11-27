const { jsonResponse } = require('./api.helper');

function assetPayload(body) {
  return body && (body.payload || body.data || body.asset || body);
}

function assetIdFrom(body) {
  const payload = assetPayload(body);
  return payload && (payload.id || (payload.asset && payload.asset.id));
}

async function getAsset(request, id) {
  const response = await request.get(`/api/v1/hardware/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return { response, body: await jsonResponse(response) };
}

function isMissingAssetResponse(status, body) {
  const errorResponse = body && body.status === 'error' &&
    Object.prototype.hasOwnProperty.call(body, 'payload') && body.payload === null;
  return (status === 404 && body && body.status === 'error') ||
    (status === 200 && errorResponse);
}

async function findNonexistentAssetId(request) {
  const seed = BigInt(Date.now()) * 1000n;
  for (let offset = 0n; offset < 5n; offset += 1n) {
    const candidate = (seed + offset).toString();
    const { response, body } = await getAsset(request, candidate);
    if (response.status() === 401 || response.status() === 403) {
      throw new Error('API token is not authorized to verify a nonexistent Asset ID.');
    }
    if (isMissingAssetResponse(response.status(), body)) {
      return candidate;
    }
  }
  throw new Error('Could not verify an unused Asset ID through the API; refusing to run the not-found test.');
}

module.exports = {
  assetIdFrom,
  assetPayload,
  findNonexistentAssetId,
  getAsset,
  isMissingAssetResponse,
};
