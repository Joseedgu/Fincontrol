const mapUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    email: user.email,
    avatarUrl: user.avatar_url,
    role: user.role,
    isActive: user.is_active,
    preferences: {
      currency: user.currency || "DOP",
      language: user.language || "es",
      theme: user.theme || "light"
    },
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
};

module.exports = {
  mapUser
};