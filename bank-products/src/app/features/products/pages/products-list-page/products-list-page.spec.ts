import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductsListPageComponent } from './products-list-page';
import { ProductsApiService } from '../../../../core/services/products-api.service';
import { Product } from '../../models/product.model';

describe('ProductsListPageComponent', () => {
  let fixture: ComponentFixture<ProductsListPageComponent>;
  let component: ProductsListPageComponent;
//PRUEBA
  const mockProducts: Product[] = [
    {
      id: 'P001',
      name: 'Producto 1',
      description: 'Descripción de producto 1',
      logo: 'https://logo.com/1.png',
      date_release: '2026-01-01',
      date_revision: '2027-01-01'
    }
  ];

  let apiMock: { getAll: jest.Mock; remove: jest.Mock };
  let routerMock: { navigateByUrl: jest.Mock };

  beforeEach(async () => {
    apiMock = {
      getAll: jest.fn().mockReturnValue(of(mockProducts)),
      remove: jest.fn().mockReturnValue(of(void 0))
    };

    routerMock = {
      navigateByUrl: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductsListPageComponent],
      providers: [
        { provide: ProductsApiService, useValue: apiMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListPageComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar productos al iniciar', () => {
    fixture.detectChanges(); 

    expect(apiMock.getAll).toHaveBeenCalledTimes(1);


    expect(component.allProducts.length).toBe(1);
    expect(component.allProducts[0].id).toBe('P001');


    expect(component.filteredAll.length).toBe(1);
    expect(component.visibleProducts.length).toBe(1);
    expect(component.visibleProducts[0].id).toBe('P001');

    expect(component.loading).toBe(false);
    expect(component.errorMsg).toBe('');
  });

  it('debe mostrar error cuando falla el API', () => {
    apiMock.getAll.mockReturnValueOnce(throwError(() => new Error('fail')));

    fixture.detectChanges();

    expect(apiMock.getAll).toHaveBeenCalledTimes(1);
    expect(component.loading).toBe(false);
    expect(component.errorMsg).toContain('No se pudo cargar');
  });

  it('onCreate debe navegar a /products/new', () => {
    component.onCreate();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/products/new');
  });

  it('onEdit debe navegar a /products/{id}/edit', () => {
    component.onEdit(mockProducts[0]);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/products/P001/edit');
  });
});
