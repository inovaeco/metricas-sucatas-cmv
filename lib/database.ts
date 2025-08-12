import { getSupabaseClient, isSupabaseConfigured } from "./supabase"
import type { Sucata, Venda } from "@/app/page"
import type { DatabaseSucata, DatabaseVenda } from "./supabase"

// Funções para Sucatas
export async function getSucatas(): Promise<Sucata[]> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase não configurado - retornando array vazio")
      return []
    }

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

    const supabase = getSupabaseClient()

    console.log("Tentando inserir sucata:", sucata)

    const { data, error } = await supabase
      .from("sucatas")
      .insert({
        marca: sucata.marca,
        modelo: sucata.modelo,
        ano: sucata.ano,
        custo: sucata.custo,
        data_entrada: sucata.dataEntrada,
        lote: sucata.lote,
        status: sucata.status || "ativa",
      })
      .select()
      .single()

    if (error) {
      console.error("Erro detalhado ao criar sucata:", error)
      return null
    }

    console.log("Sucata criada com sucesso:", data)
    return transformDatabaseSucata(data)
  } catch (error) {
    console.error("Erro ao criar sucata:", error)
    return null
  }
}

export async function updateSucata(id: string, sucata: Omit<Sucata, "id">): Promise<Sucata | null> {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase não configurado")
      return null
    }

    const supabase = getSupabaseClient()

    console.log("Tentando atualizar sucata:", id, sucata)

    const { data, error } = await supabase
      .from("sucatas")
      .update({
        marca: sucata.marca,
        modelo: sucata.modelo,
        ano: sucata.ano,
        custo: sucata.custo,
        data_entrada: sucata.dataEntrada,
        lote: sucata.lote,
        status: sucata.status || "ativa",
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro detalhado ao atualizar sucata:", error)
      return null
    }

    console.log("Sucata atualizada com sucesso:", data)
    return transformDatabaseSucata(data)
  } catch (error) {
    console.error("Erro ao atualizar sucata:", error)
    return null
  }
}

export async function deleteSucata(id: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured) {
      console.error("Supabase não configurado")
      return false
    }

    const supabase = getSupabaseClient()

    console.log("Tentando deletar sucata:", id)

    const { error } = await supabase.from("sucatas").delete().eq("id", id)

    if (error) {
      console.error("Erro detalhado ao deletar sucata:", error)
      return false
    }

    console.log("Sucata deletada com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao deletar sucata:", error)
    return false
  }
}

// Funções para Vendas
export async function getVendas(): Promise<Venda[]> {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase não configurado - retornando array vazio")
      return []
    }

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
