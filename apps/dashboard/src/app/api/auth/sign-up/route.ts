import { AuthController } from '@workspace/auth/server';
import { NextRequest } from 'next/server';

const authController = new AuthController();

export async function POST(req: NextRequest) {
  return authController.signUp(req);
}
