import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const supabase = createClientComponentClient()

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

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
