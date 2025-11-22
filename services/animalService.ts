// services/animalService.ts
import { supabase } from "@/config/supabase_config";

export type Animal = {
  id?: string;
  nome: string;
  raca: string;
  sexo: "M" | "F";
  data_nascimento: string; // dd/mm/aaaa no app
  pai_nome?: string;
  pai_registro?: string;
  pai_raca?: string;
  mae_nome?: string;
  mae_registro?: string;
  mae_raca?: string;
  fazendeiro_id?: string;
};

type AnimalDB = {
  id: string;
  nome: string;
  raca: string;
  sexo: "M" | "F";
  data_nascimento: string | null; // ISO yyyy-mm-dd
  pai_nome: string | null;
  pai_registro: string | null;
  pai_raca: string | null;
  mae_nome: string | null;
  mae_registro: string | null;
  mae_raca: string | null;
  fazendeiro_id: string | null;
  criado_em?: string;
};

const TABLE = "animais";

/* ===== Datas ===== */
function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoToBR(iso?: string | null): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function brToISO(br?: string | null): string | null {
  if (!br) return null;
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromDB(a: AnimalDB): Animal {
  return {
    id: a.id,
    nome: a.nome,
    raca: a.raca,
    sexo: a.sexo,
    data_nascimento: isoToBR(a.data_nascimento),
    pai_nome: a.pai_nome ?? undefined,
    pai_registro: a.pai_registro ?? undefined,
    pai_raca: a.pai_raca ?? undefined,
    mae_nome: a.mae_nome ?? undefined,
    mae_registro: a.mae_registro ?? undefined,
    mae_raca: a.mae_raca ?? undefined,
    fazendeiro_id: a.fazendeiro_id ?? undefined,
  };
}

/**
 * toDB: payload base para INSERT/UPDATE
 * ➜ NÃO envia fazendeiro_id (pra não apagar no update)
 */
function toDB(a: Animal): Omit<AnimalDB, "id" | "fazendeiro_id" | "criado_em"> {
  return {
    nome: a.nome,
    raca: a.raca,
    sexo: a.sexo,
    data_nascimento: brToISO(a.data_nascimento),
    pai_nome: a.pai_nome ?? null,
    pai_registro: a.pai_registro ?? null,
    pai_raca: a.pai_raca ?? null,
    mae_nome: a.mae_nome ?? null,
    mae_registro: a.mae_registro ?? null,
    mae_raca: a.mae_raca ?? null,
  };
}

/* ===== CRUD ===== */
export async function listarAnimais(): Promise<Animal[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw error;
  return (data as AnimalDB[]).map(fromDB);
}

export async function listarAnimaisDoUsuario(): Promise<Animal[]> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userData.user?.id;

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("fazendeiro_id", userId ?? "")
    .order("nome", { ascending: true });

  if (error) throw error;
  return (data as AnimalDB[]).map(fromDB);
}

export async function obterAnimal(id: string): Promise<Animal> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return fromDB(data as AnimalDB);
}

export async function salvarAnimal(a: Animal): Promise<Animal> {
  const basePayload = toDB(a);

  if (a.id) {
    // UPDATE ➜ não mexe em fazendeiro_id
    const { data, error } = await supabase
      .from(TABLE)
      .update(basePayload)
      .eq("id", a.id)
      .select()
      .single();

    if (error) throw error;
    return fromDB(data as AnimalDB);
  } else {
    // INSERT ➜ define fazendeiro_id com o usuário logado
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? null;

    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...basePayload, fazendeiro_id: userId })
      .select()
      .single();

    if (error) throw error;
    return fromDB(data as AnimalDB);
  }
}

export async function excluirAnimal(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}