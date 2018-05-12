import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { APIService } from "../api/api.service";

@Component({
  selector: "supfile-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LogInComponent {
  username: string;
  password: string;

  constructor(private router: Router, private apiService: APIService) {}

  logIn() {
    this.apiService.logIn(this.username, this.password).then(() => {
      this.router.navigate(["/"]);
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.logIn();
  }

  signUp() {
    this.router.navigate(["/signup"]);
  }
}
