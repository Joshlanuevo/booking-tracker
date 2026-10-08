import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { BookingsService } from '../bookings.service';
import { Booking } from '../booking.model';
import { BookingForm } from '../booking-form/booking-form';

@Component({
  imports: [CurrencyPipe, DatePipe, BookingForm],
  selector: 'app-bookings-list',
  styleUrl: './bookings-list.css',
  templateUrl: './bookings-list.html',
})
export class BookingsList implements OnInit {
  private bookingsService = inject(BookingsService);

  bookings = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  busyId = signal<string |null>(null);
  actionError = signal<string | null>(null);

  ngOnInit(): void {
    this.bookingsService.getAll().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load bookings. Is the API running?');
        this.loading.set(false);
      }
    })
  }

  onCreated(booking: Booking) {
    this.bookings.update(list => [booking, ...list])
  }

  setStatus(booking: Booking, status: Booking['status']) {
    this.busyId.set(booking._id);
    this.actionError.set(null);

    this.bookingsService.updateStatus(booking._id, status).subscribe({
      next: (updated) => {
        this.bookings.update(list => list.map(b => b._id === updated._id ? updated : b));
        this.busyId.set(null);
      },
      error: () => {
        this.actionError.set('Could not update the booking. Please try again.');
        this.busyId.set(null);
      }
    });
  }

  remove(booking: Booking) {
    if (!confirm(`Delete ${booking.customerName}'s booking?`)) return;

    this.busyId.set(booking._id);
    this.actionError.set(null);

    this.bookingsService.remove(booking._id).subscribe({
      next: () => {
        this.bookings.update(list => list.filter(b => b._id !== booking._id));
        this.busyId.set(null);
      },
      error: () => {
        this.actionError.set('Could not delete the booking. Please try again.');
        this.busyId.set(null);
      },
    });
  }
}
