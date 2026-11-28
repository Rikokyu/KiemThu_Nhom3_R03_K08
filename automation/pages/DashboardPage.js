class DashboardPage {
  constructor(page) {
    this.page = page;
  }

  async goto(baseURL) {
    await this.page.goto(`${baseURL}/`);
  }
}

module.exports = { DashboardPage };
