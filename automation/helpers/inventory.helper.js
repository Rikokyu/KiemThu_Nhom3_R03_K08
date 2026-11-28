const crypto = require('crypto');
const { listAllRows } = require('./snipe-client');

const inventoryRoutes = {
  models: '/api/v1/models',
  statusLabels: '/api/v1/statuslabels',
  categories: '/api/v1/categories',
  companies: '/api/v1/companies',
  locations: '/api/v1/locations',
  users: '/api/v1/users',
  groups: '/api/v1/groups',
  assets: '/api/v1/hardware',
};

function fingerprint(rows) {
  const values = rows.map((row) =>
    `${row.id}:${String(row.username || row.asset_tag || row.name || row.id)}`
  ).sort();
  return crypto.createHash('sha256').update(values.join('\n')).digest('hex');
}

async function snapshotInventory(page) {
  const snapshot = {};
  const rowsByType = {};
  for (const [name, route] of Object.entries(inventoryRoutes)) {
    const rows = await listAllRows(page, route);
    rowsByType[name] = rows;
    snapshot[name] = { count: rows.length, fingerprint: fingerprint(rows) };
  }
  return { snapshot, rowsByType };
}

function compareInventorySnapshots(before, after) {
  return Object.keys(before || {}).filter((key) =>
    !after || !before[key] || !after[key] ||
    before[key].count !== after[key].count ||
    before[key].fingerprint !== after[key].fingerprint
  );
}

module.exports = {
  compareInventorySnapshots,
  fingerprint,
  inventoryRoutes,
  snapshotInventory,
};
