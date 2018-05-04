import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "supfile-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignUpComponent {
  constructor(private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.router.navigate(["/"]);
  }

  logIn() {
    this.router.navigate(["/login"]);
  }
}
