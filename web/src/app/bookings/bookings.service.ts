import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Booking } from "./booking.model";


@Injectable({ providedIn: 'root' })
export class BookingsService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/bookings';

    getAll(): Observable<Booking[]> {
        return this.http.get<Booking[]>(this.apiUrl);
    }
}