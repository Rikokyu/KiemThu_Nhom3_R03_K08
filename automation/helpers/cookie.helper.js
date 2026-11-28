function findSessionCookie(cookies) {
  return cookies.find((cookie) =>
    /session/i.test(cookie.name) || cookie.name === 'snipeitv6_session'
  );
}

module.exports = { findSessionCookie };
