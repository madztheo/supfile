import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { RouterModule } from "@angular/router";
import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from "./home/home.component";
import { MenuComponent } from "./menu/menu.component";

import { ChartModule } from "primeng/chart";
import { FolderComponent } from "./folder/folder.component";

@NgModule({
  declarations: [AppComponent, HomeComponent, MenuComponent, FolderComponent],
  imports: [BrowserModule, RouterModule, AppRoutingModule, ChartModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
