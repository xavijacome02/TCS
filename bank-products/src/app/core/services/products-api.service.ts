import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../../features/products/models/product.model';

type GetAllResponse = { data: Product[] };
type OneResponse = Product;
type CreateResponse = { message: string; data: Product };
type UpdateResponse = { message: string; data: Product };
type DeleteResponse = { message: string };

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly baseUrl = 'http://localhost:3002';
  private readonly path = '/bp/products';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Product[]> {
    return this.http.get<GetAllResponse>(`${this.baseUrl}${this.path}`).pipe(
      map((res) => res.data ?? [])
    );
  }

  getById(id: string): Observable<Product> {
    return this.http.get<OneResponse>(`${this.baseUrl}${this.path}/${encodeURIComponent(id)}`);
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}${this.path}/verification/${encodeURIComponent(id)}`
    );
  }

  create(product: Product): Observable<Product> {
    return this.http.post<CreateResponse>(`${this.baseUrl}${this.path}`, product).pipe(
      map((res) => res.data)
    );
  }

  update(id: string, product: Product): Observable<Product> {
    return this.http.put<UpdateResponse>(`${this.baseUrl}${this.path}/${encodeURIComponent(id)}`, product).pipe(
      map((res) => res.data)
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<DeleteResponse>(`${this.baseUrl}${this.path}/${encodeURIComponent(id)}`).pipe(
      map(() => void 0)
    );
  }
}
