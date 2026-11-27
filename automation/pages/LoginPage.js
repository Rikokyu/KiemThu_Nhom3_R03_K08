class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async goto(baseURL) {
    await this.page.goto(`${baseURL}/login`);
  }

  async login(username, password) {
    await this.page.locator('input[name="username"], input#username').first().fill(username);
    await this.page.locator('input[name="password"], input#password').first().fill(password);
    await this.page.locator('button[type="submit"]').first().click();
  }
}

module.exports = { LoginPage };
