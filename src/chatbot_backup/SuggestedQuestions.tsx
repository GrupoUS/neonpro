'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  PiggyBank, // Manter por enquanto, pode ser substituído por algo como Stethoscope ou ClipboardList
  CreditCard, // Manter por enquanto, pode ser substituído por algo como UserPlus ou CalendarPlus
  Calendar,
  BarChart3,
  Target,
  AlertCircle,
  Wallet // Manter por enquanto, pode ser substituído por algo como FileText
} from "lucide-react";

interface SuggestedQuestionsProps {
  onQuestionSelect: (question: string) => void;
}

const SuggestedQuestions = ({ onQuestionSelect }: SuggestedQuestionsProps) => {
  const questions = [
    {
      icon: <BarChart3 className="h-4 w-4" />,
      text: "Analise os agendamentos do mês atual", // Adaptado
      category: "Gestão" // Adaptado
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      text: "Adicione um novo paciente", // Adaptado
      category: "Paciente" // Adaptado
    },
    {
      icon: <PiggyBank className="h-4 w-4" />,
      text: "Agende uma consulta", // Adaptado
      category: "Agendamento" // Adaptado
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      text: "Mostre os agendamentos pendentes", // Adaptado
      category: "Status" // Adaptado
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      text: "Qual o status da clínica?", // Adaptado
      category: "Insights"
    },
    {
      icon: <Target className="h-4 w-4" />,
      text: "Dicas para otimizar a gestão da clínica", // Adaptado
      category: "Otimização" // Adaptado
    },
    {
      icon: <Wallet className="h-4 w-4" />,
      text: "Qual serviço é mais procurado?", // Adaptado
      category: "Gestão" // Adaptado
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      text: "Adicione um histórico médico", // Adaptado
      category: "Paciente" // Adaptado
    }
  ];

  const categories = {
    "Gestão": "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800", // Adaptado
    "Paciente": "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800", // Adaptado
    "Agendamento": "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800", // Adaptado
    "Status": "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800", // Adaptado
    "Insights": "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800",
    "Otimização": "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800" // Adaptado
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
            <div>📊 Análise de tendências</div> {/* Adaptado */}
            <div>🎯 Metas de crescimento</div> {/* Adaptado */}
            <div>📈 Relatórios de desempenho</div> {/* Adaptado */}
            <div>🔔 Alertas de agendamento</div> {/* Adaptado */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedQuestions;
