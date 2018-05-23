import { Component } from "@angular/core";
import { APIService } from "../api/api.service";
import { DBFile, DBFolder } from "../api/db-classes";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";

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

  constructor(
    private apiService: APIService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  getFolders() {
    if (this.route.routeConfig.path === "public/folders/:id") {
      return this.apiService
        .getPublicFolders(this.currentFolder)
        .then(folders => {
          this.folders = folders;
        });
    } else {
      return this.apiService
        .getUsersFolders(this.currentFolder)
        .then(folders => {
          this.folders = folders;
        });
    }
  }

  getFiles() {
    if (this.route.routeConfig.path === "public/folders/:id") {
      return this.apiService.getPublicFiles(this.currentFolder).then(files => {
        this.files = files;
        console.log(files);
      });
    } else {
      return this.apiService.getUsersFiles(this.currentFolder).then(files => {
        this.files = files;
        console.log(files);
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
              const folderId = params.get("id");
              return this.apiService.getFolder(folderId);
            }
            return null;
          })
        )
        .subscribe(folder => {
          this.currentFolder = folder;
          this.getFolders();
          this.getFiles();
        });
    } else {
      this.getFolders();
      this.getFiles();
    }
  }

  createFolder() {
    let folder = new DBFolder();
    folder.name = prompt("Folder name");
    folder.isInEditMode = false;
    folder.user = this.apiService.getCurrentUser();
    if (this.currentFolder) {
      folder.parent = this.currentFolder;
    }
    this.folders.push(folder);
    folder.save();
  }

  removeFolder(folder: DBFolder) {
    this.folders = this.folders.filter(x => x !== folder);
    folder.destroy();
  }

  removeFile(file: DBFile) {
    this.files = this.files.filter(x => x !== file);
    file.destroy();
  }

  onFilesAdded(file: File) {
    this.inProgress = true;
    if (!file) {
      return;
    }
    this.apiService.uploadFile(file, this.currentFolder).then((dbFile: any) => {
      console.log(dbFile);
      this.files.push(dbFile);
      this.inProgress = false;
    });
  }
}
