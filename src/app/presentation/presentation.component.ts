import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { APIService } from "../api/api.service";

@Component({
  selector: "supfile-presentation",
  templateUrl: "./presentation.component.html",
  styleUrls: ["./presentation.component.scss"]
})
export class PresentationComponent {
  constructor(private router: Router, private apiService: APIService) {}

  ngOnInit() {
    if (this.apiService.getCurrentUser()) {
      //If the user is already connect, we redirect him to its dashboard
      this.router.navigate(["/my-drive"]);
    }
  }

  /**
   * Redirect to login page
   */
  login() {
    this.router.navigate(["/login"]);
  }

  /**
   * Redirect to sign up page
   */
  signup() {
    this.router.navigate(["/signup"]);
  }
}
