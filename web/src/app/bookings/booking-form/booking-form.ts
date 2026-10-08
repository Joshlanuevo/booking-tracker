import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingsService } from '../bookings.service';
import { Booking } from '../booking.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-booking-form',
  styleUrl: './booking-form.css',
  templateUrl: './booking-form.html',
})
export class BookingForm {
  private fb = inject(FormBuilder);
  private bookingsService = inject(BookingsService);

  created = output<Booking>();

  submitting = signal(false);
  error = signal<string | null>(null);

  // one key per boooking attempt; a retry reuses the same key
  private idempotencyKey = crypto.randomUUID();

  form = this.fb.nonNullable.group({
    customerName: ['', Validators.required],
    destination: ['', Validators.required],
    travelDate: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.bookingsService
      .create({ ...this.form.getRawValue(), idempotencyKey: this.idempotencyKey })
      .subscribe({
        next: (booking) => {
          this.created.emit(booking);
          this.form.reset();
          this.idempotencyKey = crypto.randomUUID();
          this.submitting.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(
            err.status === 400 ? 'Please check the form fields.' :
            err.status === 400 ? 'This booking conflicts with an earlier request.' :
            'Something wen wrong. Please try again.'
          );
          this.submitting.set(false);
        },
      })
  }
}
