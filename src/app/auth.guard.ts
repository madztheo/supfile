import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { APIService } from "./api/api.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private apiService: APIService, private router: Router) {}

  canActivate() {
    const isConnected = !!this.apiService.getCurrentUser();
    if (!isConnected) {
      this.router.navigate(["/"]);
    }
    return isConnected;
  }
}
