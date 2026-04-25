// src/app/services/doctor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DoctorResponse {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private apiUrl = 'http://localhost:8085/api/doctors';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DoctorResponse[]> {
    return this.http.get<DoctorResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<DoctorResponse> {
    return this.http.get<DoctorResponse>(`${this.apiUrl}/${id}`);
  }

  // Ajoutez d'autres méthodes si nécessaire (create, update, delete)
}