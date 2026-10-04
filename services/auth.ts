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
