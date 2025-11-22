// services/vacinaService.ts
import { supabase } from "../config/supabase_config";

export type Vacina = {
  id?: string | number;
  animal_id: string;             // FK para animais.id
  tipo: string;                  // nome da vacina (Aftosa, etc.)
  data_aplicacao: string;        // YYYY-MM-DD
  validade_dias?: number | null; // opcional
};

const TABLE = "vacinas";

export async function criarVacina(input: Vacina): Promise<Vacina> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Vacina;
}