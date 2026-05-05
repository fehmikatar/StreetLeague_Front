import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicalRecordRequest {
  healthProfileId: number;
  diagnosis: string;
  injuryDate: string;   // YYYY-MM-DD
  expectedRecoveryDate?: string;
  actualRecoveryDate?: string;
  doctorNotes?: string;
  injuryType?: string;
  recoveryStatus?: string;
  medicalCertificateUrl?: string;
  treatment?: string;
  medication?: string;
  requiresFollowUp?: boolean;
  treatedByDoctorId?: number;
}

export interface MedicalRecordResponse {
  id: number;
  healthProfileId: number;
  diagnosis: string;
  injuryDate: string;
  expectedRecoveryDate: string;
  actualRecoveryDate: string;
  doctorNotes: string;
  injuryType: string;
  recoveryStatus: string;
  medicalCertificateUrl: string;
  treatment: string;
  medication: string;
  requiresFollowUp: boolean;
  treatedByDoctorId: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  private apiUrl = 'http://localhost:8085/api/medical-records';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MedicalRecordResponse[]> {
    return this.http.get<MedicalRecordResponse[]>(this.apiUrl);
  }
  getById(id: number): Observable<MedicalRecordResponse> {
    return this.http.get<MedicalRecordResponse>(`${this.apiUrl}/${id}`);
  }
  getByHealthProfileId(healthProfileId: number): Observable<MedicalRecordResponse[]> {
    return this.http.get<MedicalRecordResponse[]>(`${this.apiUrl}/health-profile/${healthProfileId}`);
  }
  getByStatus(status: string): Observable<MedicalRecordResponse[]> {
    return this.http.get<MedicalRecordResponse[]>(`${this.apiUrl}/status/${status}`);
  }
  create(data: MedicalRecordRequest): Observable<MedicalRecordResponse> {
    return this.http.post<MedicalRecordResponse>(this.apiUrl, data);
  }
  update(id: number, data: MedicalRecordRequest): Observable<MedicalRecordResponse> {
    return this.http.put<MedicalRecordResponse>(`${this.apiUrl}/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}