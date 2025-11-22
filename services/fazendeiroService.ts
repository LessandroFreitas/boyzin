import { supabase } from '../config/supabase_config';

export type Endereco = {
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
};

export type Fazendeiro = {
  nome: string;
  email: string;
  senha: string;
  endereco: Endereco;
};

export async function salvarFazendeiro(fazendeiro: Fazendeiro) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: fazendeiro.email,
      password: fazendeiro.senha,
    });

    if (authError) {
      if (
        authError.message?.toLowerCase().includes('user already registered') ||
        authError.message?.toLowerCase().includes('already registered')
      ) {
        throw new Error('Já existe um usuário cadastrado com este e-mail.');
      }
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error('Usuário não retornado pelo Supabase Auth.');

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        nome: fazendeiro.nome,
        tipo: 'fazendeiro',
        email: fazendeiro.email, 
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    const { error: insertError } = await supabase.from('fazendeiros').insert([
      {
        id: userId, 
        bairro: fazendeiro.endereco.bairro,
        cep: fazendeiro.endereco.cep,
        cidade: fazendeiro.endereco.cidade,
        estado: fazendeiro.endereco.estado,
      },
    ]);

    if (insertError) throw insertError;

    return { success: true, userId };
  } catch (err: any) {
    console.error('Erro ao salvar fazendeiro:', err);
    throw err;
  }
}
