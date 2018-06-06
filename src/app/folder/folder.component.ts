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

  /**
   * Get if the file is public or not
   */
  get isPublic() {
    if (this.folder) {
      return this.folder.getACL().getPublicReadAccess();
    } else {
      return false;
    }
  }

  constructor(private router: Router, private apiService: APIService) {}

  /**
   * Show the context menu
   */
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
      //We hide the context when we click elsewhere on the web page
      this.isContextMenuVisible = false;
    });
    FileComponent.onContextMenuOpen.subscribe((file: DBFile) => {
      //If any other context menu on a file has been opened we close the current one
      this.isContextMenuVisible = false;
    });
    FolderComponent.onContextMenuOpen.subscribe((folder: DBFolder) => {
      if (folder.id !== this.folder.id) {
        //If any other context menu on a folder has been opened we close the current one
        this.isContextMenuVisible = false;
      }
    });
  }

  /**
   * Enable folder renaming by showing the input
   * @param event
   */
  editName(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.folder.isInEditMode = true;
  }

  /**
   * Disable file renaming and save the file
   */
  leaveEditMode() {
    this.folder.isInEditMode = false;
    this.folder.save();
  }

  /**
   * Called when the user right click on a file
   * @param event
   */
  onContextMenuShown(event: Event) {
    event.preventDefault();
    this.showContextMenu();
  }

  /**
   * Open the folder by going the folder tree
   */
  onFolderClicked() {
    if (this.isContextMenuVisible || this.folder.isInEditMode) {
      //We don't want to open it if the context menu is shown or if it is in edit mode
      return;
    }
    this.router.navigate(["/my-drive/folders", this.folder.id]);
  }

  /**
   * Notify to remove the folder
   * @param event
   */
  removeFolder(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.folderState = "out";
  }

  /**
   * Called on the end of the disapearing animation.
   * Notify the home page to remove the folder from
   * database and data storage
   */
  onHidingFolderDone() {
    if (this.folderState === "out") {
      this.onRemove.emit(this.folder);
    }
  }

  /**
   * Download the file
   * @param event
   */
  download(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    window.open(this.apiService.getFolderDownloadUrl(this.folder));
  }

  /**
   * Called when the user click on the context menu
   * @param event
   */
  onContextMenuClick(event: Event) {
    event.stopPropagation();
  }

  /**
   * Make the folder public
   * @param event
   */
  shareFolder(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.apiService.shareFolder(this.folder).then(folder => {
      this.folder = folder;
    });
  }

  /**
   * Make the folder private
   * @param event
   */
  stopSharingFolder(event: Event) {
    event.stopPropagation();
    this.isContextMenuVisible = false;
    this.apiService.stopSharingFolder(this.folder).then(folder => {
      this.folder = folder;
    });
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
   * Allow to drop file and folder in
   * @param ev
   */
  allowDrop(ev) {
    ev.preventDefault();
  }

  /**
   * Called when the folder is dragged by the user
   * @param ev
   */
  onDrag(ev) {
    //We store in the drag event the folder id to make the move possible afterwards
    ev.dataTransfer.setData("folderId", this.folder.id);
  }

  /**
   * Called when a folder or file is dropped into the folder
   * @param ev
   */
  onDrop(ev) {
    ev.preventDefault();
    //We get the file id and the folder id
    const fileId = ev.dataTransfer.getData("fileId");
    const folderId = ev.dataTransfer.getData("folderId");
    if (fileId) {
      //If the file id is defined, it means that the user dropped a file
      this.apiService.getDBFile(fileId).then(file => {
        //We get the file with the given id and change its folder to the current one
        file.folder = this.folder;
        file.save();
        //We emit this event to notify that the file has been dropped into another folder
        //to start the disapearing animation of the file
        this.fileDropped.emit(file);
      });
    } else if (folderId) {
      //If the folder id is defined, it means that the user dropped a folder
      this.apiService.getFolder(folderId).then(folder => {
        //We get the file with the given id and change its parent folder to the current one
        if (folder.id !== this.folder.id) {
          //We don't want to put the folder in itself
          folder.parent = this.folder;
          folder.save();
          //We emit this event to notify that the folder has been dropped into another folder
          //to start the disapearing animation of the folder
          this.folderDropped.emit(folder);
        }
      });
    }
  }
}
