import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentRequest {
  userId: number;
  doctorId: number;
  appointmentDate: string; // ISO
  reason: string;
  status?: string;
  notes?: string;
}

export interface AppointmentResponse {
  id: number;
  userId: number;
  doctorId: number;
  appointmentDate: string;
  reason: string;
  status: string;
  notes: string;
  patientFeedback: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = 'http://localhost:8085/api/appointments';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(this.apiUrl);
  }
  getById(id: number): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(`${this.apiUrl}/${id}`);
  }
  getByUserId(userId: number): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/user/${userId}`);
  }
  getByDoctorId(doctorId: number): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }
  getByStatus(status: string): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/status/${status}`);
  }
  create(data: AppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(this.apiUrl, data);
  }
  update(id: number, data: AppointmentRequest): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(`${this.apiUrl}/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  updateStatus(id: number, status: string): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  sendFeedback(id: number, message: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/feedback`, null, { params: { message } });
  }

  updateFeedback(id: number, message: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/feedback`, null, { params: { message } });
  }

  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/feedback`);
  }

  sendGeneralFeedback(userId: number, message: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/feedback/general`, null, { params: { userId: userId.toString(), message } });
  }
}