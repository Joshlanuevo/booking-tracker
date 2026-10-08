import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { BookingsService } from '../bookings.service';
import { Booking } from '../booking.model';

@Component({
  imports: [CurrencyPipe, DatePipe],
  selector: 'app-bookings-list',
  styleUrl: './bookings-list.css',
  templateUrl: './bookings-list.html',
})
export class BookingsList implements OnInit {
  private bookingsService = inject(BookingsService);

  bookings = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

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
}
