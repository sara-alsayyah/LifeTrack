import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  readonly fullName = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly moodGoal = signal('calm');
  readonly submitted = signal(false);

  readonly canSubmit = computed(
    () =>
      this.fullName().trim().length >= 2 &&
      this.email().trim().includes('@') &&
      this.password().trim().length >= 6,
  );

  submit(): void {
    this.submitted.set(true);
  }
}
