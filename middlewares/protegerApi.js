const protegerApi = (req, res, next) => {
  const auth = req.headers.authorization

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No autorizado' })
  }

  next()
}

export default protegerApi
