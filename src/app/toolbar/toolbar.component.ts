import { Component, Output, EventEmitter, Input } from "@angular/core";
import { DBFolder, DBFile } from "../api/db-classes";
import { APIService } from "../api/api.service";

@Component({
  selector: "supfile-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"]
})
export class ToolbarComponent {
  @Output() newFilesAdded = new EventEmitter<File>();
  @Output() onCreateNewFolder = new EventEmitter<any>();
  folderTree: DBFolder[] = [];
  folderTreeLoaded = false;
  @Output() fileDropped = new EventEmitter<DBFile>();
  @Output() folderDropped = new EventEmitter<DBFolder>();

  constructor(private apiService: APIService) {}

  onFileChanged(files: FileList) {
    if (files.length > 0) {
      this.newFilesAdded.emit(files[0]);
    }
  }

  private setFolderList(folder: DBFolder) {
    this.folderTree.unshift(folder);
    if (folder.parent) {
      if (!folder.parent.name) {
        folder.parent.fetch().then(() => {
          this.setFolderList(folder.parent);
        });
      } else {
        this.setFolderList(folder.parent);
      }
    } else {
      this.folderTreeLoaded = true;
    }
  }

  setFolderTree(folder?: DBFolder) {
    this.folderTree = [];
    this.folderTreeLoaded = false;
    if (folder) {
      this.setFolderList(folder);
    } else {
      this.folderTreeLoaded = true;
    }
  }

  createNewFolder() {
    this.onCreateNewFolder.emit();
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  onDrop(event, folder?: DBFolder) {
    event.preventDefault();
    const fileId = event.dataTransfer.getData("fileId");
    const folderId = event.dataTransfer.getData("folderId");
    if (fileId) {
      this.apiService.getDBFile(fileId).then(file => {
        if (folder) {
          file.folder = folder;
        } else {
          file.unset("folder");
        }
        file.save();
        this.fileDropped.emit(file);
      });
    } else if (folderId) {
      this.apiService.getFolder(folderId).then(fld => {
        if (folder) {
          if (fld.id !== folder.id) {
            fld.parent = folder;
          }
        } else {
          fld.unset("parent");
        }
        fld.save();
        this.folderDropped.emit(fld);
      });
    }
  }
}
