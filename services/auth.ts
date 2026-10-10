import { supabase } from "@/utils/supabase";

type AuthResult =
  | { ok: true; user: any; session: any | null }
  | { ok: false; message: string };

export async function createUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { name: name.trim() },
    },
  });

  if (error) return { ok: false, message: error.message };
  if (!data.user)
    return { ok: false, message: "Não foi possível criar o usuário." };

  return { ok: true, user: data.user, session: data.session };
}

export async function signInUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) return { ok: false, message: error.message };

  return { ok: true, user: data.user, session: data.session };
}

export async function signOutUser(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const { error } = await supabase.auth.signOut();

  if (error) return { ok: false, message: error.message };

  return { ok: true };
}

export async function getCompleteUserInfo() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Erro no Auth:", authError?.message);
      return null;
    }

    const { data: profile, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (dbError) {
      console.warn(
        "Aviso: Usuário autenticado mas sem perfil no banco:",
        dbError.message,
      );
    }

    const completeUser = {
      id: user.id,
      email: user.email,
      lastSignIn: user.last_sign_in_at,

      name: profile?.name || "Usuário",
      avatarUrl: profile?.avatar_url || "",
    };

    return completeUser;
  } catch (err) {
    console.error("Erro inesperado ao buscar dados completos:", err);
    return null;
  }
}
