"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import type { Sucata, Venda } from "@/app/page"
import { createVenda, updateVenda, deleteVenda } from "@/lib/database"

interface RegistroVendasProps {
  sucatas: Sucata[]
  vendas: Venda[]
  setVendas: (vendas: Venda[]) => void
}

const formatDateLocal = (dateString: string) => {
  const [year, month, day] = dateString.split("-")
  return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day)).toLocaleDateString("pt-BR")
}

export function RegistroVendas({ sucatas, vendas, setVendas }: RegistroVendasProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null)
  const [filtro, setFiltro] = useState("")
  const [paginaAtual, setPaginaAtual] = useState(1) // Estado para paginação
  const [itensPorPagina] = useState(10) // Itens por página
  const [filtroData, setFiltroData] = useState("") // Filtro por data
  const [filtroCanal, setFiltroCanal] = useState("") // Filtro por canal
  const [formData, setFormData] = useState({
    sucataId: "",
    nomePeca: "",
    valor: "",
    dataVenda: new Date().toISOString().split("T")[0],
    canal: "",
  })

  console.log(
    "Sucatas recebidas:",
    sucatas.map((s) => ({ id: s.id, tipo: typeof s.id })),
  )

  const vendasComSucata = vendas
    .map((venda) => ({
      ...venda,
      sucata: sucatas.find((s) => s.id === venda.sucataId),
    }))
    .filter((venda) => venda.sucata)
    .sort((a, b) => new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime()) // Ordenar por data (mais recentes primeiro)

  const vendasFiltradas = vendasComSucata.filter((venda) => {
    const matchTexto =
      venda.nomePeca.toLowerCase().includes(filtro.toLowerCase()) ||
      venda.sucata?.marca.toLowerCase().includes(filtro.toLowerCase()) ||
      venda.sucata?.modelo.toLowerCase().includes(filtro.toLowerCase())

    const matchData = !filtroData || venda.dataVenda.includes(filtroData)
    const matchCanal = !filtroCanal || venda.canal === filtroCanal

    return matchTexto && matchData && matchCanal
  })

  const totalPaginas = Math.ceil(vendasFiltradas.length / itensPorPagina)
  const indiceInicio = (paginaAtual - 1) * itensPorPagina
  const vendasPaginadas = vendasFiltradas.slice(indiceInicio, indiceInicio + itensPorPagina)

  const handleFiltroChange = (novoFiltro: string) => {
    setFiltro(novoFiltro)
    setPaginaAtual(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("FormData completo:", formData)
    console.log("sucataId capturado:", formData.sucataId, "tipo:", typeof formData.sucataId)

    if (!formData.sucataId || formData.sucataId === "") {
      alert("Por favor, selecione uma sucata antes de registrar a venda.")
      return
    }

    try {
      const sucataId = formData.sucataId

      console.log("sucataId (UUID):", sucataId)

      if (!sucataId || sucataId.length < 10) {
        console.error("ID inválido - formData.sucataId:", formData.sucataId)
        alert("Erro: ID da sucata inválido. Tente selecionar a sucata novamente.")
        return
      }

      const sucataExiste = sucatas.find((s) => s.id === sucataId)
      console.log("Sucata encontrada:", sucataExiste)

      if (!sucataExiste) {
        alert("Erro: Sucata selecionada não encontrada. Tente novamente.")
        return
      }

      const vendaData = {
        sucata_id: sucataId,
        peca: formData.nomePeca,
        valor: Number.parseFloat(formData.valor),
        canal: formData.canal as "mercado-livre" | "balcao",
        data_venda: formData.dataVenda,
      }

      console.log("Dados da venda a serem enviados:", vendaData)

      if (editingVenda) {
        await updateVenda(editingVenda.id, vendaData)
        setVendas(
          vendas.map((v) =>
            v.id === editingVenda.id
              ? {
                  ...editingVenda,
                  sucataId: sucataId,
                  nomePeca: formData.nomePeca,
                  valor: Number.parseFloat(formData.valor),
                  dataVenda: formData.dataVenda,
                  canal: formData.canal as "mercado-livre" | "balcao",
                }
              : v,
          ),
        )
      } else {
        const novaVenda = await createVenda(vendaData)
        if (novaVenda) {
          setVendas([
            ...vendas,
            {
              id: novaVenda.id,
              sucataId: sucataId,
              nomePeca: formData.nomePeca,
              valor: Number.parseFloat(formData.valor),
              dataVenda: formData.dataVenda,
              canal: formData.canal as "mercado-livre" | "balcao",
            },
          ])
        }
      }

      resetForm()
    } catch (error) {
      console.error("Erro detalhado ao criar venda:", error)
      alert("Erro ao salvar venda. Verifique se todos os campos estão preenchidos corretamente.")
    }
  }

  const resetForm = () => {
    setFormData({
      sucataId: "",
      nomePeca: "",
      valor: "",
      dataVenda: new Date().toISOString().split("T")[0],
      canal: "",
    })
    setEditingVenda(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (venda: Venda) => {
    setEditingVenda(venda)
    setFormData({
      sucataId: venda.sucataId,
      nomePeca: venda.nomePeca,
      valor: venda.valor.toString(),
      dataVenda: venda.dataVenda,
      canal: venda.canal,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVenda(id)
      setVendas(vendas.filter((v) => v.id !== id))
    } catch (error) {
      console.error("Erro ao deletar venda:", error)
      alert("Erro ao deletar venda. Tente novamente.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por peça ou veículo..."
              value={filtro}
              onChange={(e) => handleFiltroChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Input
            type="month"
            placeholder="Filtrar por mês"
            value={filtroData}
            onChange={(e) => {
              setFiltroData(e.target.value)
              setPaginaAtual(1)
            }}
            className="w-40"
          />

          <Select
            value={filtroCanal}
            onValueChange={(value) => {
              setFiltroCanal(value)
              setPaginaAtual(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="mercado-livre">Mercado Livre</SelectItem>
              <SelectItem value="balcao">Balcão</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingVenda(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVenda ? "Editar Venda" : "Registrar Nova Venda"}</DialogTitle>
              <DialogDescription>Registre a venda de uma peça de uma sucata</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="sucataId">Sucata *</Label>
                <Select
                  value={formData.sucataId}
                  onValueChange={(value) => {
                    console.log("Sucata selecionada - value:", value, "tipo:", typeof value)
                    const sucataEncontrada = sucatas.find((s) => s.id.toString() === value)
                    console.log("Sucata encontrada no onChange:", sucataEncontrada)
                    setFormData({ ...formData, sucataId: value })
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sucata" />
                  </SelectTrigger>
                  <SelectContent>
                    {sucatas
                      .filter((s) => s.status === "ativa")
                      .map((sucata) => {
                        console.log("Renderizando sucata no Select:", { id: sucata.id, tipo: typeof sucata.id })
                        return (
                          <SelectItem key={sucata.id} value={sucata.id.toString()}>
                            Lote {sucata.lote} - {sucata.marca} {sucata.modelo} ({sucata.ano})
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nomePeca">Nome da Peça</Label>
                <Input
                  id="nomePeca"
                  value={formData.nomePeca}
                  onChange={(e) => setFormData({ ...formData, nomePeca: e.target.value })}
                  placeholder="Ex: Motor 1.0, Porta dianteira, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor">Valor da Venda (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="canal">Canal de Venda</Label>
                  <Select
                    value={formData.canal}
                    onValueChange={(value) => setFormData({ ...formData, canal: value as "mercado-livre" | "balcao" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mercado-livre">Mercado Livre</SelectItem>
                      <SelectItem value="balcao">Balcão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dataVenda">Data da Venda</Label>
                <Input
                  id="dataVenda"
                  type="date"
                  value={formData.dataVenda}
                  onChange={(e) => setFormData({ ...formData, dataVenda: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">{editingVenda ? "Atualizar" : "Registrar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendas Registradas</CardTitle>
          <CardDescription>
            {vendasFiltradas.length} venda(s) encontrada(s) - Página {paginaAtual} de {totalPaginas}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>Peça</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendasPaginadas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Lote {venda.sucata?.lote}
                      </Badge>
                      {venda.sucata?.marca} {venda.sucata?.modelo} ({venda.sucata?.ano})
                    </div>
                  </TableCell>
                  <TableCell>{venda.nomePeca}</TableCell>
                  <TableCell>R$ {venda.valor.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{formatDateLocal(venda.dataVenda)}</TableCell>
                  <TableCell>
                    <Badge variant={venda.canal === "mercado-livre" ? "default" : "secondary"}>
                      {venda.canal === "mercado-livre" ? "Mercado Livre" : "Balcão"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(venda)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(venda.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPaginas > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                disabled={paginaAtual === 1}
              >
                Anterior
              </Button>

              <span className="text-sm text-gray-600">
                Página {paginaAtual} de {totalPaginas}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
