import mongoose from 'mongoose';

// Read once at module load; validation happens in dbConnect to avoid build-time crashes
const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global to maintain a single connection across hot reloads in development
declare global {
  var mongooseGlobal: GlobalMongoose | undefined;
}

let cached = global.mongooseGlobal;

if (!cached) {
  cached = global.mongooseGlobal = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    // Defer throwing until connect time so builds don't fail when envs are not injected
    throw new Error('MongoDB URI is not defined');
  }

  if (!cached) {
    cached = { conn: null, promise: null };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
