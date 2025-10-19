export function getAdminOverview(req, res) {
  return res.json({
    status: 'success',
    message: 'Admin overview placeholder',
    user: req.user || null,
    permissions: {
      resource: 'admin:dashboard',
      action: 'read',
    },
  });
}
