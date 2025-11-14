// lib/dbConnect.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error('Please define MONGODB_URI in .env.local');

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  var mongooseCache: Cached | undefined;
}

let cached = global.mongooseCache;
if (!cached) global.mongooseCache = { conn: null, promise: null };
cached = global.mongooseCache!;

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false, autoIndex: false } as mongoose.ConnectOptions;
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
