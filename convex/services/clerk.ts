import { Doc } from "../_generated/dataModel";
import { INITIAL_USERS_PASSWORD } from "../utils/constants";

export async function createClerkUser(
  user: Omit<
    Doc<"users">,
    "_id" | "_creationTime" | "accountId" | "clerkUserId"
  >
) {
  const response = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
    },
    body: JSON.stringify({
      first_name: user.name.split(" ")[0],
      last_name: user.name.split(" ")[1],
      email_address: [user.email],
      password: INITIAL_USERS_PASSWORD,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }
  const clerkUser = await response.json();

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

  return clerkUser.id;
}

export async function createSignInToken(userId: string) {
  const response = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
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
  return signInToken.token;
}
