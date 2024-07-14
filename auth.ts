import NextAuth, { User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { Token } from "./d";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // debug: true,
  session: { strategy: "jwt", updateAge: 60 * 30 },
  providers: [GitHub, Google],
  callbacks: {
    async signIn({ user }) {
      try {
        const res = await fetch("http://localhost:8080/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            image: user.image,
          }),
        });

        if (!res.ok) return false;

        const parsedRes = await res.json();
        user.id = parsedRes.id;
        user.name = parsedRes.name;
        user.email = parsedRes.email;
        user.image = parsedRes.image;

        return true;
      } catch (err) {
        return false;
      }
    },
    async jwt({ token, account, user }) {
      if (account) {
        try {
          const response = await fetch(
            "http://localhost:8080/api/v1/auth/login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: user.id }),
            }
          );

          const { accessToken, refreshToken } = await response.json();

          const jwt: JWT = {
            name: user.name,
            email: user.email,
            picture: user.image,
            accessToken: accessToken,
            refreshToken: refreshToken,
          };

          return jwt;
        } catch (error) {
          console.log(error);
          return null;
        }
      }

      if (Date.now() / 1000 >= token.accessToken.expiresAt) {
        try {
          const response = await fetch(
            "http://localhost:8080/api/v1/auth/token",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: token.refreshToken }),
            }
          );

          if (!response.ok) {
            console.log("error refreshing");
            throw Error("RefreshAccessTokenError");
          }

          const newToken: Token = await response.json();
          token.accessToken = newToken;
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === "RefreshAccessTokenError")
              token.error = "RefreshAccessTokenError";
          }
        }
      }
      return token;
    },

    async session({ token, session }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  logger: {
    error(code, ...message) {
      console.log(message);
    },
  },
  // pages: {
  //   signIn: "/login",
  // },
});

declare module "next-auth" {
  interface Session {
    accessToken: Token | null;
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: Token;
    refreshToken: Token;
    error?: "RefreshAccessTokenError";
  }
}
