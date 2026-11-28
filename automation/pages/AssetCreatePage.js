class AssetCreatePage {
  constructor(page) {
    this.page = page;
  }

  async goto(baseURL) {
    return this.page.goto(`${baseURL}/hardware/create`);
  }
}

module.exports = { AssetCreatePage };
