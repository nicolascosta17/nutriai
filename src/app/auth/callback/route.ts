import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const emailChange = type === "email_change" || searchParams.get("flow") === "email_change";

  try {
    const supabase = await createClient();

    const verification = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && (type === "email" || type === "email_change")
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : null;

    if (verification) {
      const { error } = verification;

      if (!error) {
        if (emailChange) {
          return NextResponse.redirect(new URL("/dashboard/account?confirmation=received", origin));
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("daily_calorie_target")
            .eq("id", user.id)
            .maybeSingle();

          const path = profile?.daily_calorie_target ? "/dashboard" : "/onboarding";
          return NextResponse.redirect(new URL(path, origin));
        }
      }
    }
  } catch {
    // Return only a generic status so authentication details stay out of the URL.
  }

  const failurePath = emailChange ? "/dashboard/account?confirmation=failed" : "/login?auth=failed";
  return NextResponse.redirect(new URL(failurePath, origin));
}
