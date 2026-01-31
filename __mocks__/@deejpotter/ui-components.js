// Manual mock for @deejpotter/ui-components used in tests
exports.AuthButton = function AuthButton() {
  return null;
};

exports.useAuth = function useAuth() {
  return { user: { publicMetadata: {} } };
};
