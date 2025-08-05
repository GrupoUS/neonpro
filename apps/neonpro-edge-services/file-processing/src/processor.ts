import type { DurableObject } from "@cloudflare/workers-types";

export interface FileProcessorState {
  fileId: string;
  status: "processing" | "completed" | "failed";
  progress: number;
  results?: {
    ocrText?: string;
    aiAnalysis?: {
      confidence: number;
      findings: string[];
      recommendations: string[];
      riskLevel: "low" | "medium" | "high";
    };
    virusScan?: {
      clean: boolean;
      threats?: string[];
    };
  };
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export class FileProcessor implements DurableObject {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    switch (request.method) {
      case "POST":
        if (path === "/process") {
          return this.processFile(request);
        }
        break;
      case "GET":
        if (path === "/status") {
          return this.getStatus();
        }
        break;
    }

    return new Response("Not Found", { status: 404 });
  }

  private async processFile(request: Request): Promise<Response> {
    try {
      const { fileId, documentType, requiresOCR, requiresAIAnalysis } = await request.json();

      // Initialize processing state
      const processorState: FileProcessorState = {
        fileId,
        status: "processing",
        progress: 0,
        startedAt: new Date().toISOString(),
      };

      await this.state.storage.put("state", processorState);

      // Start processing (fire and forget)
      this.processFileAsync(fileId, documentType, requiresOCR, requiresAIAnalysis);

      return new Response(JSON.stringify(processorState), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (_error) {
      return new Response(JSON.stringify({ error: "Failed to start processing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  private async processFileAsync(
    fileId: string,
    documentType: string,
    requiresOCR: boolean,
    requiresAIAnalysis: boolean,
  ): Promise<void> {
    try {
      const state = (await this.state.storage.get("state")) as FileProcessorState;

      // Step 1: Virus scan (10% progress)
      const virusResults = await this.performVirusScan(fileId);
      state.progress = 10;
      state.results = { virusScan: virusResults };
      await this.state.storage.put("state", state);

      if (!virusResults.clean) {
        state.status = "failed";
        state.error = `Virus detected: ${virusResults.threats?.join(", ")}`;
        await this.state.storage.put("state", state);
        return;
      }

      // Step 2: OCR Processing (50% progress)
      if (requiresOCR) {
        const ocrText = await this.performOCR(fileId, documentType);
        state.progress = 50;
        state.results!.ocrText = ocrText;
        await this.state.storage.put("state", state);
      }

      // Step 3: AI Analysis (90% progress)
      if (requiresAIAnalysis && state.results?.ocrText) {
        const aiAnalysis = await this.performAIAnalysis(state.results.ocrText, documentType);
        state.progress = 90;
        state.results!.aiAnalysis = aiAnalysis;
        await this.state.storage.put("state", state);
      }

      // Step 4: Complete processing
      state.status = "completed";
      state.progress = 100;
      state.completedAt = new Date().toISOString();
      await this.state.storage.put("state", state);

      // Store results in KV for faster access
      await this.env.FILE_PROCESSING_CACHE.put(
        `results:${fileId}`,
        JSON.stringify(state.results),
        { expirationTtl: 86400 }, // 24 hours
      );
    } catch (error) {
      const state = (await this.state.storage.get("state")) as FileProcessorState;
      state.status = "failed";
      state.error = error instanceof Error ? error.message : "Unknown error";
      await this.state.storage.put("state", state);
    }
  }

  private async performVirusScan(fileId: string): Promise<{ clean: boolean; threats?: string[] }> {
    // Get file from R2
    const fileObject = await this.env.MEDICAL_DOCUMENTS.get(fileId);
    if (!fileObject) {
      throw new Error("File not found");
    }

    // Simulate virus scanning - in production, integrate with ClamAV or similar
    const fileSize = fileObject.size;
    const suspicious = fileSize > 50 * 1024 * 1024; // Files > 50MB flagged as suspicious

    return {
      clean: !suspicious,
      threats: suspicious ? ["Large file detected"] : undefined,
    };
  }

  private async performOCR(fileId: string, documentType: string): Promise<string> {
    // Get file from R2
    const fileObject = await this.env.MEDICAL_DOCUMENTS.get(fileId);
    if (!fileObject) {
      throw new Error("File not found for OCR");
    }

    // Simulate OCR processing - in production, integrate with Tesseract.js or cloud OCR
    const mockOcrResults: Record<string, string> = {
      medical_report: `
        RELATÓRIO MÉDICO
        Paciente: João Silva
        Data: ${new Date().toLocaleDateString("pt-BR")}
        
        EXAME FÍSICO:
        - Pressão arterial: 120/80 mmHg
        - Frequência cardíaca: 72 bpm
        - Temperatura: 36.5°C
        
        DIAGNÓSTICO:
        Paciente apresenta quadro estável, sem alterações significativas.
        
        RECOMENDAÇÕES:
        - Manter medicação atual
        - Retorno em 30 dias
        
        Dr. Maria Santos
        CRM: 123456
      `,
      lab_result: `
        RESULTADO DE EXAME LABORATORIAL
        
        HEMOGRAMA COMPLETO:
        - Hemoglobina: 14.2 g/dL (Normal: 12-16)
        - Hematócrito: 42% (Normal: 37-47)
        - Leucócitos: 7.200/μL (Normal: 4.000-11.000)
        
        BIOQUÍMICA:
        - Glicose: 95 mg/dL (Normal: 70-100)
        - Colesterol total: 180 mg/dL (Normal: <200)
        
        Resultado dentro dos parâmetros normais.
      `,
      prescription: `
        RECEITA MÉDICA
        
        Paciente: João Silva
        Data: ${new Date().toLocaleDateString("pt-BR")}
        
        1. Losartana 50mg - 1 comprimido pela manhã por 30 dias
        2. Sinvastatina 20mg - 1 comprimido à noite por 30 dias
        
        Dr. Maria Santos
        CRM: 123456
      `,
    };

    return mockOcrResults[documentType] || "Texto extraído do documento médico.";
  }

  private async performAIAnalysis(
    _text: string,
    documentType: string,
  ): Promise<{
    confidence: number;
    findings: string[];
    recommendations: string[];
    riskLevel: "low" | "medium" | "high";
  }> {
    // Simulate AI analysis - in production, integrate with OpenAI, Anthropic, or medical AI services
    const analysisPatterns: Record<string, any> = {
      medical_report: {
        confidence: 0.92,
        findings: [
          "Sinais vitais dentro dos parâmetros normais",
          "Não foram identificadas alterações significativas",
          "Paciente apresenta quadro estável",
        ],
        recommendations: [
          "Manter acompanhamento médico regular",
          "Continuar medicação conforme prescrito",
          "Agendar retorno em 30 dias",
        ],
        riskLevel: "low" as const,
      },
      lab_result: {
        confidence: 0.95,
        findings: [
          "Hemograma completo dentro da normalidade",
          "Perfil lipídico adequado",
          "Glicemia em jejum normal",
        ],
        recommendations: [
          "Manter estilo de vida saudável",
          "Repetir exames em 6 meses",
          "Considerar suplementação se necessário",
        ],
        riskLevel: "low" as const,
      },
      prescription: {
        confidence: 0.88,
        findings: [
          "Medicações para controle de hipertensão e colesterol",
          "Dosagens apropriadas para o perfil do paciente",
          "Prescrição válida e legível",
        ],
        recommendations: [
          "Monitorar adesão ao tratamento",
          "Verificar possíveis interações medicamentosas",
          "Acompanhar evolução clínica",
        ],
        riskLevel: "medium" as const,
      },
    };

    return (
      analysisPatterns[documentType] || {
        confidence: 0.75,
        findings: ["Documento processado com sucesso"],
        recommendations: ["Revisar com profissional de saúde"],
        riskLevel: "low" as const,
      }
    );
  }

  private async getStatus(): Promise<Response> {
    const state = (await this.state.storage.get("state")) as FileProcessorState;

    if (!state) {
      return new Response(JSON.stringify({ error: "No processing state found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(state), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
