import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // Use standalone component directly
    children: [
      // your child routes here
      {
        path: 'department-management',
        children: [
          { path: '', component: DepartmentListComponent },
          { path: 'add', component: DepartmentAddComponent },
          // Sửa khoa sẽ làm sau, placeholder:
          // { path: 'edit/:id', component: DepartmentEditComponent },
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }