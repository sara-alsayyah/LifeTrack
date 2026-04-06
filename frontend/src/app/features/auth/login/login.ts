import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly email = signal('');
  readonly password = signal('');
  readonly rememberMe = signal(true);
  readonly submitted = signal(false);

  readonly canSubmit = computed(
    () => this.email().trim().includes('@') && this.password().trim().length >= 6,
  );

  submit(): void {
    this.submitted.set(true);
  }
}
