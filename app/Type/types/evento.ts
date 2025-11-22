export type EventType =
  | 'VACINA' | 'INSEMINAÇÃO'
  | 'REPRODUÇÃO' | 'NASCIMENTO';

export interface AnimalEvent {
  id?: string;
  animal_id: string;
  tipo: EventType;
  data_evento: string;
  descricao?: string;

  // somente quando tipo = 'VACINA'
  vacina_nome?: string;
  vacina_lote?: string;
  vacina_validade?: string; // 'YYYY-MM-DD'
}