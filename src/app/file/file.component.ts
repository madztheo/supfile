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

  /**
   * Get if the file is public or not
   */
  get isPublic() {
    if (this.file) {
      return this.file.getACL().getPublicReadAccess();
    } else {
      return false;
    }
  }

  constructor(private apiService: APIService, private router: Router) {}

  /**
   * Show the context menu
   */
  showContextMenu() {
    this.isContextMenuVisible = true;
    //We emit an event to notify that the context has been opened
    FileComponent.onContextMenuOpen.emit(this.file);
  }

  ngOnInit() {
    if (this.file) {
      this.publicLink = `${this.apiService.webAppUrl}/public/files/${
        this.file.id
      }`;
    }
    window.addEventListener("click", () => {
      //We hide the context when we click elsewhere on the web page
      this.isContextMenuVisible = false;
    });
    FolderComponent.onContextMenuOpen.subscribe((folder: DBFolder) => {
      //If any other context menu on a folder has been opened we close the current one
      this.isContextMenuVisible = false;
    });
    FileComponent.onContextMenuOpen.subscribe((file: DBFile) => {
      if (file.id !== this.file.id) {
        //If any other context menu on a file has been opened we close the current one
        this.isContextMenuVisible = false;
      }
    });
  }

  /**
   * Enable file renaming by showing the input
   * @param event
   */
  editName(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.file.isInEditMode = true;
  }

  /**
   * Disable file renaming and save the file
   */
  leaveEditMode() {
    this.file.isInEditMode = false;
    this.file.save();
  }

  /**
   * Called when the user right click on a file
   * @param event
   */
  onContextMenuShown(event: Event) {
    event.preventDefault(); //We prevent the native context menu to show
    this.showContextMenu();
  }

  /**
   * Open the file in the viewer
   */
  onFileClicked() {
    if (this.isContextMenuVisible || this.file.isInEditMode) {
      //We don't want to open it if the context menu is shown or if it is in edit mode
      return;
    }
    this.router.navigate(["/my-drive/files", this.file.id]);
  }

  /**
   * Notify to remove the file
   * @param event
   */
  removeFile(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.fileState = "out";
  }

  /**
   * Called on the end of the disapearing animation.
   * Notify the home page to remove the file from
   * database and data storage
   */
  onHidingFileDone() {
    if (this.fileState === "out") {
      this.onRemove.emit(this.file);
    }
  }

  /**
   * Make the file public
   * @param event
   */
  shareFile(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.apiService.shareFile(this.file).then(file => {
      this.file = file;
    });
  }

  /**
   * Make the file private
   * @param event
   */
  stopSharingFile(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.apiService.stopSharingFile(this.file).then(file => {
      this.file = file;
    });
  }

  /**
   * Download the file
   * @param event
   */
  download(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    window.open(this.apiService.getFileDownloadUrl(this.file));
  }

  /**
   * Open a prompt to copy the public link
   * @param event
   */
  copyPublicLink(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    prompt("Share link", this.publicLink);
  }

  /**
   * Called when the file is dragged by the user
   * @param ev
   */
  onDrag(ev) {
    //We store in the drag event the file id to make the move possible afterwards
    ev.dataTransfer.setData("fileId", this.file.id);
  }

  /**
   * Called when the user click on the context menu
   * @param event
   */
  onContextMenuClick(event: Event) {
    event.stopPropagation();
  }
}
