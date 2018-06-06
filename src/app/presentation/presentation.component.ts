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
      this.router.navigate(["/my-drive"]);
    }
  }

  login() {
    this.router.navigate(["/login"]);
  }

  signup() {
    this.router.navigate(["/signup"]);
  }
}
