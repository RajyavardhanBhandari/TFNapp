import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type JsonResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

function jsonResponse(
  body: JsonResponse,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Method not allowed",
      },
      405,
    );
  }

  const authorization = req.headers.get("Authorization");

  if (!authorization) {
    return jsonResponse(
      {
        success: false,
        error: "Missing authorization header",
      },
      401,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseServiceRoleKey
  ) {
    return jsonResponse(
      {
        success: false,
        error: "Supabase function configuration is incomplete",
      },
      500,
    );
  }

  try {
    const token = authorization.replace(/^Bearer\s+/i, "");

    const userClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse(
        {
          success: false,
          error: "The current session is invalid or expired",
        },
        401,
      );
    }

    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error(
        "SUPABASE DELETE USER ERROR:",
        deleteError,
      );

      return jsonResponse(
        {
          success: false,
          error: deleteError.message,
        },
        500,
      );
    }

    return jsonResponse({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ACCOUNT FUNCTION ERROR:",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected account deletion error",
      },
      500,
    );
  }
});