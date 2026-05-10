import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-gray-800 text-gray-300 text-center py-6 mt-12">
      <p class="text-sm">© 2024 PFE Market — Projet de Fin d'Études</p>
      <p class="text-xs mt-1 text-gray-500">Spring Boot Microservices · Angular 18 · Docker</p>
    </footer>
  `,
})
export class FooterComponent {}
