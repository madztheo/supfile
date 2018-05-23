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
import { DBFolder } from "../api/db-classes";
import { Router } from "@angular/router";
import { APIService } from "../api/api.service";

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
  folderState = "in";
  publicLink: string;
  get isPublic() {
    if (this.folder) {
      return this.folder.getACL().getPublicReadAccess();
    } else {
      return false;
    }
  }

  constructor(private router: Router, private apiService: APIService) {}

  ngOnInit() {
    if (this.folder) {
      this.publicLink = `${this.apiService.webAppUrl}/public/folders/${
        this.folder.id
      }`;
    }
  }

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

  onFolderClicked() {
    if (this.isContextMenuVisible) {
      this.isContextMenuVisible = false;
      return;
    }
    this.router.navigate(["/my-drive/folders", this.folder.id]);
  }

  removeFolder() {
    this.folderState = "out";
  }

  onHidingFolderDone() {
    if (this.folderState === "out") {
      this.onRemove.emit(this.folder);
    }
  }

  download() {
    this.apiService.downloadFolder(this.folder).subscribe(res => {
      const zipLink = window.URL.createObjectURL(res);
      window.open(zipLink);
    });
  }

  shareFolder() {
    this.apiService.shareFolder(this.folder).then(folder => {
      this.folder = folder;
      console.log(folder);
    });
  }

  stopSharingFolder() {
    this.apiService.stopSharingFolder(this.folder).then(folder => {
      this.folder = folder;
      console.log(folder);
    });
  }

  copyPublicLink() {
    /*(<HTMLInputElement>this.linkInput.nativeElement).select();
    if (document.execCommand("copy")) {
      alert(
        "Link copied in clipboard : " +
          (<HTMLInputElement>this.linkInput.nativeElement).value
      );
    }*/
    prompt("Share link", this.publicLink);
  }
}
