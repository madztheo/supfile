import {
  Component,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef
} from "@angular/core";

@Component({
  selector: "supfile-folder",
  templateUrl: "./folder.component.html",
  styleUrls: ["./folder.component.scss"]
})
export class FolderComponent {
  @Input() folder: Folder;
  isContextMenuVisible = false;
  @Output() onRemove = new EventEmitter<Folder>();

  editName() {
    this.folder.isInEditMode = true;
  }

  leaveEditMode() {
    this.folder.isInEditMode = false;
  }

  onContextMenuShown(event: Event) {
    event.preventDefault();
    this.isContextMenuVisible = true;
  }

  hideContextMenu() {
    this.isContextMenuVisible = false;
  }

  removeFolder() {
    this.onRemove.emit(this.folder);
  }
}
