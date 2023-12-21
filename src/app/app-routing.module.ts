import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ContainerComponent } from "./components/container/container.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "",
    component: ContainerComponent,
    children: [
      {
        path: "home",
        loadChildren: () =>
          import("./routes/home/home.module").then((m) => m.HomeModule),
      },
      {
        path: "users",
        data: {},
        loadChildren: () =>
          import("./routes/users/users.module").then((m) => m.UsersModule),
      },
    ],
  },
  {
    path: "**",
    component: NotFoundComponent,
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      paramsInheritanceStrategy: "always",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
