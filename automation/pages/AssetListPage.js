class AssetListPage {
  constructor(page) {
    this.page = page;
  }

  async goto(baseURL) {
    return this.page.goto(`${baseURL}/hardware`);
  }
}

module.exports = { AssetListPage };
