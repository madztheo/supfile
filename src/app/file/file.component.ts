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
import { Router } from "@angular/router";
import { FolderComponent } from "../folder/folder.component";

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
  @ViewChild("publicLinkInput") linkInput: ElementRef;
  fileState = "in";
  publicLink: string;
  @Input() index: number;
  public static onContextMenuOpen = new EventEmitter<DBFile>();

  get isPublic() {
    if (this.file) {
      return this.file.getACL().getPublicReadAccess();
    } else {
      return false;
    }
  }

  constructor(private apiService: APIService, private router: Router) {}

  showContextMenu() {
    this.isContextMenuVisible = true;
    FileComponent.onContextMenuOpen.emit(this.file);
  }

  ngOnInit() {
    if (this.file) {
      this.publicLink = `${this.apiService.webAppUrl}/public/files/${
        this.file.id
      }`;
    }
    window.addEventListener("click", () => {
      this.isContextMenuVisible = false;
    });
    FolderComponent.onContextMenuOpen.subscribe((folder: DBFolder) => {
      this.isContextMenuVisible = false;
    });
    FileComponent.onContextMenuOpen.subscribe((file: DBFile) => {
      if (file.id !== this.file.id) {
        this.isContextMenuVisible = false;
      }
    });
  }

  editName(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.file.isInEditMode = true;
  }

  leaveEditMode() {
    this.file.isInEditMode = false;
    this.file.save();
  }

  onContextMenuShown(event: Event) {
    event.preventDefault();
    this.showContextMenu();
  }

  onFileClicked() {
    if (this.isContextMenuVisible) {
      return;
    }
    if (this.file.isInEditMode) {
      return;
    }
    this.router.navigate(["/my-drive/files", this.file.id]);
    /*this.apiService.getFileUrl(this.file).then(({ url }) => {
      window.open(url);
    });*/
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.fileState = "out";
  }

  onHidingFileDone() {
    if (this.fileState === "out") {
      this.onRemove.emit(this.file);
    }
  }

  shareFile(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.apiService.shareFile(this.file).then(file => {
      this.file = file;
      console.log(file);
    });
  }

  stopSharingFile(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.apiService.stopSharingFile(this.file).then(file => {
      this.file = file;
      console.log(file);
    });
  }

  copyPublicLink(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    /*(<HTMLInputElement>this.linkInput.nativeElement).select();
    if (document.execCommand("copy")) {
      alert(
        "Link copied in clipboard : " +
          (<HTMLInputElement>this.linkInput.nativeElement).value
      );
    }*/
    prompt("Share link", this.publicLink);
  }

  onDrag(ev) {
    ev.dataTransfer.setData("fileId", this.file.id);
  }

  onContextMenuClick(event: Event) {
    event.stopPropagation();
  }
}
