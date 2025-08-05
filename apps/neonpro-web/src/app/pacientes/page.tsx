'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, UserPlus, Users, Calendar, Stethoscope, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// NeonGradientCard com todas as animações do Dashboard
const NeonGradientCard = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <motion.div
    className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 via-blue-900/20 to-slate-800/90 backdrop-blur-xl border border-blue-500/20 p-6 ${className}`}
    whileHover={{ 
      scale: 1.02,
      borderColor: "rgb(59 130 246 / 0.5)",
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(59 130 246 / 0.1)"
    }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/5 to-purple-600/0"
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    <div className="relative z-10">
      {children}
    </div>
  </motion.div>
)

// CosmicGlowButton com todos os efeitos do Dashboard
const CosmicGlowButton = ({ children, variant = "default", size = "default", className = "", ...props }: { 
  children: React.ReactNode, 
  variant?: string, 
  size?: string, 
  className?: string,
  [key: string]: any 
}) => (
  <motion.button
    className={`relative overflow-hidden rounded-lg px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 ${className}`}
    whileHover={{ 
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgb(59 130 246 / 0.3), 0 10px 10px -5px rgb(59 130 246 / 0.2)"
    }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      initial={{ x: "-100%" }}
      whileHover={{ x: "100%" }}
      transition={{ duration: 0.6 }}
    />
    <span className="relative z-10 flex items-center gap-2">
      {children}
    </span>
  </motion.button>
)

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const patients = [
    {
      id: 1,
      name: "Ana Silva",
      email: "ana.silva@email.com",
      phone: "(11) 99999-1234",
      lastVisit: "2024-07-28",
      nextAppointment: "2024-08-05",
      treatments: ["Botox", "Preenchimento"],
      status: "Ativo",
      rating: 5
    },
    {
      id: 2,
      name: "Carlos Santos",
      email: "carlos.santos@email.com", 
      phone: "(11) 99999-5678",
      lastVisit: "2024-07-25",
      nextAppointment: "2024-08-10",
      treatments: ["Harmonização Facial"],
      status: "Ativo",
      rating: 4
    },
    {
      id: 3,
      name: "Mariana Costa",
      email: "mariana.costa@email.com",
      phone: "(11) 99999-9012",
      lastVisit: "2024-07-20",
      nextAppointment: null,
      treatments: ["Limpeza de Pele", "Peeling"],
      status: "Inativo",
      rating: 5
    }
  ]

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Background Animation - Exato como no Dashboard */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgb(120, 119, 198, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgb(255, 119, 198, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 40%, rgb(120, 219, 255, 0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 80% 80%, rgb(59, 130, 246, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, rgb(147, 51, 234, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 60% 60%, rgb(16, 185, 129, 0.4) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
      />

      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Gerenciamento de Pacientes
              </motion.h1>
              <motion.p 
                className="text-slate-400 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Gerencie perfis, histórico e tratamentos dos seus pacientes
              </motion.p>
            </div>
            <CosmicGlowButton>
              <UserPlus className="w-4 h-4" />
              Novo Paciente
            </CosmicGlowButton>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-500/20">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Total de Pacientes</p>
                    <p className="text-2xl font-bold text-white">1,234</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-500/20">
                    <UserPlus className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Novos (Este Mês)</p>
                    <p className="text-2xl font-bold text-white">156</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-500/20">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Consultas Hoje</p>
                    <p className="text-2xl font-bold text-white">28</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-500/20">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Satisfação Média</p>
                    <p className="text-2xl font-bold text-white">4.8</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <NeonGradientCard className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar pacientes por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    Todos
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    Ativos
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    Inativos
                  </Button>
                </div>
              </div>
            </NeonGradientCard>
          </motion.div>

          {/* Patients List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <NeonGradientCard>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">Lista de Pacientes</h3>
                
                {filteredPatients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{patient.name}</h4>
                        <p className="text-sm text-slate-400">{patient.email}</p>
                        <p className="text-sm text-slate-400">{patient.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">Última consulta:</p>
                        <p className="text-sm text-slate-400">{patient.lastVisit}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">Próxima consulta:</p>
                        <p className="text-sm text-slate-400">
                          {patient.nextAppointment || 'Não agendado'}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {patient.treatments.map((treatment, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                            {treatment}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < patient.rating ? 'text-yellow-400 fill-current' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <Badge 
                        variant={patient.status === 'Ativo' ? 'default' : 'secondary'}
                        className={patient.status === 'Ativo' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}
                      >
                        {patient.status}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                          Ver Perfil
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </NeonGradientCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
