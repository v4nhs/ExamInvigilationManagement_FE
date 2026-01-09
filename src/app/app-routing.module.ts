import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // Use standalone component directly
    children: [
      // your child routes here
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }