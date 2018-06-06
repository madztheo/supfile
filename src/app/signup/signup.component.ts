import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { APIService } from "../api/api.service";

@Component({
  selector: "supfile-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignUpComponent {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;

  constructor(private router: Router, private apiService: APIService) {}

  /**
   * Sign up the user with the information given
   */
  signUp() {
    if (
      this.username &&
      this.password &&
      this.email &&
      this.confirmPassword &&
      this.password === this.confirmPassword
    ) {
      this.apiService
        .signUp(this.email, this.username, this.password)
        .then(() => {
          this.router.navigate(["/"]);
        });
    } else {
      alert("Please fill in all the fields");
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.signUp();
  }

  /**
   * Redirect to login page
   */
  logIn() {
    this.router.navigate(["/login"]);
  }
}
