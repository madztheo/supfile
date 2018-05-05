import { Component, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "supfile-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"]
})
export class ToolbarComponent {
  @Output() newFilesAdded = new EventEmitter<FileList>();
  @Output() onCreateNewFolder = new EventEmitter<any>();

  onFileChanged(files: FileList) {
    if (files.length > 0) {
      this.newFilesAdded.emit(files);
    }
  }

  createNewFolder() {
    this.onCreateNewFolder.emit();
  }
}
