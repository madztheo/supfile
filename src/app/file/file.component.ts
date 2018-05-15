import {
  Component,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef
} from "@angular/core";
import {
  trigger,
  state,
  transition,
  style,
  animate
} from "@angular/animations";
import { DBFolder, DBFile } from "../api/db-classes";
import { APIService } from "../api/api.service";

@Component({
  selector: "supfile-file",
  templateUrl: "./file.component.html",
  styleUrls: ["./file.component.scss"],
  animations: [
    trigger("inOutFileAnim", [
      state("in", style({ transform: "scale(1)" })),
      transition("* => out", [
        animate(
          "600ms cubic-bezier(0.6, -0.28, 0.735, 0.045)",
          style({
            transform: "scale(0)"
          })
        )
      ])
    ])
  ]
})
export class FileComponent {
  @Input() file: DBFile;
  isContextMenuVisible = false;
  @Output() onRemove = new EventEmitter<DBFile>();
  fileState = "in";

  constructor(private apiService: APIService) {}

  editName() {
    this.file.isInEditMode = true;
  }

  leaveEditMode() {
    this.file.isInEditMode = false;
    this.file.save();
  }

  onContextMenuShown(event: Event) {
    event.preventDefault();
    this.isContextMenuVisible = true;
  }

  onFileClicked() {
    if (this.isContextMenuVisible) {
      this.isContextMenuVisible = false;
      return;
    }
    if (this.file.isInEditMode) {
      return;
    }
    this.apiService.getFileUrl(this.file).then(({ url }) => {
      window.open(url);
    });
  }

  removeFile() {
    this.fileState = "out";
  }

  onHidingFileDone() {
    if (this.fileState === "out") {
      this.onRemove.emit(this.file);
    }
  }
}
