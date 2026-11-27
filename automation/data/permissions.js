module.exports = {
  assetWriter: {
    'assets.view': 1,
    'assets.create': 1,
    'assets.edit': 1,
    'assets.delete': 1,
    'self.api': 1,
  },
  assetViewDenied: {
    'assets.view': -1,
    'self.api': 1,
  },
  assetEditDenied: {
    'assets.view': 1,
    'assets.edit': -1,
    'self.api': 1,
  },
  assetDeleteDenied: {
    'assets.view': 1,
    'assets.delete': -1,
    'self.api': 1,
  },
  apiCreateDenied: {
    'assets.view': 1,
    'assets.create': -1,
    'self.api': 1,
  },
  groupViewOverrideDenied: {
    'assets.view': -1,
    'self.api': 1,
  },
};
