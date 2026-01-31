import { Routes } from '@angular/router';
import { ProductsListPageComponent } from './pages/products-list-page/products-list-page';
import { ProductFormPageComponent } from './pages/product-form-page/product-form-page';

export const productsRoutes: Routes = [
  {
    path: '',
    component: ProductsListPageComponent,
    runGuardsAndResolvers: 'always'
  },
  { path: 'new', component: ProductFormPageComponent },
  { path: ':id/edit', component: ProductFormPageComponent }
];
