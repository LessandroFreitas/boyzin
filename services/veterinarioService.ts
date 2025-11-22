import { supabase } from "../config/supabase_config";

export type Veterinario = {
  crmv: string;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  endereco: {
    numero: string;
    bairro: string;
    cep: string;
    cidade: string;
    estado: string;
    complemento?: string;
  };
};

export async function buscarVeterinarios() {
  const { data, error } = await supabase
    .from("veterinarios")
    .select(`
          id,
          crmv,
          numero,
          bairro,
          cep,
          cidade,
          estado,
          complemento,
          usuarios!veterinarios_id_fkey (
            nome,
            email
          )
        `)
    .order("usuarios(nome)", { ascending: true });

  if (error) throw error;


  const normalizado = data.map((v: any) => ({
    ...v,
    usuarios: v.usuarios?.[0] || v.usuarios || {},
  }));

  return normalizado;
}

export async function atribuirVeterinarioAoFazendeiro(veterinario: any) {

  const user = await supabase.auth.getUser();

  const veterinarioId = veterinario.id;
  const fazendeiroId = user.data.user?.id;

  if (!veterinarioId) {
    throw new Error("ID do veterinário não fornecido.");
  }

  if (!user.data.user) {
    throw new Error("Usuário não logado.");
  }

  const { error } = await supabase
    .from("veterinario_fazendeiros")
    .insert({ veterinario_id: veterinarioId, fazendeiro_id: fazendeiroId });

  if (error) {
    console.error("Erro ao atribuir veterinário ao fazendeiro:", error);
    throw error;
  }
}

export async function salvarVeterinario(veterinario: Veterinario) {
  try {
    // 1️⃣ Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: veterinario.email,
      password: veterinario.senha,
    });

    if (authError) {
      if (
        authError.message?.toLowerCase().includes("user already registered") ||
        authError.message?.toLowerCase().includes("already registered")
      ) {
        throw new Error(authError.message);
      }
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error("Usuário não retornado pelo Supabase Auth.");

    // 2️⃣ Atualiza o registro do usuário criado automaticamente pelo trigger
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({
        nome: veterinario.nome,
        tipo: "veterinario",
        email: veterinario.email,
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    // 3️⃣ Cria o registro na tabela veterinarios (agora com FK válida)
    const { error: insertError } = await supabase.from("veterinarios").insert([
      {
        id: userId,
        crmv: veterinario.crmv,
        telefone: veterinario.telefone,
        numero: veterinario.endereco.numero,
        bairro: veterinario.endereco.bairro,
        cep: veterinario.endereco.cep,
        cidade: veterinario.endereco.cidade,
        estado: veterinario.endereco.estado,
        complemento: veterinario.endereco.complemento || null,
      },
    ]);

    if (insertError) throw insertError;

    return { success: true, userId };
  } catch (err: any) {
    console.error("Erro ao salvar veterinário:", err.message);
    throw err;
  }



}

export async function listarClientesDoVeterinario(veterinarioId: string) {
  try {
    const { data, error } = await supabase
      .from("veterinario_fazendeiros")
      .select(`
        fazendeiros(
          id,
          cidade,
          usuarios!fazendeiros_id_fkey (
            nome,
            email
          )
        )
      `)
      .eq("veterinario_id", veterinarioId);

    if (error) throw error;

    const normalizado = (data || []).map((item: any) => {
      const fazendeiro = item.fazendeiros;
      // Aqui garantimos que `usuarios` seja sempre um objeto único
      const usuarioObj = Array.isArray(fazendeiro.usuarios)
        ? fazendeiro.usuarios[0] || {}
        : fazendeiro.usuarios || {};

      return {
        id: fazendeiro.id,
        cidade: fazendeiro.cidade,
        usuarios: usuarioObj,
      };
    });


    return normalizado;
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    return [];
  }
}
