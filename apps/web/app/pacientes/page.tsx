'use client';

import { motion } from 'framer-motion';
import { Calendar, Search, Star, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// NeonGradientCard com todas as animações do Dashboard
const NeonGradientCard = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <motion.div
    className={`relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-slate-900/90 via-blue-900/20 to-slate-800/90 p-6 backdrop-blur-xl ${className}`}
    transition={{ duration: 0.2 }}
    whileHover={{
      scale: 1.02,
      borderColor: 'rgb(59 130 246 / 0.5)',
      boxShadow:
        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(59 130 246 / 0.1)',
    }}
    {...props}
  >
    <motion.div
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/5 to-purple-600/0"
      transition={{
        duration: 8,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      }}
    />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

// CosmicGlowButton com todos os efeitos do Dashboard
const CosmicGlowButton = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: string;
  size?: string;
  className?: string;
  [key: string]: any;
}) => (
  <motion.button
    className={`relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 px-6 py-3 font-medium text-white transition-all duration-300 hover:shadow-blue-500/25 hover:shadow-lg ${className}`}
    whileHover={{
      scale: 1.05,
      boxShadow:
        '0 20px 25px -5px rgb(59 130 246 / 0.3), 0 10px 10px -5px rgb(59 130 246 / 0.2)',
    }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      initial={{ x: '-100%' }}
      transition={{ duration: 0.6 }}
      whileHover={{ x: '100%' }}
    />
    <span className="relative z-10 flex items-center gap-2">{children}</span>
  </motion.button>
);

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    {
      id: 1,
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      phone: '(11) 99999-1234',
      lastVisit: '2024-07-28',
      nextAppointment: '2024-08-05',
      treatments: ['Botox', 'Preenchimento'],
      status: 'Ativo',
      rating: 5,
    },
    {
      id: 2,
      name: 'Carlos Santos',
      email: 'carlos.santos@email.com',
      phone: '(11) 99999-5678',
      lastVisit: '2024-07-25',
      nextAppointment: '2024-08-10',
      treatments: ['Harmonização Facial'],
      status: 'Ativo',
      rating: 4,
    },
    {
      id: 3,
      name: 'Mariana Costa',
      email: 'mariana.costa@email.com',
      phone: '(11) 99999-9012',
      lastVisit: '2024-07-20',
      nextAppointment: null,
      treatments: ['Limpeza de Pele', 'Peeling'],
      status: 'Inativo',
      rating: 5,
    },
  ];

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Background Animation - Exato como no Dashboard */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 20% 80%, rgb(120, 119, 198, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgb(255, 119, 198, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 40%, rgb(120, 219, 255, 0.3) 0%, transparent 50%)',
          ],
        }}
        className="absolute inset-0 opacity-30"
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
      />

      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 80% 80%, rgb(59, 130, 246, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 20%, rgb(147, 51, 234, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 60% 60%, rgb(16, 185, 129, 0.4) 0%, transparent 50%)',
          ],
        }}
        className="absolute inset-0 opacity-20"
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          delay: 2,
        }}
      />

      <div className="relative z-10 p-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <motion.h1
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text font-bold text-4xl text-transparent"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Gerenciamento de Pacientes
              </motion.h1>
              <motion.p
                animate={{ opacity: 1, x: 0 }}
                className="mt-2 text-slate-400"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Gerencie perfis, histórico e tratamentos dos seus pacientes
              </motion.p>
            </div>
            <CosmicGlowButton>
              <UserPlus className="h-4 w-4" />
              Novo Paciente
            </CosmicGlowButton>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-500/20 p-3">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-slate-400 text-sm">
                      Total de Pacientes
                    </p>
                    <p className="font-bold text-2xl text-white">1,234</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="rounded-full bg-green-500/20 p-3">
                    <UserPlus className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-slate-400 text-sm">
                      Novos (Este Mês)
                    </p>
                    <p className="font-bold text-2xl text-white">156</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-500/20 p-3">
                    <Calendar className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-slate-400 text-sm">
                      Consultas Hoje
                    </p>
                    <p className="font-bold text-2xl text-white">28</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="rounded-full bg-yellow-500/20 p-3">
                    <Star className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-slate-400 text-sm">
                      Satisfação Média
                    </p>
                    <p className="font-bold text-2xl text-white">4.8</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <NeonGradientCard className="mb-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    className="border-slate-600 bg-slate-800/50 pl-9 text-white placeholder:text-slate-400"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar pacientes por nome ou email..."
                    value={searchTerm}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    variant="outline"
                  >
                    Todos
                  </Button>
                  <Button
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    variant="outline"
                  >
                    Ativos
                  </Button>
                  <Button
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    variant="outline"
                  >
                    Inativos
                  </Button>
                </div>
              </div>
            </NeonGradientCard>
          </motion.div>

          {/* Patients List */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <NeonGradientCard>
              <div className="space-y-4">
                <h3 className="mb-4 font-semibold text-white text-xl">
                  Lista de Pacientes
                </h3>

                {filteredPatients.map((patient, index) => (
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4 transition-colors hover:bg-slate-700/50"
                    initial={{ opacity: 0, x: -20 }}
                    key={patient.id}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {patient.name}
                        </h4>
                        <p className="text-slate-400 text-sm">
                          {patient.email}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {patient.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-sm text-white">
                          Última consulta:
                        </p>
                        <p className="text-slate-400 text-sm">
                          {patient.lastVisit}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-sm text-white">
                          Próxima consulta:
                        </p>
                        <p className="text-slate-400 text-sm">
                          {patient.nextAppointment || 'Não agendado'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {patient.treatments.map((treatment, idx) => (
                          <Badge
                            className="bg-blue-500/20 text-blue-300 text-xs"
                            key={idx}
                            variant="secondary"
                          >
                            {treatment}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            className={`h-4 w-4 ${
                              i < patient.rating
                                ? 'fill-current text-yellow-400'
                                : 'text-slate-600'
                            }`}
                            key={i}
                          />
                        ))}
                      </div>

                      <Badge
                        className={
                          patient.status === 'Ativo'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-slate-500/20 text-slate-300'
                        }
                        variant={
                          patient.status === 'Ativo' ? 'default' : 'secondary'
                        }
                      >
                        {patient.status}
                      </Badge>

                      <div className="flex space-x-2">
                        <Button
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          size="sm"
                          variant="outline"
                        >
                          Ver Perfil
                        </Button>
                        <Button
                          className="bg-blue-600 text-white hover:bg-blue-700"
                          size="sm"
                        >
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
  );
}
