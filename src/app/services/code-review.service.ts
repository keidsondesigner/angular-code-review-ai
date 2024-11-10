import { Injectable } from '@angular/core';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CodeAnalysis {
  quality: string;
  recommendations: string[];
  improvedCode: string;
  performance: string[];
  security: string[];
  bestPractices: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CodeReviewService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');

  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  error$: Observable<string> = this.errorSubject.asObservable();

  constructor() {
    this.genAI = new GoogleGenerativeAI(
      'AIzaSyAsCEsDMYbaBsAiBAl7TyEWcPVGWcVLuX0'
    );

    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });
  }

  async analyzeCode(code: string, framework: string): Promise<CodeAnalysis> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');

    try {
      const prompt = this.buildPrompt(code, framework);

      const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      const response = await result.response;
      const text = response.text();

      try {
        const analysis = this.parseAnalysis(text);
        this.loadingSubject.next(false);
        return analysis;
      } catch (parseError) {
        console.error('Erro ao processar resposta:', parseError);
        this.errorSubject.next('Falha ao processar a resposta da análise');
        return this.getDefaultAnalysis();
      }
    } catch (error) {
      this.loadingSubject.next(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Falha ao analisar o código';
      this.errorSubject.next(errorMessage);
      return this.getDefaultAnalysis();
    }
  }

  private buildPrompt(code: string, framework: string): string {
    return `Atue como um revisor de código especialista em ${framework}. Analise o código e retorne uma análise em JSON sem formatação markdown.

    CÓDIGO PARA ANÁLISE:
    ${code}

    IMPORTANTE: Primeiro verifique o framework do código. RETORNE apenas um objeto JSON simples com esta estrutura exata (sem blocos de código ou markdown):

    Se o código NÃO for do framework ${framework}, retorne APENAS este JSON:
    {
      "quality": "Este código não é do ${framework}",
      "recommendations": ["Este código parece ser de outro framework ou tecnologia"],
      "improvedCode": "",
      "performance": [],
      "security": [],
      "bestPractices": []
    }

    Se o código FOR do framework ${framework}, sua resposta deve ser um objeto JSON com a seguinte estrutura exata (sem blocos de código ou markdown):
    {
      "quality": "Descrição da qualidade do código",
      "recommendations": ["Recomendação 1", "Recomendação 2"],
      "improvedCode": "Código melhorado com escapes apropriados",
      "performance": ["Sugestão 1", "Sugestão 2"],
      "security": ["Segurança 1", "Segurança 2"],
      "bestPractices": ["Prática 1", "Prática 2"]
    }

    REGRAS:
    1. NÃO use blocos de código markdown o simbolo de CRASE
    2. Use apenas aspas duplas
    3. Escape caracteres especiais
    4. NÃO inclua explicações antes ou depois do JSON

    Se perguntado sobre algo que não está no código, explique educadamente que você só pode fornecer informações sobre a análise.`;
  }

  private parseAnalysis(response: string): CodeAnalysis {
    try {
      // Se a resposta for um objeto, converte para string
      const responseStr =
        typeof response === 'object' ? JSON.stringify(response) : response;

      // Verifica se é uma resposta do Gemini
      if (responseStr.includes('"candidates"')) {
        const geminiResponse = JSON.parse(responseStr);
        const candidateText =
          geminiResponse.candidates[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
          throw new Error('Estrutura de resposta inválida');
        }

        // Parse do texto do candidato
        const parsedAnalysis = JSON.parse(candidateText);

        // Retorna o objeto formatado
        return {
          quality: this.sanitizeString(parsedAnalysis.quality),
          recommendations: this.sanitizeArray(parsedAnalysis.recommendations),
          improvedCode: this.sanitizeString(parsedAnalysis.improvedCode),
          performance: this.sanitizeArray(parsedAnalysis.performance),
          security: this.sanitizeArray(parsedAnalysis.security),
          bestPractices: this.sanitizeArray(parsedAnalysis.bestPractices),
        };
      }

      // Caso seja uma string JSON direta
      const parsedResponse = JSON.parse(responseStr);

      return {
        quality: this.sanitizeString(parsedResponse.quality),
        recommendations: this.sanitizeArray(parsedResponse.recommendations),
        improvedCode: this.sanitizeString(parsedResponse.improvedCode),
        performance: this.sanitizeArray(parsedResponse.performance),
        security: this.sanitizeArray(parsedResponse.security),
        bestPractices: this.sanitizeArray(parsedResponse.bestPractices),
      };
    } catch (error) {
      console.error('Erro ao processar análise:', error);
      throw new Error('Falha ao processar a análise do código');
    }
  }

  private sanitizeString(value: any): string {
    if (!value) return '';
    return typeof value === 'string' ? value.trim() : String(value).trim();
  }

  private sanitizeArray(value: any): string[] {
    if (!value) return [];
    if (typeof value === 'string') return [value.trim()];
    return Array.isArray(value)
      ? value.map((item) => this.sanitizeString(item)).filter(Boolean)
      : [];
  }

  private getDefaultAnalysis(): CodeAnalysis {
    return {
      quality: 'Não foi possível completar a análise',
      recommendations: ['Por favor, tente novamente em alguns momentos'],
      improvedCode: '',
      performance: [],
      security: [],
      bestPractices: [],
    };
  }
}
