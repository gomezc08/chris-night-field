import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { CONTENT_TAGS } from "@/sanity/queries";

type WebhookPayload = { _type?: string };

/**
 * Sanity webhook target. Cache tags are document type names, so a publish of
 * any `project` expires everything tagged "project" (including /press).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new Response("Missing SANITY_REVALIDATE_SECRET", { status: 500 });
  }

  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(req, secret);

    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }
    if (!body?._type || !CONTENT_TAGS.includes(body._type)) {
      return new Response("Unknown or missing _type", { status: 400 });
    }

    // Expire immediately (not stale-while-revalidate) so the next visitor sees the edit.
    revalidateTag(body._type, { expire: 0 });

    return NextResponse.json({ revalidated: body._type, now: Date.now() });
  } catch (err) {
    console.error(err);
    return new Response("Error parsing webhook", { status: 500 });
  }
}
