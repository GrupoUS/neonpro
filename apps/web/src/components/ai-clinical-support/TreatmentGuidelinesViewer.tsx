'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { GuidelineSection, TreatmentGuideline } from '@/types/ai-clinical-support'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertTriangle,
  Bookmark,
  BookmarkPlus,
  BookOpen,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Image,
  Link,
  Search,
  Star,
  Video,
} from 'lucide-react'
import React, { useState } from 'react'

interface TreatmentGuidelinesViewerProps {
  procedureId?: string
  category?: string
  searchQuery?: string
  onGuidelineSelect?: (guideline: TreatmentGuideline) => void
}

export function TreatmentGuidelinesViewer({
  procedureId,
  category,
  searchQuery,
  onGuidelineSelect: _onGuidelineSelect,
}: TreatmentGuidelinesViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState(category || 'all')
  const [searchTerm, setSearchTerm] = useState(searchQuery || '')
  const [selectedGuideline, setSelectedGuideline] = useState<TreatmentGuideline | null>(null)
  const [activeTab, setActiveTab] = useState('browse')
  const [bookmarks, setBookmarks] = useState<string[]>([])

  // Fetch treatment guidelines
  const { data: guidelines, isLoading, error } = useQuery({
    queryKey: ['treatment-guidelines', procedureId, selectedCategory, searchTerm],
    queryFn: async () => {
      return await api.aiClinicalSupport.generateTreatmentGuidelines({
        procedureId,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        searchQuery: searchTerm,
        includeReferences: true,
        includeMultimedia: true,
      })
    },
    enabled: true,
  })

  const toggleBookmark = (guidelineId: string) => {
    setBookmarks((prev) =>
      prev.includes(guidelineId)
        ? prev.filter((id) => id !== guidelineId)
        : [...prev, guidelineId]
    )
  }

  const filteredGuidelines = guidelines?.guidelines.filter((guideline) => {
    const matchesSearch = !searchTerm
      || guideline.title.toLowerCase().includes(searchTerm.toLowerCase())
      || guideline.description.toLowerCase().includes(searchTerm.toLowerCase())
      || guideline.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || guideline.category === selectedCategory

    return matchesSearch && matchesCategory
  }) || []

  const categories = [
    { id: 'all', label: 'Todos', count: guidelines?.guidelines.length || 0 },
    {
      id: 'botulinum_toxin',
      label: 'Toxina Botulínica',
      count: guidelines?.guidelines.filter((g) => g.category === 'botulinum_toxin').length || 0,
    },
    {
      id: 'fillers',
      label: 'Preenchimentos',
      count: guidelines?.guidelines.filter((g) => g.category === 'fillers').length || 0,
    },
    {
      id: 'laser',
      label: 'Laser',
      count: guidelines?.guidelines.filter((g) => g.category === 'laser').length || 0,
    },
    {
      id: 'chemical_peels',
      label: 'Peelings Químicos',
      count: guidelines?.guidelines.filter((g) => g.category === 'chemical_peels').length || 0,
    },
    {
      id: 'thread_lift',
      label: 'Fios de Sustentação',
      count: guidelines?.guidelines.filter((g) => g.category === 'thread_lift').length || 0,
    },
    {
      id: 'skin_care',
      label: 'Cuidados com a Pele',
      count: guidelines?.guidelines.filter((g) => g.category === 'skin_care').length || 0,
    },
  ]

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-orange-100 text-orange-800'
      case 'expert_opinion':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'basic':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded mb-4'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Erro ao carregar diretrizes</AlertTitle>
        <AlertDescription>
          Não foi possível carregar as diretrizes de tratamento. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    )
  }

  if (!guidelines) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>
            <BookOpen className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Diretrizes de Tratamento
            </h3>
            <p className='text-gray-500 mb-4'>
              Aces diretrizes baseadas em evidências para procedimentos estéticos.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Diretrizes de Tratamento
          </h2>
          <p className='text-gray-600 mt-1'>
            Base de conhecimento baseada em evidências científicas
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' className='flex items-center gap-2'>
            <Download className='h-4 w-4' />
            Exportar
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Buscar diretrizes...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='md:w-64'>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder='Categoria' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-4 w-4 text-blue-500' />
              <div>
                <div className='text-sm text-gray-500'>Total de Diretrizes</div>
                <div className='text-lg font-bold'>{guidelines.guidelines.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 text-yellow-500' />
              <div>
                <div className='text-sm text-gray-500'>Evidência Alta</div>
                <div className='text-lg font-bold'>
                  {guidelines.guidelines.filter((g) => g.evidenceLevel === 'high').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-green-500' />
              <div>
                <div className='text-sm text-gray-500'>Atualizadas</div>
                <div className='text-lg font-bold'>
                  {guidelines.guidelines.filter((g) => {
                    const lastUpdate = new Date(g.lastUpdated)
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return lastUpdate > thirtyDaysAgo
                  }).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Bookmark className='h-4 w-4 text-purple-500' />
              <div>
                <div className='text-sm text-gray-500'>Salvas</div>
                <div className='text-lg font-bold'>{bookmarks.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='browse'>Navegar</TabsTrigger>
          <TabsTrigger value='bookmarks'>Salvas</TabsTrigger>
          <TabsTrigger value='references'>Referências</TabsTrigger>
        </TabsList>

        {/* Browse Guidelines */}
        <TabsContent value='browse' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Guidelines List */}
            <div className='lg:col-span-1 space-y-4'>
              <h3 className='text-lg font-medium'>Diretrizes ({filteredGuidelines.length})</h3>
              <div className='space-y-3'>
                {filteredGuidelines.map((guideline) => (
                  <GuidelineCard
                    key={guideline.id}
                    guideline={guideline}
                    isSelected={selectedGuideline?.id === guideline.id}
                    onClick={() => setSelectedGuideline(guideline)}
                    isBookmarked={bookmarks.includes(guideline.id)}
                    onBookmark={() => toggleBookmark(guideline.id)}
                    getEvidenceColor={getEvidenceColor}
                    getComplexityColor={getComplexityColor}
                  />
                ))}
              </div>
            </div>

            {/* Guideline Detail */}
            <div className='lg:col-span-2'>
              {selectedGuideline ? <GuidelineDetail guideline={selectedGuideline} /> : (
                <Card>
                  <CardContent className='p-6'>
                    <div className='text-center'>
                      <FileText className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        Selecione uma Diretriz
                      </h3>
                      <p className='text-gray-500'>
                        Escolha uma diretriz da lista para visualizar os detalhes completos.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Bookmarked Guidelines */}
        <TabsContent value='bookmarks' className='space-y-4'>
          {bookmarks.length === 0
            ? (
              <Card>
                <CardContent className='p-6'>
                  <div className='text-center'>
                    <Bookmark className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      Nenhuma diretriz salva
                    </h3>
                    <p className='text-gray-500'>
                      Salve diretrizes importantes para acesso rápido.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
            : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {guidelines.guidelines
                  .filter((g) => bookmarks.includes(g.id))
                  .map((guideline) => (
                    <GuidelineCard
                      key={guideline.id}
                      guideline={guideline}
                      isSelected={selectedGuideline?.id === guideline.id}
                      onClick={() => setSelectedGuideline(guideline)}
                      isBookmarked={true}
                      onBookmark={() => toggleBookmark(guideline.id)}
                      getEvidenceColor={getEvidenceColor}
                      getComplexityColor={getComplexityColor}
                    />
                  ))}
              </div>
            )}
        </TabsContent>

        {/* References */}
        <TabsContent value='references' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Link className='h-5 w-5' />
                Bibliografia de Referências
              </CardTitle>
              <CardDescription>
                Fontes científicas e referências utilizadas nas diretrizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {guidelines.references.map((reference, index) => (
                  <div key={index} className='border-l-4 border-blue-500 pl-4'>
                    <h4 className='font-medium'>{reference.title}</h4>
                    <p className='text-sm text-gray-600 mb-2'>{reference.authors}</p>
                    <p className='text-sm text-gray-500 mb-2'>
                      {reference.journal} • {reference.year}
                    </p>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline'>{reference.type}</Badge>
                      {reference.doi && (
                        <Button variant='ghost' size='sm' className='h-6 text-xs'>
                          <ExternalLink className='h-3 w-3 mr-1' />
                          DOI
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface GuidelineCardProps {
  guideline: TreatmentGuideline
  isSelected: boolean
  onClick: () => void
  isBookmarked: boolean
  onBookmark: () => void
  getEvidenceColor: (level: string) => string
  getComplexityColor: (level: string) => string
}

function GuidelineCard({
  guideline,
  isSelected,
  onClick,
  isBookmarked,
  onBookmark,
  getEvidenceColor,
  getComplexityColor,
}: GuidelineCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <CardTitle className='text-sm line-clamp-2'>{guideline.title}</CardTitle>
            <CardDescription className='text-xs mt-1'>
              {guideline.description.length > 80
                ? guideline.description.substring(0, 80) + '...'
                : guideline.description}
            </CardDescription>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={(e) => {
              e.stopPropagation()
              onBookmark()
            }}
            className='ml-2 flex-shrink-0'
          >
            {isBookmarked
              ? <Bookmark className='h-4 w-4 fill-current text-yellow-500' />
              : <BookmarkPlus className='h-4 w-4 text-gray-400' />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline' className={getEvidenceColor(guideline.evidenceLevel)}>
            {guideline.evidenceLevel === 'high'
              ? 'Alta'
              : guideline.evidenceLevel === 'moderate'
              ? 'Moderada'
              : guideline.evidenceLevel === 'low'
              ? 'Baixa'
              : guideline.evidenceLevel === 'expert_opinion'
              ? 'Opinião Especialista'
              : guideline.evidenceLevel}
          </Badge>
          <Badge variant='outline' className={getComplexityColor(guideline.complexity)}>
            {guideline.complexity === 'basic'
              ? 'Básico'
              : guideline.complexity === 'intermediate'
              ? 'Intermediário'
              : guideline.complexity === 'advanced'
              ? 'Avançado'
              : guideline.complexity}
          </Badge>
          <span className='text-xs text-gray-500'>
            {format(new Date(guideline.lastUpdated), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
        <div className='flex flex-wrap gap-1 mt-2'>
          {guideline.tags.slice(0, 3).map((tag) => (
            <span key={tag} className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
              {tag}
            </span>
          ))}
          {guideline.tags.length > 3 && (
            <span className='text-xs text-gray-500'>+{guideline.tags.length - 3}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface GuidelineDetailProps {
  guideline: TreatmentGuideline
}

function GuidelineDetail({ guideline }: GuidelineDetailProps) {
  return (
    <div className='space-y-4'>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <CardTitle className='text-xl'>{guideline.title}</CardTitle>
              <CardDescription className='mt-2'>
                {guideline.description}
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center gap-2 mt-4'>
            <Badge variant='outline' className='bg-green-100 text-green-800'>
              {guideline.evidenceLevel === 'high'
                ? 'Evidência Alta'
                : guideline.evidenceLevel === 'moderate'
                ? 'Evidência Moderada'
                : guideline.evidenceLevel === 'low'
                ? 'Evidência Baixa'
                : guideline.evidenceLevel === 'expert_opinion'
                ? 'Opinião de Especialista'
                : guideline.evidenceLevel}
            </Badge>
            <Badge variant='outline'>
              {guideline.complexity === 'basic'
                ? 'Básico'
                : guideline.complexity === 'intermediate'
                ? 'Intermediário'
                : guideline.complexity === 'advanced'
                ? 'Avançado'
                : guideline.complexity}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Content Sections */}
      {guideline.sections.map((section, index) => <SectionContent key={index} section={section} />)}

      {/* References */}
      {guideline.references && guideline.references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Link className='h-5 w-5' />
              Referências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {guideline.references.map((reference, index) => (
                <div key={index} className='text-sm'>
                  <div className='font-medium'>{reference.title}</div>
                  <div className='text-gray-600'>{reference.authors}</div>
                  <div className='text-gray-500'>{reference.journal} ({reference.year})</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multimedia */}
      {guideline.multimedia && guideline.multimedia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Image className='h-5 w-5' />
              Multimídia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {guideline.multimedia.map((media, index) => (
                <div key={index} className='border rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    {media.type === 'image'
                      ? <Image className='h-4 w-4' />
                      : media.type === 'video'
                      ? <Video className='h-4 w-4' />
                      : <FileText className='h-4 w-4' />}
                    <span className='text-sm font-medium'>{media.title}</span>
                  </div>
                  <p className='text-sm text-gray-600'>{media.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface SectionContentProps {
  section: GuidelineSection
}

function SectionContent({ section }: SectionContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='prose prose-sm max-w-none'>
          {section.content}
        </div>

        {section.subsections && section.subsections.length > 0 && (
          <div className='mt-4 space-y-4'>
            {section.subsections.map((subsection, index) => (
              <div key={index} className='border-l-4 border-gray-200 pl-4'>
                <h4 className='font-medium'>{subsection.title}</h4>
                <div className='prose prose-sm max-w-none mt-2'>
                  {subsection.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {section.keyPoints && section.keyPoints.length > 0 && (
          <div className='mt-4'>
            <h4 className='font-medium mb-2'>Pontos Chave</h4>
            <ul className='list-disc list-inside space-y-1'>
              {section.keyPoints.map((point, index) => (
                <li key={index} className='text-sm'>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
