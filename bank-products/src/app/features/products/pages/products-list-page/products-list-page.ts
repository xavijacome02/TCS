import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Product } from '../../models/product.model';
import { ProductsApiService } from '../../../../core/services/products-api.service';

@Component({
  selector: 'app-products-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-list-page.html',
  styleUrl: './products-list-page.css'
})
export class ProductsListPageComponent implements OnInit {
  // UI 
  loading = false;
  errorMsg = '';

  // Data
  allProducts: Product[] = [];
  filteredAll: Product[] = [];
  visibleProducts: Product[] = [];

  // Filters/pagination
  private searchTerm = '';
  private pageSize = 5;

  constructor(private api: ProductsApiService, private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        // 
        if (e.urlAfterRedirects === '/products') {
          this.load();
        }
      });
  }
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getAll().subscribe({
      next: (items) => {
        this.allProducts = items ?? [];
        this.applyFilterAndPagination();
        this.loading = false;
      },
      error: (e) => {
        console.error('GET ALL ERROR', e);
        this.errorMsg = 'No se pudo cargar productos (¿backend en http://localhost:3002?)';
        this.loading = false;
      }
    });
  }

  remove(p: Product): void {
    this.errorMsg = '';

    this.api.remove(p.id).subscribe({
      next: () => this.load(), 
      error: (e) => {
        console.error('DELETE ERROR', e);
        this.errorMsg = 'No se pudo eliminar el producto.';
      }
    });
  }




  
  onCreate() {
    this.router.navigate(['/products', 'new']);
  }


  onEdit(p: Product) {
    this.router.navigate(['/products', p.id, 'edit']);
  }




  onSearch(value: string): void {
    this.searchTerm = (value ?? '').trim().toLowerCase();
    this.applyFilterAndPagination();
  }

  onPageSizeChange(value: string): void {
    const n = Number(value);
    this.pageSize = Number.isFinite(n) && n > 0 ? n : 5;
    this.applyFilterAndPagination();
  }

  // 
  private applyFilterAndPagination(): void {
  
    if (!this.searchTerm) {
      this.filteredAll = [...this.allProducts];
    } else {
      const t = this.searchTerm;
      this.filteredAll = this.allProducts.filter((p) => {
        return (
          p.id.toLowerCase().includes(t) ||
          p.name.toLowerCase().includes(t) ||
          p.description.toLowerCase().includes(t)
        );
      });
    }

   
    this.visibleProducts = this.filteredAll.slice(0, this.pageSize);
  }

  trackById(_: number, item: Product): string {
    return item.id;
  }

  onImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    img.src =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44">
          <rect width="100%" height="100%" fill="#eee"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="#888">no logo</text>
        </svg>`
      );
  }

  formatDate(value: string): string {
    // backend viene YYYY-MM-DD. Lo mostramos DD/MM/YYYY
    if (!value) return '';
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return value;
    return `${m[3]}/${m[2]}/${m[1]}`;
  }
}
