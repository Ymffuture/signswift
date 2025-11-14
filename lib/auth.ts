import { NextApiRequest } from 'next'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import { dbConnect } from './dbConnect'
import User, { IUser } from '../models/User'

const TOKEN_NAME = 'token'

export async function getUserFromReq(req: NextApiRequest): Promise<IUser | null> {
  const cookies = cookie.parse(req.headers.cookie || '')
  const token = cookies[TOKEN_NAME]
  if (!token) return null

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string }
    await dbConnect()
    
    // **Specify the type for lean(): Partial<IUser>**
    const user = await User.findById(payload.sub).lean<Partial<IUser>>()
    
    if (!user) return null

    // Convert Partial<IUser> to IUser safely
    return user as IUser
  } catch {
    return null
  }
}
