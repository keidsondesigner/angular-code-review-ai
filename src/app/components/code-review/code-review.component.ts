import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CodeReviewService,
  CodeAnalysis,
} from '../../services/code-review.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-code-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CodeReviewService],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">

        <div class="flex flex-col items-center justify-center mt-16 mb-8 gap-2">
          <div class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m5 12-3 3 3 3"></path><path d="m9 18 3-3-3-3"></path></svg>
            <h1 class="text-2xl font-bold">AI Code Analyzer</h1>
          </div>
          <p class="text-gray-600 text-lg max-w-md">
            Analise seu código antes de abrir um pull request
          </p>  
        </div>
    

        <div class="bg-white border rounded-lg shadow-sm p-6">
          <!-- <h1 class="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] hidden md:block my-8">
            Code Review AI
          </h1> -->
          
          <div class="space-y-6">
            <!-- Framework Tabs -->
            <div class="flex flex-wrap gap-2 justify-center	 p-1 bg-gray-100 rounded-lg">
              <button
                *ngFor="let framework of frameworks"
                (click)="selectFramework(framework.value)"
                [class]="selectedFramework === framework.value ? 
                  'px-4 py-1.5 rounded-md bg-white text-sm font-medium text-gray-900 shadow-sm' : 
                  'px-4 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900'"
              >
                {{ framework.label }}
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Code</label>
              <textarea
                [(ngModel)]="codeInput"
                class="w-full h-48 px-3 py-2 bg-gray-50 text-base border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black rounded-md resize-none"
                placeholder="Cole seu código aqui..."></textarea>
            </div>

            <!-- Error Message -->
            <div *ngIf="error" class="rounded-md bg-red-50 p-4">
              <div class="flex">
                <div class="text-sm text-red-700">{{ error }}</div>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button (click)="clearInputTextarea()" class="rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-gray-50 px-4 py-2"
            >
              Limpar
            </button>
              
              <button
                (click)="analyzeCode()"
                [disabled]="loading"
                class="flex px-4 items-center py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4" data-id="16"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path></svg>
                {{ loading ? 'Analisando...' : 'Analisar Código' }}
              </button>
            </div>
          </div>

          <!-- Analysis Results -->
          <div *ngIf="analysis" class="mt-8 space-y-6">
            <!-- Quality Overview -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Avaliação de Qualidade</h2>
              <p class="text-gray-700">{{ analysis.quality }}</p>
            </div>

             <!-- Best Practices -->
            <div class="bg-green-50 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Boas Práticas</h2>
              <ul class="list-disc pl-5 space-y-2">
                <li *ngFor="let practice of analysis.bestPractices" class="text-gray-700">
                  {{ practice }}
                </li>
              </ul>
            </div>

            <!-- Recommendations -->
            <div class="bg-blue-50 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Recomendações</h2>
              <ul class="list-disc pl-5 space-y-2">
                <li *ngFor="let rec of analysis.recommendations" class="text-gray-700">
                  {{ rec }}
                </li>
              </ul>
            </div>

            <!-- Improved Code -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Código Melhorado</h2>
              <div class="relative">
                <pre class="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto max-h-[500px] overflow-y-auto overflow-hidden">
                  <code>{{ analysis.improvedCode }}</code>
                </pre>
                <!-- <button
                  (click)="copyImprovedCode()"
                  class="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-gray-100 text-xs rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  {{ copyStatus }}
                </button> -->
                <button 
                  (click)="copyImprovedCode()" 
                  class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 
                  

                  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50 [&_svg]:h-3 [&_svg]:w-3 absolute right-4 top-4"
                >
                  <span class="sr-only">Copy</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" 
                    viewBox="0 0 24 24" fill="none"  
                    stroke="currentColor" 
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  >
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  </svg>
              </button>
              </div>
            </div>

            <!-- Performance -->
            <div class="bg-yellow-50 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Informações de Desempenho</h2>
              <ul class="list-disc pl-5 space-y-2">
                <li *ngFor="let perf of analysis.performance" class="text-gray-700">
                  {{ perf }}
                </li>
              </ul>
            </div>

            <!-- Security -->
            <div class="bg-red-50 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Considerações de segurança</h2>
              <ul class="list-disc pl-5 space-y-2">
                <li *ngFor="let sec of analysis.security" class="text-gray-700">
                  {{ sec }}
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
      <footer class="text-center mt-12 text-sm text-gray-600">
        <p>Desenvolvido com Angular e Gemini Ai <i class="fas fa-heart text-red-500"></i> por Keidson Roby<p>
      </footer>
    </div>
  `,
})
export class CodeReviewComponent {
  frameworks = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'typescript', label: 'Typescript' },
    { value: 'vue3', label: 'Vue 3' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
  ];

  codeInput = '';
  selectedFramework = 'angular';
  loading = false;
  error = '';
  analysis: CodeAnalysis | null = null;
  copyStatus = 'Copiar';

  constructor(private codeReviewService: CodeReviewService) {
    this.codeReviewService.loading$.subscribe(
      (loading) => (this.loading = loading)
    );
    this.codeReviewService.error$.subscribe((error) => (this.error = error));
  }

  selectFramework(framework: string): void {
    this.selectedFramework = framework;
    if (this.analysis) {
      this.analysis = null;
    }
  }

  clearInputTextarea() {
    this.codeInput = '';
    this.analysis = null;
  }

  async copyImprovedCode(): Promise<void> {
    if (this.analysis?.improvedCode) {
      try {
        await navigator.clipboard.writeText(this.analysis.improvedCode);
        this.copyStatus = 'Copiado!';
        setTimeout(() => {
          this.copyStatus = 'Copiar';
        }, 2000);
      } catch (err) {
        console.error('Erro ao copiar:', err);
        this.copyStatus = 'Erro';
      }
    }
  }

  async analyzeCode() {
    if (!this.codeInput.trim()) {
      this.error = 'Introduza um código para análise';
      return;
    }

    try {
      this.error = '';
      this.analysis = await firstValueFrom(
        this.codeReviewService.analyzeCode(this.codeInput, this.selectedFramework)
      );
    } catch (error) {
      console.error('Error analyzing code:', error);
      this.error =
        error instanceof Error
          ? error.message
          : 'An error occurred while analyzing the code';
    }
  }
}
