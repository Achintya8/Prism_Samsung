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
  const email = session.user.email;

  // better-auth's MongoDB adapter stores user._id as an ObjectId; bail early
  // rather than passing an arbitrary string into a query and tripping a BSON error.
  if (!ObjectId.isValid(userId)) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }
  const userObjectId = new ObjectId(userId);

  try {
    // Auth-side collections store userId as the string form of the ObjectId.
    await Promise.all([
      db.collection("session").deleteMany({ userId }),
      db.collection("account").deleteMany({ userId }),
      email
        ? db.collection("verification").deleteMany({ identifier: email })
        : Promise.resolve(),
    ]);

    // App-owned data uses mongoose; some schemas store userId as ObjectId, others as string.
    await connectToDB();
    await Promise.all([
      Activity.deleteMany({ userId: userObjectId }),
      Subject.deleteMany({ userId: userObjectId }),
      DailyActivityLog.deleteMany({ userId }),
      Connection.deleteMany({ userId }),
    ]);

    // Delete the user record last so cleanup queries above can still resolve owners.
    await db.collection("user").deleteOne({ _id: userObjectId });

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
