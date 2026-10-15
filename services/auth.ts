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

type Sector = "name" | "email" | "password";

export async function editUserInfo(
  sector: Sector,
  name: string,
  email: string,
  password: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    if (sector === "name") {
      const newName = name.trim();

      if (!newName) {
        return { ok: false, message: "O nome não pode ficar vazio." };
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return { ok: false, message: "Usuário não autenticado." };
      }

      const { data, error } = await supabase
        .from("users")
        .update({ name: newName })
        .eq("id", user.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          ok: false,
          message: "Não foi possível atualizar o nome no perfil.",
        };
      }

      await supabase.auth.updateUser({ data: { name: newName } });

      return { ok: true, message: "Nome atualizado com sucesso." };
    }

    if (sector === "email") {
      const newEmail = email.trim().toLowerCase();

      if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
        return { ok: false, message: "Digite um e-mail válido." };
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      return {
        ok: true,
        message:
          "Enviamos um link de confirmação para o novo e-mail. A alteração só vale depois de confirmar.",
      };
    }

    if (sector === "password") {
      if (password.length < 6) {
        return {
          ok: false,
          message: "A senha precisa ter pelo menos 6 caracteres.",
        };
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      return { ok: true, message: "Senha atualizada com sucesso." };
    }

    return { ok: false, message: "Opção inválida." };
  } catch (error: any) {
    console.error(`Erro ao editar ${sector}:`, error);
    return {
      ok: false,
      message: error?.message ?? "Não foi possível salvar a alteração.",
    };
  }
}
