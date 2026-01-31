import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsApiService } from '../../../../core/services/products-api.service';
import { Product } from '../../models/product.model';
import { merge, of, EMPTY } from 'rxjs';
import { distinctUntilChanged, map, filter } from 'rxjs/operators';

function toISODateString(value: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const mm = m[1].padStart(2, '0');
    const dd = m[2].padStart(2, '0');
    const yy = m[3];
    return `${yy}-${mm}-${dd}`;
  }
  return value;
}

function addOneYear(dateValue: string): string {
  const iso = toISODateString(dateValue);
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';

  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCFullYear(dt.getUTCFullYear() + 1);

  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function todayISO(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form-page.html',
  styleUrl: './product-form-page.css'
})
export class ProductFormPageComponent implements OnInit {
  private fb = inject(FormBuilder);

  loading = signal(false);
  saving = signal(false);
  errorMsg = signal('');

  isEdit = signal(false);
  idParam = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', [Validators.required]],
    date_release: ['', [Validators.required]],
    date_revision: [{ value: '', disabled: true }]
  });

  get canSubmit(): boolean {
    return this.form.valid && !this.saving() && !this.loading();
  }

  constructor(
    private api: ProductsApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');

      // 
      this.form.controls.date_release.valueChanges.subscribe((v) => {
        if (!v) return;
        this.form.controls.date_revision.setValue(addOneYear(v));
      });

      if (id) {
        // modo edicion
        this.isEdit.set(true);
        this.idParam.set(id);
        this.form.controls.id.disable();
        this.loadById(id);
      } else {
        //modo crear
        this.isEdit.set(false);
        this.idParam.set(null);
        this.form.controls.id.enable();

        const t = todayISO();
        this.form.controls.date_release.setValue(t);
        this.form.controls.date_revision.setValue(addOneYear(t));
      }
    });
  }


  private initWithId(id: string) {
    this.idParam.set(id);
    this.isEdit.set(true);
    this.form.controls.id.disable();
    this.loadById(id);
  }

  private initCreateMode() {
    this.isEdit.set(false);
    this.idParam.set(null);
    this.form.controls.id.enable();

    const t = todayISO();
    this.form.controls.date_release.setValue(t);
    this.form.controls.date_revision.setValue(addOneYear(t));
  }

  private loadById(id: string): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.api.getById(id).subscribe({
      next: (p) => {

        this.form.controls.id.setValue(p.id);
        this.form.controls.name.setValue(p.name);
        this.form.controls.description.setValue(p.description);
        this.form.controls.logo.setValue(p.logo);
        this.form.controls.date_release.setValue(toISODateString(p.date_release));
        this.form.controls.date_revision.setValue(toISODateString(p.date_revision));

        this.loading.set(false);
      },
      error: (e) => {
        console.error('GET BY ID ERROR', e);
        this.errorMsg.set('Producto no encontrado.');
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigateByUrl('/products');
  }

  onReset(): void {
    this.form.reset();

    const id = this.idParam();
    if (this.isEdit() && id) {
      this.loadById(id);
      return;
    }

    const t = todayISO();
    this.form.controls.date_release.setValue(t);
    this.form.controls.date_revision.setValue(addOneYear(t));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    const raw = this.form.getRawValue();

    const payload: Product = {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      logo: raw.logo,
      date_release: toISODateString(raw.date_release),
      date_revision: toISODateString(raw.date_revision),
    };

    const req$ = this.isEdit()
      ? this.api.update(this.idParam()!, payload) 
      : this.api.create(payload);                 

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/products'],{queryParams:{refresh:1}});
      },
      error: (e) => {
        console.error('SAVE ERROR', e);
        this.saving.set(false);
        this.errorMsg.set('No se pudo guardar el producto.');
      }
    });
  }

}
