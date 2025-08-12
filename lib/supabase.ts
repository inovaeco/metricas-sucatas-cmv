import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured = (() => {
  if (typeof window === "undefined") {
    // Server-side
    return (
      typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_url_here" &&
      typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0 &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_supabase_anon_key_here"
    )
  } else {
    // Client-side - verificar se as variáveis estão disponíveis
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      return (
        typeof url === "string" &&
        url.length > 0 &&
        url.startsWith("https://") &&
        url.includes(".supabase.co") &&
        typeof key === "string" &&
        key.length > 0 &&
        key.startsWith("eyJ")
      )
    } catch {
      return false
    }
  }
})()

let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase não está configurado. Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no Project Settings > Env. Variables",
    )
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClientComponentClient()
    } catch (error) {
      throw new Error(
        `Erro ao criar cliente Supabase: ${error}. Verifique se as variáveis de ambiente estão configuradas corretamente.`,
      )
    }
  }

  return supabaseClient
}

export const supabase = {
  get client() {
    return getSupabaseClient()
  },
}

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
