import NextAuth from "next-auth"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import GoogleProvider from "next-auth/providers/google";
import { createHash } from "crypto";
const handler = NextAuth({
  providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
  })
],
callbacks: {
  async signIn({ user }) {
    if (!user.email) return false;
    const hashEmailToPassword = (email: string) => {
      return createHash("sha256").update(email).digest("hex");
    };
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser || !existingUser.password) {
      const fakePassword = hashEmailToPassword(user.email);
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          password: fakePassword,
          provider: "Google",
        },
        create: {
          name: user.name || "Unknown",
          email: user.email,
          password: fakePassword,
          provider: "Google",
          role: "User",
        },
      });
    }
    return true;
  }
}
}
)

export { handler as GET, handler as POST }