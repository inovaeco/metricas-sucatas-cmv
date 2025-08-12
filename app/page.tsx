"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Car, ShoppingCart, BarChart3, Loader2 } from "lucide-react"
import { CadastroSucatas } from "@/components/cadastro-sucatas"
import { RegistroVendas } from "@/components/registro-vendas"
import { Dashboard } from "@/components/dashboard"
import { getSucatas, getVendas } from "@/lib/database"

// Tipos de dados
export interface Sucata {
  id: string
  marca: string
  modelo: string
  ano: number
  custo: number
  dataEntrada: string
  lote: string
  status: "ativa" | "liquidada"
}

export interface Venda {
  id: string
  sucataId: string
  nomePeca: string
  valor: number
  dataVenda: string
  canal: "mercado-livre" | "balcao"
}

export default function CMVSystem() {
  const [sucatas, setSucatas] = useState<Sucata[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [sucatasData, vendasData] = await Promise.all([getSucatas(), getVendas()])
        setSucatas(sucatasData)
        setVendas(vendasData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setSucatas([])
        setVendas([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Cálculos de métricas
  const totalSucatas = sucatas.length
  const totalCustos = sucatas.reduce((acc, sucata) => acc + sucata.custo, 0)
  const totalVendas = vendas.reduce((acc, venda) => acc + venda.valor, 0)
  const lucroTotal = totalVendas - totalCustos

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Configurando sistema CMV...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Car className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">INOVA ECOPEÇAS</h1>
                <p className="text-sm text-gray-500">Sistema de CMV</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600">
                Lucro: R$ {lucroTotal.toLocaleString("pt-BR")}
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                {totalSucatas} Sucatas
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="sucatas" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>Sucatas</span>
            </TabsTrigger>
            <TabsTrigger value="vendas" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Vendas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard sucatas={sucatas} vendas={vendas} />
          </TabsContent>

          <TabsContent value="sucatas">
            <CadastroSucatas sucatas={sucatas} setSucatas={setSucatas} />
          </TabsContent>

          <TabsContent value="vendas">
            <RegistroVendas sucatas={sucatas} vendas={vendas} setVendas={setVendas} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
