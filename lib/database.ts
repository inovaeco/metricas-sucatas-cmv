import { supabase } from "./supabase"
import type { Sucata, Venda } from "@/app/page"
import type { DatabaseSucata, DatabaseVenda } from "./supabase"

// Funções para Sucatas
export async function getSucatas(): Promise<Sucata[]> {
  const { data, error } = await supabase.from("sucatas").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar sucatas:", error)
    return []
  }

  return data.map(transformDatabaseSucata)
}

export async function createSucata(sucata: Omit<Sucata, "id">): Promise<Sucata | null> {
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
}

export async function updateSucata(id: string, sucata: Partial<Sucata>): Promise<Sucata | null> {
  const { data, error } = await supabase
    .from("sucatas")
    .update({
      marca: sucata.marca,
      modelo: sucata.modelo,
      ano: sucata.ano,
      custo: sucata.custo,
      data_entrada: sucata.dataEntrada,
      lote: sucata.lote,
      status: sucata.status,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar sucata:", error)
    return null
  }

  return transformDatabaseSucata(data)
}

export async function deleteSucata(id: string): Promise<boolean> {
  const { error } = await supabase.from("sucatas").delete().eq("id", id)

  if (error) {
    console.error("Erro ao deletar sucata:", error)
    return false
  }

  return true
}

// Funções para Vendas
export async function getVendas(): Promise<Venda[]> {
  const { data, error } = await supabase.from("vendas").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar vendas:", error)
    return []
  }

  return data.map(transformDatabaseVenda)
}

export async function createVenda(venda: Omit<Venda, "id">): Promise<Venda | null> {
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
}

export async function updateVenda(id: string, venda: Partial<Venda>): Promise<Venda | null> {
  const { data, error } = await supabase
    .from("vendas")
    .update({
      sucata_id: venda.sucataId,
      nome_peca: venda.nomePeca,
      valor: venda.valor,
      data_venda: venda.dataVenda,
      canal: venda.canal,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar venda:", error)
    return null
  }

  return transformDatabaseVenda(data)
}

export async function deleteVenda(id: string): Promise<boolean> {
  const { error } = await supabase.from("vendas").delete().eq("id", id)

  if (error) {
    console.error("Erro ao deletar venda:", error)
    return false
  }

  return true
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
