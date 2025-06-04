import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runCompleteDiagnostic } from '@/utils/debugTest';
import { runAllTransactionTests } from '@/utils/transactionDebugger';

export const SupabaseDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string>('');

  const handleRunDiagnostic = async () => {
    setIsRunning(true);
    setResults('');
    
    // Capturar logs do console
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    let output = '';
    
    console.log = (...args) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };
    
    console.error = (...args) => {
      output += '❌ ' + args.join(' ') + '\n';
      originalError(...args);
    };
    
    console.warn = (...args) => {
      output += '⚠️ ' + args.join(' ') + '\n';
      originalWarn(...args);
    };
    
    try {
      await runCompleteDiagnostic();
      
      // Adicionar teste específico de transações
      output += '\n\n';
      await runAllTransactionTests();
    } catch (error) {
      output += `❌ Erro crítico: ${error}\n`;
    }
    
    // Restaurar console
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    
    setResults(output);
    setIsRunning(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Diagnóstico da Integração Supabase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleRunDiagnostic} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Executando Diagnóstico...' : 'Executar Diagnóstico Completo'}
        </Button>
        
        {results && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Resultados:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap font-mono">
              {results}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
