import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "supfile-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LogInComponent {
  constructor(private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.router.navigate(["/"]);
  }

  signUp() {
    this.router.navigate(["/signup"]);
  }
}
