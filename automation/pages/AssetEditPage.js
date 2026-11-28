class AssetEditPage {
  constructor(page) {
    this.page = page;
  }

  async goto(baseURL, assetId) {
    return this.page.goto(`${baseURL}/hardware/${assetId}/edit`);
  }
}

module.exports = { AssetEditPage };
