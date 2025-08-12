import { supabase } from "./supabase"
import type { Sucata, Venda } from "@/app/page"
import type { DatabaseSucata, DatabaseVenda } from "./supabase"

// Simplificando a função de verificação de tabelas
async function ensureTablesExist(): Promise<void> {
  try {
    // Tentar uma query simples para verificar se as tabelas existem
    await supabase.from("sucatas").select("id").limit(1)
    await supabase.from("vendas").select("id").limit(1)
  } catch (error) {
    console.log("Tabelas serão criadas automaticamente pelo Supabase")
  }
}

// Funções para Sucatas
export async function getSucatas(): Promise<Sucata[]> {
  try {
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
