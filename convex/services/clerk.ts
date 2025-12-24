import { Doc } from "@convex/_generated/dataModel";
import { Result } from "@convex/utils/types";

const clerkApiUrl = "https://api.clerk.com/v1";

export async function deleteClerkUser(clerkUserId: string) : Result<void> {
  await fetch(`${clerkApiUrl}/users/${clerkUserId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
    },
  });

  return { data: undefined, error: null };
}

export async function createClerkUser(
  user: Pick<
    Doc<"users">,
    "name" | "email" | "role"
  > & {
    avatarUrl?: string;
    password?: string;
  }
) : Result<{ id: string; avatarUrl: string }> {
  const response = await fetch(`${clerkApiUrl}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
    },
    body: JSON.stringify({
      first_name: user.name.split(" ")[0],
      last_name: user.name.split(" ")[1],
      email_address: [user.email],
      password: user.password,
      public_metadata: {
        role: user.role,
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }
  const clerkUser = await response.json();

  if (user.avatarUrl) {
    const imageResponse = await fetch(user.avatarUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch avatar image: ${imageResponse.statusText}`
      );
    }

    const imageBlob = await imageResponse.blob();
    const formData = new FormData();
    formData.append("file", imageBlob);

    const uploadResponse = await fetch(
      `https://api.clerk.com/v1/users/${clerkUser.id}/profile_image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
        },
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(
        `Failed to upload profile image: ${uploadResponse.statusText}`
      );
    }
  }

  return { data: {
    id: clerkUser.id,
    avatarUrl: clerkUser.image_url,
  }, error: null };
}

export async function createSignInToken(userId: string) : Result<string> {
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

export async function verifyUserPassword(userId: string, password: string) : Result<boolean> {
  const response = await fetch(`${clerkApiUrl}/users/${userId}/verify_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
    },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    return { data: false, error: null };
  }
  const verifiedPassword = await response.json();
  return { data: verifiedPassword.verified, error: null };
}