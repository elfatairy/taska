import { Doc } from "@convex/_generated/dataModel";
import { Result } from "@convex/utils/types";
import { createClerkClient } from "@clerk/backend";
import { tryCatch } from "@/lib/try-catch";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
const clerkApiUrl = "https://api.clerk.com/v1";

export async function deleteClerkUser(clerkUserId: string): Result<void> {
  await fetch(`${clerkApiUrl}/users/${clerkUserId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
    },
  });

  return { data: undefined, error: null };
}

export async function createClerkUser(
  user: Pick<Doc<"users">, "name" | "email" | "role"> & {
    imageUrl?: string;
    password?: string;
  }
): Result<{ id: string; imageUrl: string }, "UNEXPECTED_ERROR"> {
  const { data: clerkUser, error } = await tryCatch(
    clerkClient.users.createUser({
      firstName: user.name.split(" ")[0],
      lastName: user.name.split(" ")[1],
      emailAddress: [user.email],
      password: user.password,
      publicMetadata: {
        role: user.role,
      },
    })
  );
  if (error) {
    return { data: null, error: "UNEXPECTED_ERROR" };
  }

  let imageUrl = clerkUser.imageUrl;

  if (user.imageUrl) {
    const imageResponse = await fetch(user.imageUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch avatar image: ${imageResponse.statusText}`
      );
    }

    const imageBlob = await imageResponse.blob();
    const { data, error: uploadError } = await tryCatch(
      clerkClient.users.updateUserProfileImage(clerkUser.id, {
        file: imageBlob,
      })
    );
    if (uploadError) {
      return { data: null, error: "UNEXPECTED_ERROR" };
    }
    imageUrl = data.imageUrl;
  }

  return {
    data: {
      id: clerkUser.id,
      imageUrl: imageUrl,
    },
    error: null,
  };
}

export async function createSignInToken(userId: string): Result<string> {
  const response = await fetch(`${clerkApiUrl}/sign_in_tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
    },
    body: JSON.stringify({
      user_id: userId,
      expires_in_seconds: 2592000,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create sign in token: ${response.statusText}`);
  }
  const signInToken = await response.json();
  return { data: signInToken.token, error: null };
}

export async function verifyUserPassword(
  userId: string,
  password: string
): Result<boolean> {
  const response = await fetch(
    `${clerkApiUrl}/users/${userId}/verify_password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
      },
      body: JSON.stringify({ password }),
    }
  );
  if (!response.ok) {
    return { data: false, error: null };
  }
  const verifiedPassword = await response.json();
  return { data: verifiedPassword.verified, error: null };
}
