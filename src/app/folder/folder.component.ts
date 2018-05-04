import { Component, Input } from "@angular/core";

@Component({
  selector: "supfile-folder",
  templateUrl: "./folder.component.html",
  styleUrls: ["./folder.component.scss"]
})
export class FolderComponent {
  @Input() folder: Folder;
}
