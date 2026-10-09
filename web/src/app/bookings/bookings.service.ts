import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Booking } from "./booking.model";

export type CreateBooking = Pick<Booking, 'customerName' | 'destination' | 'travelDate' | 'amount'> & {
    idempotencyKey: string;
};

@Injectable({ providedIn: 'root' })
export class BookingsService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/bookings';

    getAll(search = ''): Observable<Booking[]> {
        const params: Record<string, string> = search ? { search } : {};
        return this.http.get<Booking[]>(this.apiUrl, { params });
    }

    create(data: CreateBooking): Observable<Booking> {
        return this.http.post<Booking>(this.apiUrl, data);
    }

    updateStatus(id: string, status: Booking['status']): Observable<Booking> {
        return this.http.patch<Booking>(`${this.apiUrl}/${id}`, { status });
    }

    remove(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}