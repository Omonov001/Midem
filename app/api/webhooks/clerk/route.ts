import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("❌ .env.local faylida WEBHOOK_SECRET kiritilmagan!");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Svix header'lari topilmadi", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhookni tekshirishda xatolik:", err);
    return new Response("Xatolik yuz berdi", { status: 400 });
  }

  const eventType = evt.type;

  await connectToDatabase();

  // 1. Yangi user yaratilganda (user.created)
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } =
      evt.data;

    const mongoUser = await User.create({
      clerkId: id,
      name: `${first_name || ""} ${last_name || ""}`.trim() || "Foydalanuvchi",
      username: username || undefined,
      email: email_addresses[0]?.email_address,
      picture: image_url,
      role: "user",
    });

    return NextResponse.json({ message: "OK", user: mongoUser });
  }

  // 2. User ma'lumotlari yangilanganda (user.updated)
  if (eventType === "user.updated") {
    const { id, email_addresses, image_url, first_name, last_name, username } =
      evt.data;

    const mongoUser = await User.findOneAndUpdate(
      { clerkId: id },
      {
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        username: username || undefined,
        email: email_addresses[0]?.email_address,
        picture: image_url,
      },
      { new: true },
    );

    return NextResponse.json({ message: "OK", user: mongoUser });
  }

  // 3. User o'chirilganda (user.deleted)
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    await User.findOneAndDelete({ clerkId: id });

    return NextResponse.json({ message: "User o'chirildi" });
  }

  return new Response("", { status: 200 });
}
