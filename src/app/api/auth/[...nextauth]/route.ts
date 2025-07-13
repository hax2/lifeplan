// File: app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/lib/auth"; // This imports from the auth.ts file in your root
export const { GET, POST } = handlers;