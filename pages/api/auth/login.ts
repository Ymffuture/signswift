import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { setTokenCookie } from '../../../lib/auth' // ✅ now works
import { dbConnect } from '../../../lib/dbConnect'
import User, { IUser } from '../../../models/User'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body
  await dbConnect()

  const user = await User.findOne({ email }).lean<Partial<IUser>>()
  if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' })

  const isMatch = await bcrypt.compare(password, user.passwordHash)
  if (!isMatch) return res.status(401).json({ ok: false, message: 'Invalid credentials' })

  const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  setTokenCookie(res, token)

  return res.status(200).json({ ok: true, user })
}
