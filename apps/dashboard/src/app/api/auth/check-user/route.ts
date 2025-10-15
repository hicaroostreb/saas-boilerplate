import { AuthController } from '@workspace/auth/server';
import { NextRequest } from 'next/server';

const authController = new AuthController();

export async function GET(req: NextRequest) {
  return authController.checkUser(req);
}
