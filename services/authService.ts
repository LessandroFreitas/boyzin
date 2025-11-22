import { supabase } from "../config/supabase_config";

export async function login(email: string, senha: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        throw new Error("E-mail ou senha incorretos.");
      }
      throw error;
    }

    if (!data.session) {
      throw new Error("Erro inesperado: sessão não encontrada.");
    }

    return data.session;
  } catch (err: any) {
    console.error("Erro ao fazer login:", err.message || err);
    throw err;
  }
}

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err: any) {
    console.error("Erro ao fazer logout:", err.message || err);
    throw err;
  }
}


export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (err: any) {
    console.error("Erro ao obter sessão atual:", err.message || err);
    return null;
  }
}
