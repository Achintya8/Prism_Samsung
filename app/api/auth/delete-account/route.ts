import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import connectToDB from "@/lib/mongodb";
import { Activity } from "@/lib/models/Activity";
import { DailyActivityLog } from "@/lib/models/DailyActivityLog";
import { Subject } from "@/lib/models/Subject";
import Connection from "@/lib/models/Connection";

// better-auth doesn't expose deleteUser over HTTP by default, so this route
// authenticates the caller and removes their auth records and owned data.
export async function POST() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;

  try {
    // Better-auth records live in MongoDB collections keyed by string userId.
    await Promise.all([
      db.collection("session").deleteMany({ userId }),
      db.collection("account").deleteMany({ userId }),
      db.collection("verification").deleteMany({ identifier: session.user.email }),
    ]);

    // App-owned data uses mongoose; some schemas store userId as ObjectId, others as string.
    await connectToDB();
    await Promise.all([
      userObjectId ? Activity.deleteMany({ userId: userObjectId }) : Promise.resolve(),
      userObjectId ? Subject.deleteMany({ userId: userObjectId }) : Promise.resolve(),
      DailyActivityLog.deleteMany({ userId }),
      Connection.deleteMany({ userId }),
    ]);

    // Delete the user record last so cleanup queries above can still resolve owners.
    await db.collection("user").deleteOne(
      userObjectId ? { _id: userObjectId } : { _id: userId as unknown as ObjectId },
    );

    const response = NextResponse.json({ ok: true });
    // Clear better-auth session cookies so the client is signed out immediately.
    response.cookies.delete("better-auth.session_token");
    response.cookies.delete("__Secure-better-auth.session_token");
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete account";
    return NextResponse.json({ message }, { status: 500 });
  }
}
