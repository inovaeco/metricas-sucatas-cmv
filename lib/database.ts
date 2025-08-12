import { getSupabaseClient, isSupabaseConfigured } from "./supabase"
import type { Sucata, Venda } from "@/app/page"
import type { DatabaseSucata, DatabaseVenda } from "./supabase"

async function ensureTablesExist(): Promise<void> {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado")
    }

    const supabase = getSupabaseClient()

    // Tentar verificar se as tabelas existem
    const { error: sucatasError } = await supabase.from("sucatas").select("id").limit(1)
    const { error: vendasError } = await supabase.from("vendas").select("id").limit(1)

    // Se as tabelas não existem, criar elas
    if (sucatasError || vendasError) {
      console.log("Criando tabelas no banco de dados...")

      const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS sucatas (
          id SERIAL PRIMARY KEY,
          lote VARCHAR(50) NOT NULL,
          marca VARCHAR(100) NOT NULL,
          modelo VARCHAR(100) NOT NULL,
          ano INTEGER NOT NULL,
          custo DECIMAL(10,2) NOT NULL,
          data_entrada DATE NOT NULL,
          status VARCHAR(20) DEFAULT 'ativa',
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS vendas (
          id SERIAL PRIMARY KEY,
          sucata_id INTEGER REFERENCES sucatas(id),
          nome_peca VARCHAR(200) NOT NULL,
          valor DECIMAL(10,2) NOT NULL,
          canal VARCHAR(50) NOT NULL,
          data_venda DATE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `

      const { error: createError } = await supabase.rpc("exec_sql", { sql: createTablesSQL })

      if (createError) {
        console.error("Erro ao criar tabelas:", createError)
        throw createError
      }

      console.log("Tabelas criadas com sucesso!")
    }
  } catch (error) {
    console.error("Erro ao verificar/criar tabelas:", error)
    throw error
  }
}

// Funções para Sucatas
export async function getSucatas(): Promise<Sucata[]> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase não configurado - retornando array vazio")
      return []
    }

    await ensureTablesExist()

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("sucatas").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar sucatas:", error)
      return []
    }

    return (data || []).map(transformDatabaseSucata)
  } catch (error) {
    console.error("Erro ao buscar sucatas:", error)
    return []
  }
}

export async function createSucata(sucata: Omit<Sucata, "id">): Promise<Sucata | null> {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase não configurado")
      return null
    }

    await ensureTablesExist()

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("sucatas")
      .insert({
        marca: sucata.marca,
        modelo: sucata.modelo,
        ano: sucata.ano,
        custo: sucata.custo,
        data_entrada: sucata.dataEntrada,
        lote: sucata.lote,
        status: sucata.status,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar sucata:", error)
      return null
    }

    return transformDatabaseSucata(data)
  } catch (error) {
    console.error("Erro ao criar sucata:", error)
    return null
  }
}

// Funções para Vendas
export async function getVendas(): Promise<Venda[]> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase não configurado - retornando array vazio")
      return []
    }

    await ensureTablesExist()

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("vendas").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar vendas:", error)
      return []
    }

    return (data || []).map(transformDatabaseVenda)
  } catch (error) {
    console.error("Erro ao buscar vendas:", error)
    return []
  }
}

export async function createVenda(venda: Omit<Venda, "id">): Promise<Venda | null> {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase não configurado")
      return null
    }

    await ensureTablesExist()

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("vendas")
      .insert({
        sucata_id: venda.sucataId,
        nome_peca: venda.nomePeca,
        valor: venda.valor,
        data_venda: venda.dataVenda,
        canal: venda.canal,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar venda:", error)
      return null
    }

    return transformDatabaseVenda(data)
  } catch (error) {
    console.error("Erro ao criar venda:", error)
    return null
  }
}

// Funções de transformação
function transformDatabaseSucata(dbSucata: DatabaseSucata): Sucata {
  return {
    id: dbSucata.id,
    marca: dbSucata.marca,
    modelo: dbSucata.modelo,
    ano: dbSucata.ano,
    custo: dbSucata.custo,
    dataEntrada: dbSucata.data_entrada,
    lote: dbSucata.lote,
    status: dbSucata.status,
  }
}

function transformDatabaseVenda(dbVenda: DatabaseVenda): Venda {
  return {
    id: dbVenda.id,
    sucataId: dbVenda.sucata_id,
    nomePeca: dbVenda.nome_peca,
    valor: dbVenda.valor,
    dataVenda: dbVenda.data_venda,
    canal: dbVenda.canal,
  }
}
