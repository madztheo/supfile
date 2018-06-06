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
import { Router } from "@angular/router";
import { APIService } from "../api/api.service";
import { FileComponent } from "../file/file.component";

@Component({
  selector: "supfile-folder",
  templateUrl: "./folder.component.html",
  styleUrls: ["./folder.component.scss"],
  animations: [
    trigger("inOutFolderAnim", [
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
export class FolderComponent {
  @Input() folder: DBFolder;
  isContextMenuVisible = false;
  @Output() onRemove = new EventEmitter<DBFolder>();
  @Output() fileDropped = new EventEmitter<DBFile>();
  @Output() folderDropped = new EventEmitter<DBFolder>();
  folderState = "in";
  publicLink: string;
  @Input() index: number;
  public static onContextMenuOpen = new EventEmitter<DBFolder>();

  get isPublic() {
    if (this.folder) {
      return this.folder.getACL().getPublicReadAccess();
    } else {
      return false;
    }
  }

  constructor(private router: Router, private apiService: APIService) {}

  showContextMenu() {
    this.isContextMenuVisible = true;
    FolderComponent.onContextMenuOpen.emit(this.folder);
  }

  ngOnInit() {
    if (this.folder) {
      this.publicLink = `${this.apiService.webAppUrl}/public/folders/${
        this.folder.id
      }`;
    }
    window.addEventListener("click", () => {
      this.isContextMenuVisible = false;
    });
    FileComponent.onContextMenuOpen.subscribe((file: DBFile) => {
      this.isContextMenuVisible = false;
    });
    FolderComponent.onContextMenuOpen.subscribe((folder: DBFolder) => {
      if (folder.id !== this.folder.id) {
        this.isContextMenuVisible = false;
      }
    });
  }

  editName(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.folder.isInEditMode = true;
  }

  leaveEditMode() {
    this.folder.isInEditMode = false;
    this.folder.save();
  }

  onContextMenuShown(event: Event) {
    event.preventDefault();
    this.showContextMenu();
  }

  onFolderClicked() {
    if (this.isContextMenuVisible) {
      return;
    }
    if (this.folder.isInEditMode) {
      return;
    }
    this.router.navigate(["/my-drive/folders", this.folder.id]);
  }

  removeFolder(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.folderState = "out";
  }

  onHidingFolderDone() {
    if (this.folderState === "out") {
      this.onRemove.emit(this.folder);
    }
  }

  download(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    window.open(this.apiService.getFolderDownloadUrl(this.folder));
  }

  onContextMenuClick(event: Event) {
    event.stopPropagation();
  }

  shareFolder(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.apiService.shareFolder(this.folder).then(folder => {
      this.folder = folder;
      console.log(folder);
    });
  }

  stopSharingFolder(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.apiService.stopSharingFolder(this.folder).then(folder => {
      this.folder = folder;
      console.log(folder);
    });
  }

  copyPublicLink(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    prompt("Share link", this.publicLink);
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  onDrag(ev) {
    ev.dataTransfer.setData("folderId", this.folder.id);
  }

  onDrop(ev) {
    ev.preventDefault();
    const fileId = ev.dataTransfer.getData("fileId");
    const folderId = ev.dataTransfer.getData("folderId");
    if (fileId) {
      this.apiService.getDBFile(fileId).then(file => {
        file.folder = this.folder;
        file.save();
        this.fileDropped.emit(file);
      });
    } else if (folderId) {
      this.apiService.getFolder(folderId).then(folder => {
        if (folder.id !== this.folder.id) {
          folder.parent = this.folder;
          folder.save();
          this.folderDropped.emit(folder);
        }
      });
    }
  }
}
