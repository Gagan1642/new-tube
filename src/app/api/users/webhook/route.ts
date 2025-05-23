import { Webhook } from "svix";
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add CLERK_SIGNING_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Create new Svix instance with the signing secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get hesders 
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, return 400
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent | null = null;

  // Verify payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error: Could not verify Webhook", err);
    return new Response("Validation Error", { status: 400 });
  }

  // Do something with payload
  // For this guide load payload to console
  
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { data } = evt;
    await db.insert(users).values({
      clerkId: data.id,
      name: `${data.first_name} ${data.last_name}`,
      imageUrl: data.image_url,
      createdAt: new Date(),
    });
  }

  if(eventType === "user.deleted") {
    const { data } = evt;

    if(!data.id) {
      return new Response("Error: Missing user id", { status: 400 });
    }

    await db.delete(users).where(eq(users.clerkId, data.id));
  }

  if(eventType === "user.updated") {
    const { data } = evt;
    const { first_name, last_name, image_url } = data;
    const userId = data.id;

    if(!userId) {
      return new Response("Error: Missing user id", { status: 400 });
    }
    await db.update(users).set({
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    }).where(eq(users.clerkId, data.id));
  }

  return new Response("Webhook received", { status: 200 });

}
