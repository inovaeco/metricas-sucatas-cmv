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

interface RegistroVendasProps {
  sucatas: Sucata[]
  vendas: Venda[]
  setVendas: (vendas: Venda[]) => void
}

export function RegistroVendas({ sucatas, vendas, setVendas }: RegistroVendasProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null)
  const [filtro, setFiltro] = useState("")
  const [formData, setFormData] = useState({
    sucataId: "",
    nomePeca: "",
    valor: "",
    dataVenda: new Date().toISOString().split("T")[0],
    canal: "" as "mercado-livre" | "balcao" | "",
  })

  const vendasComSucata = vendas
    .map((venda) => ({
      ...venda,
      sucata: sucatas.find((s) => s.id === venda.sucataId),
    }))
    .filter((venda) => venda.sucata)

  const vendasFiltradas = vendasComSucata.filter(
    (venda) =>
      venda.nomePeca.toLowerCase().includes(filtro.toLowerCase()) ||
      venda.sucata?.marca.toLowerCase().includes(filtro.toLowerCase()) ||
      venda.sucata?.modelo.toLowerCase().includes(filtro.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const novaVenda: Venda = {
      id: editingVenda?.id || Date.now().toString(),
      sucataId: formData.sucataId,
      nomePeca: formData.nomePeca,
      valor: Number.parseFloat(formData.valor),
      dataVenda: formData.dataVenda,
      canal: formData.canal as "mercado-livre" | "balcao",
    }

    if (editingVenda) {
      setVendas(vendas.map((v) => (v.id === editingVenda.id ? novaVenda : v)))
    } else {
      setVendas([...vendas, novaVenda])
    }

    resetForm()
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

  const handleDelete = (id: string) => {
    setVendas(vendas.filter((v) => v.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros e botão de adicionar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por peça ou veículo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
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
                <Label htmlFor="sucataId">Sucata</Label>
                <Select
                  value={formData.sucataId}
                  onValueChange={(value) => setFormData({ ...formData, sucataId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sucata" />
                  </SelectTrigger>
                  <SelectContent>
                    {sucatas
                      .filter((s) => s.status === "ativa")
                      .map((sucata) => (
                        <SelectItem key={sucata.id} value={sucata.id}>
                          Lote {sucata.lote} - {sucata.marca} {sucata.modelo} ({sucata.ano})
                        </SelectItem>
                      ))}
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

      {/* Tabela de vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Registradas</CardTitle>
          <CardDescription>{vendasFiltradas.length} venda(s) encontrada(s)</CardDescription>
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
              {vendasFiltradas.map((venda) => (
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
                  <TableCell>{new Date(venda.dataVenda).toLocaleDateString("pt-BR")}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
