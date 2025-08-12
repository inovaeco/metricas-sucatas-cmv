"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const createTables = async () => {
    setStatus("loading")
    setMessage("Criando tabelas no banco de dados...")

    try {
      // Criar tabela sucatas
      const { error: sucatasError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS sucatas (
            id SERIAL PRIMARY KEY,
            lote VARCHAR(50) NOT NULL UNIQUE,
            marca VARCHAR(100) NOT NULL,
            modelo VARCHAR(100) NOT NULL,
            ano INTEGER NOT NULL,
            custo DECIMAL(10,2) NOT NULL,
            data_entrada DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (sucatasError) {
        // Tentar método alternativo
        const { error: altError1 } = await supabase.from("sucatas").select("*").limit(1)

        if (altError1) {
          throw new Error("Tabela sucatas não existe e não foi possível criar")
        }
      }

      // Criar tabela vendas
      const { error: vendasError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS vendas (
            id SERIAL PRIMARY KEY,
            sucata_id INTEGER REFERENCES sucatas(id) ON DELETE CASCADE,
            peca VARCHAR(200) NOT NULL,
            valor DECIMAL(10,2) NOT NULL,
            data_venda DATE NOT NULL,
            canal VARCHAR(50) NOT NULL CHECK (canal IN ('Mercado Livre', 'Balcão')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (vendasError) {
        // Tentar método alternativo
        const { error: altError2 } = await supabase.from("vendas").select("*").limit(1)

        if (altError2) {
          throw new Error("Tabela vendas não existe e não foi possível criar")
        }
      }

      setStatus("success")
      setMessage("Banco de dados configurado com sucesso! Você pode voltar para o sistema principal.")
    } catch (error) {
      console.error("Erro ao configurar banco:", error)
      setStatus("error")
      setMessage(
        `Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}. Tente novamente ou verifique se o Supabase está configurado corretamente.`,
      )
    }
  }

  const testConnection = async () => {
    setStatus("loading")
    setMessage("Testando conexão com o banco...")

    try {
      const { data, error } = await supabase.from("sucatas").select("count(*)").single()

      if (error) {
        throw error
      }

      setStatus("success")
      setMessage("Conexão com o banco funcionando! As tabelas já existem.")
    } catch (error) {
      setStatus("error")
      setMessage("Tabelas não encontradas. Execute a configuração do banco.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Configuração do Sistema CMV</CardTitle>
            <CardDescription>Configure o banco de dados para o sistema da INOVA ECOPEÇAS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "idle" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Antes de usar o sistema, você precisa configurar o banco de dados.</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                onClick={testConnection}
                disabled={status === "loading"}
                variant="outline"
                className="w-full bg-transparent"
              >
                {status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Testar Conexão
              </Button>

              <Button onClick={createTables} disabled={status === "loading"} className="w-full">
                {status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Configurar Banco de Dados
              </Button>

              {status === "success" && (
                <Button onClick={() => (window.location.href = "/")} className="w-full bg-green-600 hover:bg-green-700">
                  Ir para o Sistema Principal
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Passo 1:</strong> Clique em "Testar Conexão" para verificar se o Supabase está funcionando
              </p>
              <p>
                <strong>Passo 2:</strong> Se der erro, clique em "Configurar Banco de Dados" para criar as tabelas
              </p>
              <p>
                <strong>Passo 3:</strong> Após sucesso, vá para o sistema principal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
