import { Component } from "@angular/core";

@Component({
  selector: "supfile-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  folders = [
    { name: "My folder", isInEditMode: false },
    { name: "Another folder", isInEditMode: false },
    { name: "Super folder", isInEditMode: false }
  ];

  createFolder() {
    this.folders.push({ name: "New folder", isInEditMode: false });
  }

  removeFolder(folder: Folder) {
    this.folders = this.folders.filter(x => x !== folder);
  }
}
