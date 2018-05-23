import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { LogInComponent } from "./login/login.component";
import { SignUpComponent } from "./signup/signup.component";
import { NotFoundComponent } from "./notfound/notfound.component";
import { FileViewerComponent } from "./file-viewer/file-viewer.component";

const routes: Routes = [
  { path: "", redirectTo: "/my-drive", pathMatch: "full" },
  { path: "my-drive", component: HomeComponent },
  { path: "my-drive/folders/:id", component: HomeComponent },
  { path: "public/folders/:id", component: HomeComponent },
  { path: "my-drive/files/:id", component: FileViewerComponent },
  { path: "public/files/:id", component: FileViewerComponent },
  { path: "login", component: LogInComponent },
  { path: "signup", component: SignUpComponent },
  { path: "**", component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
