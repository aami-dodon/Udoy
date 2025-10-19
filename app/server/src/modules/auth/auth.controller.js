export function loginPlaceholder(req, res) {
  return res.json({
    status: 'success',
    message: 'Login endpoint placeholder',
  });
}

export function refreshPlaceholder(req, res) {
  return res.json({
    status: 'success',
    message: 'Refresh endpoint placeholder',
    user: req.user || null,
  });
}
