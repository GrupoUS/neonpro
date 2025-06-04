'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar,
  User,
  Stethoscope,
  ClipboardList,
  BarChart3,
  Lightbulb,
  Wallet, // Manter se houver algo similar a "carteira" no contexto clínico
  AlertCircle
} from "lucide-react"; // Ícones adaptados para o contexto clínico

interface SuggestedQuestionsProps {
  onQuestionSelect: (question: string) => void;
}

const SuggestedQuestions = ({ onQuestionSelect }: SuggestedQuestionsProps) => {
  const questions = [
    {
      icon: <BarChart3 className="h-4 w-4" />,
      text: "Analise meus atendimentos do mês atual",
      category: "Análise"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      text: "Agendar consulta para João Silva amanhã",
      category: "Agendamento"
    },
    {
      icon: <User className="h-4 w-4" />,
      text: "Cadastrar novo paciente Maria",
      category: "Paciente"
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      text: "Mostre meus agendamentos próximos",
      category: "Agendamento"
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "Como está a saúde da minha clínica?",
      category: "Insights"
    },
    {
      icon: <Stethoscope className="h-4 w-4" />,
      text: "Cadastrar serviço de Odontologia",
      category: "Serviço"
    },
    {
      icon: <Wallet className="h-4 w-4" />, // Manter se relevante
      text: "Qual serviço eu mais realizo?",
      category: "Análise"
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      text: "Cancelar consulta com ID [ID_DA_CONSULTA]",
      category: "Agendamento"
    }
  ];

  const categories = {
    "Análise": "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    "Agendamento": "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    "Paciente": "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
    "Serviço": "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
    "Insights": "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800",
    "Lembretes": "bg-accent/10 dark:bg-accent/20 border-accent/30 dark:border-accent" // Manter se relevante
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          💡 Experimente estas perguntas:
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {questions.map((question, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
              categories[question.category as keyof typeof categories]
            }`}
            onClick={() => onQuestionSelect(question.text)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {question.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-relaxed">
                    {question.text}
                  </p>
                  <span className="text-xs text-muted-foreground mt-1 inline-block">
                    {question.category}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <h5 className="text-sm font-semibold mb-2 text-blue-800 dark:text-blue-200">
            🚀 Recursos Avançados
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700 dark:text-blue-300">
            <div>📊 Análise de padrões de agendamento</div>
            <div>🎯 Metas de atendimento</div>
            <div>📈 Relatórios de produtividade</div>
            <div>🔔 Alertas de pacientes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedQuestions;
