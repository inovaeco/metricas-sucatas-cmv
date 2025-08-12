"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Filter,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react"
import { useState, useMemo } from "react"
import type { Sucata, Venda } from "@/app/page"

interface DashboardProps {
  sucatas: Sucata[]
  vendas: Venda[]
}

export function Dashboard({ sucatas, vendas }: DashboardProps) {
  const [filtroOrdenacao, setFiltroOrdenacao] = useState<"lucro" | "vendas" | "margem">("lucro")
  const [limiteExibicao, setLimiteExibicao] = useState<number>(10)
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [periodoAnalise, setPeriodoAnalise] = useState<"7d" | "30d" | "90d" | "1y" | "custom">("30d")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [diasParado, setDiasParado] = useState(30)
  const [visualizacaoTempo, setVisualizacaoTempo] = useState<"mensal" | "semanal">("mensal")

  const filtrarPorPeriodo = (data: Date) => {
    const hoje = new Date()
    const dataItem = new Date(data)

    if (periodoAnalise === "custom" && dataInicio && dataFim) {
      return dataItem >= new Date(dataInicio) && dataItem <= new Date(dataFim)
    }

    const diasAtras =
      {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      }[periodoAnalise] || 30

    const dataLimite = new Date(hoje.getTime() - diasAtras * 24 * 60 * 60 * 1000)
    return dataItem >= dataLimite
  }

  const vendasFiltradas = vendas.filter((venda) => filtrarPorPeriodo(new Date(venda.dataVenda))) // corrigido de venda.data para venda.dataVenda

  // Cálculos de métricas
  const totalCustos = sucatas.reduce((acc, sucata) => acc + sucata.custo, 0)
  const totalVendas = vendasFiltradas.reduce((acc, venda) => acc + venda.valor, 0)
  const lucroTotal = totalVendas - totalCustos
  const margemLucro = totalVendas > 0 ? (lucroTotal / totalVendas) * 100 : 0

  const dadosTemporais = useMemo(() => {
    const agrupamento = visualizacaoTempo === "mensal" ? "YYYY-MM" : "YYYY-[W]WW"
    const formato = visualizacaoTempo === "mensal" ? "MMM/YYYY" : "Sem WW/YYYY"

    const grupos: { [key: string]: { vendas: number; lucro: number; quantidade: number } } = {}

    vendasFiltradas.forEach((venda) => {
      const data = new Date(venda.dataVenda) // corrigido de venda.data para venda.dataVenda
      let chave: string

      if (visualizacaoTempo === "mensal") {
        chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`
      } else {
        const inicioAno = new Date(data.getFullYear(), 0, 1)
        const diasPassados = Math.floor((data.getTime() - inicioAno.getTime()) / (24 * 60 * 60 * 1000))
        const semana = Math.ceil((diasPassados + inicioAno.getDay() + 1) / 7)
        chave = `${data.getFullYear()}-W${String(semana).padStart(2, "0")}`
      }

      if (!grupos[chave]) {
        grupos[chave] = { vendas: 0, lucro: 0, quantidade: 0 }
      }

      const sucata = sucatas.find((s) => s.id === venda.sucataId)
      const custoRateado = sucata ? sucata.custo / vendas.filter((v) => v.sucataId === sucata.id).length : 0

      grupos[chave].vendas += venda.valor
      grupos[chave].lucro += venda.valor - custoRateado
      grupos[chave].quantidade += 1
    })

    return Object.entries(grupos)
      .map(([periodo, dados]) => ({
        periodo:
          visualizacaoTempo === "mensal"
            ? new Date(periodo + "-01").toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
            : `Sem ${periodo.split("-W")[1]}/${periodo.split("-W")[0]}`,
        vendas: dados.vendas,
        lucro: dados.lucro,
        quantidade: dados.quantidade,
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo))
  }, [vendasFiltradas, visualizacaoTempo, sucatas])

  const sucatasParadas = useMemo(() => {
    const hoje = new Date()
    return sucatas.filter((sucata) => {
      const ultimaVenda = vendas
        .filter((v) => v.sucataId === sucata.id)
        .sort((a, b) => new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime())[0] // corrigido de a.data/b.data para a.dataVenda/b.dataVenda

      if (!ultimaVenda) {
        const diasSemVenda = Math.floor(
          (hoje.getTime() - new Date(sucata.dataEntrada).getTime()) / (1000 * 60 * 60 * 24),
        )
        return diasSemVenda > diasParado
      }

      const diasSemVenda = Math.floor(
        (hoje.getTime() - new Date(ultimaVenda.dataVenda).getTime()) / (1000 * 60 * 60 * 24),
      ) // corrigido de ultimaVenda.data para ultimaVenda.dataVenda
      return diasSemVenda > diasParado
    })
  }, [sucatas, vendas, diasParado])

  const performancePorMarca = useMemo(() => {
    const marcas: { [key: string]: { custo: number; vendas: number; quantidade: number } } = {}

    sucatas.forEach((sucata) => {
      if (!marcas[sucata.marca]) {
        marcas[sucata.marca] = { custo: 0, vendas: 0, quantidade: 0 }
      }

      const vendasSucata = vendasFiltradas.filter((v) => v.sucataId === sucata.id)
      const totalVendasSucata = vendasSucata.reduce((acc, v) => acc + v.valor, 0)

      marcas[sucata.marca].custo += sucata.custo
      marcas[sucata.marca].vendas += totalVendasSucata
      marcas[sucata.marca].quantidade += 1
    })

    return Object.entries(marcas)
      .map(([marca, dados]) => ({
        marca,
        custo: dados.custo,
        vendas: dados.vendas,
        lucro: dados.vendas - dados.custo,
        margem: dados.vendas > 0 ? ((dados.vendas - dados.custo) / dados.vendas) * 100 : 0,
        quantidade: dados.quantidade,
      }))
      .sort((a, b) => b.lucro - a.lucro)
  }, [sucatas, vendasFiltradas])

  const comparativoModelos = useMemo(() => {
    const modelos: { [key: string]: { custo: number; vendas: number; quantidade: number } } = {}

    sucatas.forEach((sucata) => {
      const chaveModelo = `${sucata.marca} ${sucata.modelo}`
      if (!modelos[chaveModelo]) {
        modelos[chaveModelo] = { custo: 0, vendas: 0, quantidade: 0 }
      }

      const vendasSucata = vendasFiltradas.filter((v) => v.sucataId === sucata.id)
      const totalVendasSucata = vendasSucata.reduce((acc, v) => acc + v.valor, 0)

      modelos[chaveModelo].custo += sucata.custo
      modelos[chaveModelo].vendas += totalVendasSucata
      modelos[chaveModelo].quantidade += 1
    })

    return Object.entries(modelos)
      .map(([modelo, dados]) => ({
        modelo,
        custo: dados.custo,
        vendas: dados.vendas,
        lucro: dados.vendas - dados.custo,
        margem: dados.vendas > 0 ? ((dados.vendas - dados.custo) / dados.vendas) * 100 : 0,
        quantidade: dados.quantidade,
      }))
      .filter((item) => item.quantidade > 0)
      .sort((a, b) => b.margem - a.margem)
      .slice(0, 10)
  }, [sucatas, vendasFiltradas])

  // Dados para gráfico de vendas por canal
  const vendasPorCanal = [
    {
      canal: "Mercado Livre",
      valor: vendasFiltradas.filter((v) => v.canal === "mercado-livre").reduce((acc, v) => acc + v.valor, 0),
      quantidade: vendasFiltradas.filter((v) => v.canal === "mercado-livre").length,
    },
    {
      canal: "Balcão",
      valor: vendasFiltradas.filter((v) => v.canal === "balcao").reduce((acc, v) => acc + v.valor, 0),
      quantidade: vendasFiltradas.filter((v) => v.canal === "balcao").length,
    },
  ]

  const cmvPorSucata = sucatas.map((sucata) => {
    const vendasSucata = vendasFiltradas.filter((v) => v.sucataId === sucata.id)
    const totalVendasSucata = vendasSucata.reduce((acc, v) => acc + v.valor, 0)
    const lucroSucata = totalVendasSucata - sucata.custo

    return {
      nome: `${sucata.marca} ${sucata.modelo} (${sucata.ano})`,
      lote: sucata.lote,
      nomeCompleto: `Lote ${sucata.lote} - ${sucata.marca} ${sucata.modelo} (${sucata.ano})`,
      custo: sucata.custo,
      vendas: totalVendasSucata,
      lucro: lucroSucata,
      margem: totalVendasSucata > 0 ? (lucroSucata / totalVendasSucata) * 100 : 0,
    }
  })

  const cmvOrdenado = [...cmvPorSucata].sort((a, b) => {
    switch (filtroOrdenacao) {
      case "lucro":
        return b.lucro - a.lucro
      case "vendas":
        return b.vendas - a.vendas
      case "margem":
        return b.margem - a.margem
      default:
        return b.lucro - a.lucro
    }
  })

  const cmvParaGrafico = mostrarTodos ? cmvOrdenado : cmvOrdenado.slice(0, limiteExibicao)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="periodo">Período de Análise</Label>
              <Select value={periodoAnalise} onValueChange={(value: any) => setPeriodoAnalise(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="1y">Último ano</SelectItem>
                  <SelectItem value="custom">Período customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodoAnalise === "custom" && (
              <>
                <div>
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="visualizacao">Visualização Temporal</Label>
              <Select value={visualizacaoTempo} onValueChange={(value: any) => setVisualizacaoTempo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCustos.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">Em {sucatas.length} sucatas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalVendas.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">{vendasFiltradas.length} vendas no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            {lucroTotal >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lucroTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {lucroTotal.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">Margem: {margemLucro.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucatas Paradas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{sucatasParadas.length}</div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={diasParado}
                onChange={(e) => setDiasParado(Number(e.target.value))}
                className="w-16 h-6 text-xs"
                min="1"
              />
              <span className="text-xs text-muted-foreground">dias sem venda</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência de Vendas e Lucro
            </CardTitle>
            <CardDescription>Evolução {visualizacaoTempo} das vendas e lucro no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Line type="monotone" dataKey="vendas" stroke="#22c55e" strokeWidth={2} name="Vendas" />
                <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={2} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sazonalidade das Vendas
            </CardTitle>
            <CardDescription>Volume de vendas por período - identificação de padrões sazonais</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "quantidade" ? `${value} vendas` : `R$ ${value.toLocaleString("pt-BR")}`,
                    name === "quantidade" ? "Quantidade" : "Valor",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="quantidade"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="quantidade"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance por Marca</CardTitle>
            <CardDescription>Análise de rentabilidade por marca de veículo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performancePorMarca.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="marca" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Bar dataKey="lucro" fill="#22c55e" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Modelos por Margem</CardTitle>
            <CardDescription>Modelos com melhor margem de lucro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparativoModelos.slice(0, 6).map((modelo, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium text-sm">{modelo.modelo}</p>
                    <p className="text-xs text-muted-foreground">{modelo.quantidade} veículos</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${modelo.margem >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {modelo.margem.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">R$ {modelo.lucro.toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {sucatasParadas.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Clock className="h-5 w-5" />
              Sucatas com Baixo Giro ({sucatasParadas.length})
            </CardTitle>
            <CardDescription>Veículos sem vendas há mais de {diasParado} dias - necessitam atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sucatasParadas.slice(0, 6).map((sucata) => {
                const ultimaVenda = vendas
                  .filter((v) => v.sucataId === sucata.id)
                  .sort((a, b) => new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime())[0] // corrigido de a.data/b.data para a.dataVenda/b.dataVenda

                const dataReferencia = ultimaVenda ? new Date(ultimaVenda.dataVenda) : new Date(sucata.dataEntrada) // corrigido de ultimaVenda.data para ultimaVenda.dataVenda
                const diasSemVenda = Math.floor(
                  (new Date().getTime() - dataReferencia.getTime()) / (24 * 60 * 60 * 1000),
                )

                return (
                  <div key={sucata.id} className="p-3 border rounded-lg bg-orange-50">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs">
                        {sucata.lote}
                      </Badge>
                      <Badge variant="secondary" className="text-xs text-orange-700">
                        {diasSemVenda} dias
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">
                      {sucata.marca} {sucata.modelo}
                    </p>
                    <p className="text-xs text-muted-foreground">Ano: {sucata.ano}</p>
                    <p className="text-xs text-muted-foreground">Custo: R$ {sucata.custo.toLocaleString("pt-BR")}</p>
                  </div>
                )
              })}
            </div>
            {sucatasParadas.length > 6 && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                E mais {sucatasParadas.length - 6} sucatas com baixo giro...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gráficos existentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>CMV por Sucata</CardTitle>
                <CardDescription>
                  {mostrarTodos
                    ? `Mostrando todas as ${cmvOrdenado.length} sucatas`
                    : `Top ${Math.min(limiteExibicao, cmvOrdenado.length)} sucatas por ${filtroOrdenacao}`}
                </CardDescription>
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Select
                value={filtroOrdenacao}
                onValueChange={(value: "lucro" | "vendas" | "margem") => setFiltroOrdenacao(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lucro">Por Lucro</SelectItem>
                  <SelectItem value="vendas">Por Vendas</SelectItem>
                  <SelectItem value="margem">Por Margem</SelectItem>
                </SelectContent>
              </Select>

              {!mostrarTodos && (
                <Select value={limiteExibicao.toString()} onValueChange={(value) => setLimiteExibicao(Number(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Top 5</SelectItem>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="15">Top 15</SelectItem>
                    <SelectItem value="20">Top 20</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button variant="outline" size="sm" onClick={() => setMostrarTodos(!mostrarTodos)}>
                {mostrarTodos ? "Mostrar Top" : "Mostrar Todos"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={cmvParaGrafico} margin={{ bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nomeCompleto" angle={-45} textAnchor="end" height={120} fontSize={10} interval={0} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="custo" fill="#ef4444" name="Custo" />
                <Bar dataKey="vendas" fill="#22c55e" name="Vendas" />
                <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>

            {!mostrarTodos && cmvOrdenado.length > limiteExibicao && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Mostrando {limiteExibicao} de {cmvOrdenado.length} sucatas.
                <Button variant="link" className="p-0 h-auto ml-1" onClick={() => setMostrarTodos(true)}>
                  Ver todas
                </Button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Vendas por Canal */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Canal</CardTitle>
            <CardDescription>Distribuição de vendas entre canais no período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vendasPorCanal}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ canal, valor }) => `${canal}: R$ ${valor.toLocaleString("pt-BR")}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {vendasPorCanal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Sucata</CardTitle>
          <CardDescription>Análise detalhada do CMV de cada veículo (ordenado por {filtroOrdenacao})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Lote</th>
                  <th className="text-left p-2">Veículo</th>
                  <th className="text-right p-2">Custo</th>
                  <th className="text-right p-2">Vendas</th>
                  <th className="text-right p-2">Lucro</th>
                  <th className="text-right p-2">Margem</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {cmvOrdenado.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <Badge variant="outline">{item.lote}</Badge>
                    </td>
                    <td className="p-2 font-medium">{item.nome}</td>
                    <td className="p-2 text-right">R$ {item.custo.toLocaleString("pt-BR")}</td>
                    <td className="p-2 text-right">R$ {item.vendas.toLocaleString("pt-BR")}</td>
                    <td className={`p-2 text-right font-medium ${item.lucro >= 0 ? "text-green-600" : "text-red-600"}`}>
                      R$ {item.lucro.toLocaleString("pt-BR")}
                    </td>
                    <td className={`p-2 text-right ${item.margem >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.margem.toFixed(1)}%
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={item.vendas > item.custo ? "default" : "secondary"}>
                        {item.vendas > item.custo ? "Lucrativa" : "Em Progresso"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
