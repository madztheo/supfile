import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { APIService } from "../api/api.service";

declare const gapi: any;

@Component({
  selector: "supfile-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LogInComponent {
  username: string;
  password: string;
  auth2: any;

  ngAfterViewInit() {
    //Initiate the connection to Google API
    gapi.load("auth2", () => {
      this.auth2 = gapi.auth2.init({
        client_id:
          "421233958586-jnug92ahf1fliq0v5ne35db88rja4rvd.apps.googleusercontent.com",
        cookiepolicy: "single_host_origin",
        scope: "profile email"
      });
      this.attachSignin(document.getElementById("googlelogin"));
    });
  }

  constructor(private router: Router, private apiService: APIService) {}

  /**
   * Log in the user with the username and password provided
   */
  logIn() {
    this.apiService.logIn(this.username, this.password).then(() => {
      this.router.navigate(["/"]);
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.logIn();
  }

  attachSignin(element) {
    //Listen for sign in with Google
    this.auth2.attachClickHandler(
      element,
      {},
      googleUser => {
        const profile = googleUser.getBasicProfile();
        if (profile.getId()) {
          //Sign in the user with its Google account
          this.apiService.signGoogle(profile).then(() => {
            //For some reason usual router doesn't work properly here
            window.location.assign("/");
          });
        }
      },
      function(error) {
        console.log(error);
      }
    );
  }

  /**
   * Redirect to sign up page
   */
  signUp() {
    this.router.navigate(["/signup"]);
  }
}
