import { NextRequest } from 'next/server';
import { AuthController } from '@workspace/auth/infrastructure/gateways/AuthController';

const authController = new AuthController();

export async function POST(req: NextRequest) {
  return authController.signIn(req);
}
