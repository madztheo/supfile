import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { LogInComponent } from "./login/login.component";
import { SignUpComponent } from "./signup/signup.component";
import { NotFoundComponent } from "./notfound/notfound.component";
import { FileViewerComponent } from "./file-viewer/file-viewer.component";
import { PresentationComponent } from "./presentation/presentation.component";
import { AuthGuard } from "./auth.guard";

const routes: Routes = [
  { path: "", redirectTo: "/", pathMatch: "full" },
  { path: "", component: PresentationComponent },
  { path: "my-drive", component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: "my-drive/folders/:id",
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "public/folders/:id",
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "my-drive/files/:id",
    component: FileViewerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "public/files/:id",
    component: FileViewerComponent,
    canActivate: [AuthGuard]
  },
  { path: "login", component: LogInComponent },
  { path: "signup", component: SignUpComponent },
  { path: "**", component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
