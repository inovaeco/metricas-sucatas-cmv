"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { Sucata } from "@/app/page"
import { createSucata, updateSucata, deleteSucata } from "@/lib/database"

interface CadastroSucatasProps {
  sucatas: Sucata[]
  setSucatas: (sucatas: Sucata[]) => void
}

const formatDateLocal = (dateString: string) => {
  const [year, month, day] = dateString.split("-")
  return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day)).toLocaleDateString("pt-BR")
}

export function CadastroSucatas({ sucatas, setSucatas }: CadastroSucatasProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSucata, setEditingSucata] = useState<Sucata | null>(null)
  const [filtro, setFiltro] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    ano: "",
    custo: "",
    dataEntrada: new Date().toISOString().split("T")[0],
    lote: "",
  })

  const sucatasFiltradas = sucatas.filter(
    (sucata) =>
      sucata.marca.toLowerCase().includes(filtro.toLowerCase()) ||
      sucata.modelo.toLowerCase().includes(filtro.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const sucataData = {
        marca: formData.marca,
        modelo: formData.modelo,
        ano: Number.parseInt(formData.ano),
        custo: Number.parseFloat(formData.custo),
        dataEntrada: formData.dataEntrada,
        lote: formData.lote,
        status: "ativa" as const,
      }

      if (editingSucata) {
        const sucataAtualizada = await updateSucata(editingSucata.id, sucataData)
        if (sucataAtualizada) {
          setSucatas(sucatas.map((s) => (s.id === editingSucata.id ? sucataAtualizada : s)))
        }
      } else {
        const novaSucata = await createSucata(sucataData)
        if (novaSucata) {
          setSucatas([...sucatas, novaSucata])
        }
      }

      resetForm()
    } catch (error) {
      console.error("Erro ao salvar sucata:", error)
      alert("Erro ao salvar sucata. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      marca: "",
      modelo: "",
      ano: "",
      custo: "",
      dataEntrada: new Date().toISOString().split("T")[0],
      lote: "",
    })
    setEditingSucata(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (sucata: Sucata) => {
    setEditingSucata(sucata)
    setFormData({
      marca: sucata.marca,
      modelo: sucata.modelo,
      ano: sucata.ano.toString(),
      custo: sucata.custo.toString(),
      dataEntrada: sucata.dataEntrada,
      lote: sucata.lote,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta sucata?")) return

    setLoading(true)
    try {
      const success = await deleteSucata(id)
      if (success) {
        setSucatas(sucatas.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error("Erro ao excluir sucata:", error)
      alert("Erro ao excluir sucata. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por marca ou modelo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSucata(null)} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sucata
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSucata ? "Editar Sucata" : "Cadastrar Nova Sucata"}</DialogTitle>
              <DialogDescription>Preencha os dados do veículo para desmontagem</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ano">Ano</Label>
                  <Input
                    id="ano"
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="custo">Custo (R$)</Label>
                  <Input
                    id="custo"
                    type="number"
                    step="0.01"
                    value={formData.custo}
                    onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="lote">Lote</Label>
                  <Input
                    id="lote"
                    value={formData.lote}
                    onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                    placeholder="Ex: LOTE-001"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dataEntrada">Data de Entrada</Label>
                <Input
                  id="dataEntrada"
                  type="date"
                  value={formData.dataEntrada}
                  onChange={(e) => setFormData({ ...formData, dataEntrada: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : editingSucata ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sucatas Cadastradas</CardTitle>
          <CardDescription>{sucatasFiltradas.length} sucata(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Data Entrada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sucatasFiltradas.map((sucata) => (
                <TableRow key={sucata.id}>
                  <TableCell className="font-medium">
                    {sucata.marca} {sucata.modelo}
                  </TableCell>
                  <TableCell>{sucata.ano}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sucata.lote}</Badge>
                  </TableCell>
                  <TableCell>R$ {sucata.custo.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{formatDateLocal(sucata.dataEntrada)}</TableCell>
                  <TableCell>
                    <Badge variant={sucata.status === "ativa" ? "default" : "secondary"}>
                      {sucata.status === "ativa" ? "Ativa" : "Liquidada"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(sucata)} disabled={loading}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(sucata.id)} disabled={loading}>
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
