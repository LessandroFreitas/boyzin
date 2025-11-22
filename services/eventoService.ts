import { supabase } from "../config/supabase_config";

export type EventType =
  | "VACINA"
  | "INSEMINAÇÃO"
  | "REPRODUÇÃO"
  | "NASCIMENTO";

export interface AnimalEvent {
  id?: number;
  id_animal: string;        // FK para animais.id
  tipo: EventType;
  data_do_evento: string;   // 'YYYY-MM-DD'
  descricao?: string;
}

const TABLE = "eventos";

export async function listarEventosPorAnimal(animalId: string): Promise<AnimalEvent[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id_animal", animalId)
    .order("data_do_evento", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AnimalEvent[];
}

export async function obterEvento(id: number | string): Promise<AnimalEvent> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as AnimalEvent;
}

export async function criarEvento(input: AnimalEvent): Promise<AnimalEvent> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as AnimalEvent;
}

export async function atualizarEvento(id: number | string, patch: Partial<AnimalEvent>): Promise<AnimalEvent> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as AnimalEvent;
}

export async function excluirEvento(id: number | string): Promise<void> { 

  console.log("excluir");

  const parsedId = isNaN(Number(id)) ? id : Number(id);

  const { error, count } = await supabase
    .from(TABLE)
    .delete({ count: "exact" })
    .eq("id", parsedId);

  if (error) throw error;
  if (!count) throw new Error("Evento não encontrado para exclusão.");
}