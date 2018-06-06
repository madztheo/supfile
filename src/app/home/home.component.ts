import { Component, ViewChild } from "@angular/core";
import { APIService } from "../api/api.service";
import { DBFile, DBFolder } from "../api/db-classes";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MenuComponent } from "../menu/menu.component";

@Component({
  selector: "supfile-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  currentFolder: DBFolder;
  folders: DBFolder[];
  files: DBFile[];
  inProgress = false;
  @ViewChild(ToolbarComponent) toolbar: ToolbarComponent;
  @ViewChild(MenuComponent) menu: MenuComponent;

  constructor(
    private apiService: APIService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Get the folders for the current folder
   */
  getFolders() {
    if (this.route.routeConfig.path === "public/folders/:id") {
      //It's a public link
      return this.apiService
        .getPublicFolders(this.currentFolder)
        .then(folders => {
          this.folders = folders;
        });
    } else {
      //It's a private link
      return this.apiService
        .getUsersFolders(this.currentFolder)
        .then(folders => {
          this.folders = folders;
        });
    }
  }

  /**
   * Get the files of the current folder
   */
  getFiles() {
    if (this.route.routeConfig.path === "public/folders/:id") {
      return this.apiService.getPublicFiles(this.currentFolder).then(files => {
        this.files = files;
      });
    } else {
      return this.apiService.getUsersFiles(this.currentFolder).then(files => {
        this.files = files;
      });
    }
  }

  ngOnInit() {
    if (
      this.route.routeConfig.path === "my-drive/folders/:id" ||
      this.route.routeConfig.path === "public/folders/:id"
    ) {
      this.route.paramMap
        .pipe(
          switchMap((params: ParamMap) => {
            if (params.has("id")) {
              //Get the current folder from the route param
              const folderId = params.get("id");
              return this.apiService.getFolder(folderId);
            }
            return null;
          })
        )
        .subscribe(folder => {
          //Set the current folder and the breadcrumb up to root
          this.currentFolder = folder;
          this.toolbar.setFolderTree(this.currentFolder);
          this.getFolders();
          this.getFiles();
        });
    } else {
      //If here, we're in the root folder
      this.toolbar.setFolderTree();
      this.getFolders();
      this.getFiles();
    }
  }

  /**
   * Create a new folder
   */
  createFolder() {
    let folder = new DBFolder();
    //Ask through a prompt the name of the folder
    folder.name = prompt("Folder name");
    if (!folder.name) {
      //We cancel everything if the user didn't give a name
      return;
    }
    folder.isInEditMode = false;
    folder.user = this.apiService.getCurrentUser();
    if (this.currentFolder) {
      folder.parent = this.currentFolder;
    }
    this.folders.push(folder);
    folder.save();
  }

  /**
   * Remove the given folder
   * @param folder
   */
  removeFolder(folder: DBFolder) {
    //Take out the folder from the folder list first
    this.folders = this.folders.filter(x => x !== folder);
    //Remove the folder from the database
    folder.destroy().then(() => {
      setTimeout(() => {
        //Refresh the storage statistics
        this.menu.refreshStorageInfo();
      }, 2000);
    });
  }

  /**
   * Remove the given file
   * @param file
   */
  removeFile(file: DBFile) {
    //Take out the file from the file list
    this.files = this.files.filter(x => x !== file);
    //Remove the file from the database (and from the datastorage on server-side)
    file.destroy().then(() => {
      setTimeout(() => {
        //Refresh the storage statistics
        this.menu.refreshStorageInfo();
      }, 2000);
    });
  }

  /**
   * Called when the user ask to upload a file
   * @param file
   */
  onFilesAdded(file: File) {
    //Show the progress bar
    this.inProgress = true;
    if (!file) {
      return;
    }
    //Upload the file to data storage
    this.apiService
      .uploadFile(file, this.currentFolder)
      .then((dbFile: DBFile) => {
        this.files.push(dbFile);
        //Hide the progress bar
        this.inProgress = false;
        setTimeout(() => {
          //Refresh the storage statistics
          this.menu.refreshStorageInfo();
        }, 2000);
      });
  }

  /**
   * Called when a file has been dragged to another folder
   * @param file
   */
  onFileMoved(file: DBFile) {
    this.files = this.files.filter(x => x.id !== file.id);
  }

  /**
   * Called when a folder has been dragged to another folder
   * @param folder
   */
  onFolderMoved(folder: DBFolder) {
    this.folders = this.folders.filter(x => x.id !== folder.id);
  }
}
