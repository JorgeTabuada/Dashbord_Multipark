"use client"

import Layout from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Video, HelpCircle, FileText, Play } from "lucide-react"

export default function FormacaoApoio() {
  const videoContent = [
    { id: 1, title: "Introdução ao Sistema Multipark", duration: "15 min", category: "Básico", type: "video" },
    { id: 2, title: "Como usar a Caixa Multipark", duration: "20 min", category: "Operacional", type: "video" },
    {
      id: 3,
      title: "Gestão de Reservas - Tutorial Completo",
      duration: "25 min",
      category: "Operacional",
      type: "video",
    },
  ]

  const articles = [
    { id: 1, title: "Manual do Utilizador - Versão 2.0", category: "Documentação", type: "article" },
    { id: 2, title: "Procedimentos de Segurança", category: "Segurança", type: "article" },
    { id: 3, title: "Resolução de Problemas Comuns", category: "Suporte", type: "article" },
  ]

  const faqs = [
    { id: 1, question: "Como alterar a minha palavra-passe?", category: "Conta" },
    { id: 2, question: "O que fazer se o sistema não responder?", category: "Técnico" },
    { id: 3, question: "Como exportar relatórios?", category: "Relatórios" },
  ]

  return (
    <Layout title="Formação & Apoio">
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="videos">Vídeos de Formação</TabsTrigger>
          <TabsTrigger value="artigos">Artigos e Manuais</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoContent.map((video) => (
              <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-full h-32 bg-gray-100 rounded-lg mb-4">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{video.category}</Badge>
                    <span className="text-sm text-gray-600">{video.duration}</span>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    <Video className="w-4 h-4 mr-2" />
                    Assistir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="artigos" className="space-y-6">
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{article.title}</h3>
                        <Badge variant="outline">{article.category}</Badge>
                      </div>
                    </div>
                    <Button variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <HelpCircle className="w-8 h-8 text-orange-600" />
                      <div>
                        <h3 className="font-semibold">{faq.question}</h3>
                        <Badge variant="outline">{faq.category}</Badge>
                      </div>
                    </div>
                    <Button variant="outline">Ver Resposta</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  )
}
