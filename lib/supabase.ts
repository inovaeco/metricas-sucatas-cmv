import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface DatabaseSucata {
  id: string
  marca: string
  modelo: string
  ano: number
  custo: number
  data_entrada: string
  lote: string
  status: "ativa" | "liquidada"
  created_at: string
  updated_at: string
}

export interface DatabaseVenda {
  id: string
  sucata_id: string
  nome_peca: string
  valor: number
  data_venda: string
  canal: "mercado-livre" | "balcao"
  created_at: string
  updated_at: string
}
