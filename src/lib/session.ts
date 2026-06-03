import { auth } from "./auth";

/** Returns the signed-in user's id, or throws (callers run inside protected routes). */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
}
