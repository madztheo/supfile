import { Component } from "@angular/core";

@Component({
  selector: "supfile-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  folders = [
    { name: "My folder" },
    { name: "Another folder" },
    { name: "Super folder" }
  ];
}
