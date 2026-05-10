import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, MatSnackBarModule],
  template: `
    <app-navbar />
    <main class="min-h-[calc(100vh-128px)]">
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.translate.use('fr');
  }
}
