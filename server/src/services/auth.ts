import jwt from 'jsonwebtoken';

export interface JwtPayload {
  _id: any;
  username: string;
  email: string;
}

const secret = process.env.JWT_SECRET_KEY!;
const expiration = '2h';

// Used by Apollo context
export function authenticateToken({ req }: { req: any }) {
  let token = req.body?.token || req.query?.token || req.headers?.authorization;

  if (req.headers?.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) return req;

  try {
    const { data } = jwt.verify(token, secret) as { data: JwtPayload };
    req.user = data;
  } catch {
    console.log('Invalid token');
  }

  return req;
}

// Function overloads for GraphQL and old REST controllers
export function signToken(user: JwtPayload): string;
export function signToken(username: string, email: string, _id: any): string;
export function signToken(
  arg1: JwtPayload | string,
  arg2?: string,
  arg3?: any
): string {
  let payload: JwtPayload;

  if (typeof arg1 === 'object') {
    payload = arg1;
  } else {
    payload = {
      username: arg1,
      email: arg2!,
      _id: arg3,
    };
  }

  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
}