import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAds, addAd, updateAd, deleteAd } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";

// GET /api/ads - Get all ads (public - returns only active for display, all for admin)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const adminMode = searchParams.get("admin") === "true";

  if (adminMode) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const ads = await getAds();
  const result = adminMode ? ads : ads.filter((a) => a.isActive);
  return NextResponse.json(result);
}

// POST /api/ads - Create new ad
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, embedCode, imageUrl, linkUrl, position } = body;

    // Must have: name + position + (embedCode OR imageUrl+linkUrl)
    if (!name || !position) {
      return NextResponse.json(
        { error: "Missing required fields: name, position" },
        { status: 400 }
      );
    }
    if (!embedCode && (!imageUrl || !linkUrl)) {
      return NextResponse.json(
        { error: "Provide either embedCode or both imageUrl and linkUrl" },
        { status: 400 }
      );
    }

    const newAd = {
      id: uuidv4(),
      name,
      ...(embedCode ? { embedCode } : { imageUrl, linkUrl }),
      position,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await addAd(newAd);
    return NextResponse.json(newAd, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/ads - Update an ad
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const ok = await updateAd(id, updates);
    if (!ok) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/ads - Delete an ad
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const ok = await deleteAd(id);
    if (!ok) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
