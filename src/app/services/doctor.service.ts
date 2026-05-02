// src/app/services/doctor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DoctorResponse {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  isAvailable: boolean;
}

export interface DoctorRequest {
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  isAvailable: boolean;
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

  create(data: DoctorRequest): Observable<DoctorResponse> {
    return this.http.post<DoctorResponse>(this.apiUrl, data);
  }

  update(id: number, data: DoctorRequest): Observable<DoctorResponse> {
    return this.http.put<DoctorResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateAvailability(id: number, isAvailable: boolean): Observable<DoctorResponse> {
    return this.http.patch<DoctorResponse>(`${this.apiUrl}/${id}/availability?available=${isAvailable}`, {});
  }
}