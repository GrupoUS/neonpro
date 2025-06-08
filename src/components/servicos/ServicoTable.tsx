import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

interface ServicoTableProps {
  servicos: ServiceRow[];
  onEdit: (servico: ServiceRow) => void;
  onDelete: (id: string) => void;
}

const ServicoTable: React.FC<ServicoTableProps> = ({
  servicos,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-4 font-medium">Nome</th>
            <th className="text-left p-4 font-medium">Preço</th>
            <th className="text-left p-4 font-medium">Duração</th>
            <th className="text-left p-4 font-medium">Descrição</th>
            <th className="text-right p-4 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {servicos.map((servico) => (
            <tr
              key={servico.id}
              className="border-b border-border hover:bg-muted/50"
            >
              <td className="p-4 font-medium">{servico.name}</td>
              <td className="p-4">
                R${" "}
                {servico.price.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="p-4">{servico.duration} min</td>
              <td className="p-4 text-muted-foreground">
                {servico.description || "Sem descrição"}
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(servico)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(servico.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicoTable;
