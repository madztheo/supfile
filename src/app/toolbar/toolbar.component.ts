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

  /**
   * Called when the user select a new file
   * @param files
   */
  onFileChanged(files: FileList) {
    if (files.length > 0) {
      //Notify the home page of the file to upload
      this.newFilesAdded.emit(files[0]);
    }
  }

  /**
   * Set the folder list
   * @param folder The current folder
   */
  private setFolderList(folder: DBFolder) {
    //Add the folder at the start of the list
    this.folderTree.unshift(folder);
    if (folder.parent) {
      if (!folder.parent.name) {
        //If the parent name is not defined we fetch it
        folder.parent.fetch().then(() => {
          //Call the function again with the parent folder
          //to climb up the folder tree
          this.setFolderList(folder.parent);
        });
      } else {
        //Call the function again with the parent folder
        //to climb up the folder tree
        this.setFolderList(folder.parent);
      }
    } else {
      //If the folder parent is not defined, it means that we've reached the root.
      //So we're done
      this.folderTreeLoaded = true;
    }
  }

  /**
   * Set the breadcrumb
   * @param folder The current folder
   */
  setFolderTree(folder?: DBFolder) {
    this.folderTree = [];
    this.folderTreeLoaded = false;
    if (folder) {
      this.setFolderList(folder);
    } else {
      //If the folder is not defined, it means we're in the root folder
      this.folderTreeLoaded = true;
    }
  }

  /**
   * Request a new folder to be created
   */
  createNewFolder() {
    this.onCreateNewFolder.emit();
  }

  /**
   * Allow to drop files and folders on it
   * @param ev
   */
  allowDrop(ev) {
    ev.preventDefault();
  }

  /**
   * Called when a folder or file is dropped into the folder
   * @param ev
   */
  onDrop(event, folder?: DBFolder) {
    event.preventDefault();
    //We get the file id and the folder id
    const fileId = event.dataTransfer.getData("fileId");
    const folderId = event.dataTransfer.getData("folderId");
    if (fileId) {
      //If the file id is defined, it means that the user dropped a file
      this.apiService.getDBFile(fileId).then(file => {
        if (folder) {
          file.folder = folder;
        } else {
          //It's the root folder, so the parent must be undefined
          file.unset("folder");
        }
        file.save();
        //We emit this event to notify that the file has been dropped into another folder
        //to start the disapearing animation of the file
        this.fileDropped.emit(file);
      });
    } else if (folderId) {
      //If the folder id is defined, it means that the user dropped a folder
      this.apiService.getFolder(folderId).then(fld => {
        if (folder) {
          if (fld.id !== folder.id) {
            //We don't want to put the folder in itself
            fld.parent = folder;
          }
        } else {
          //It's the root folder, so the parent must be undefined
          fld.unset("parent");
        }
        fld.save();
        //We emit this event to notify that the folder has been dropped into another folder
        //to start the disapearing animation of the folder
        this.folderDropped.emit(fld);
      });
    }
  }
}
