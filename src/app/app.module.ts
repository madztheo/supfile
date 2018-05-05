import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { RouterModule } from "@angular/router";
import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from "./home/home.component";
import { MenuComponent } from "./menu/menu.component";

import { ChartModule } from "primeng/chart";
import { FolderComponent } from "./folder/folder.component";
import { SignUpComponent } from "./signup/signup.component";
import { LogInComponent } from "./login/login.component";
import { NotFoundComponent } from "./notfound/notfound.component";
import { ToolbarComponent } from "./toolbar/toolbar.component";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MenuComponent,
    FolderComponent,
    LogInComponent,
    SignUpComponent,
    ToolbarComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    FormsModule,
    ChartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
