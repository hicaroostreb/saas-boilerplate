import { NextRequest } from 'next/server';
import { AuthController } from '@workspace/auth/infrastructure/gateways/AuthController';

const authController = new AuthController();

export async function GET(req: NextRequest) {
  return authController.checkUser(req);
}
