import { handlers } from "@workspace/auth/server";

// ✅ Abordagem robusta sem conflitos de tipo
export const GET = async (request: any, context: any) => {
  return handlers.GET(request);
};

export const POST = async (request: any, context: any) => {
  return handlers.POST(request);
};

// ✅ RUNTIME CONFIG: Compatível para nodejs
export const runtime = 'nodejs';
