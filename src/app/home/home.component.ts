import { Component } from "@angular/core";
import { APIService } from "../api/api.service";
import { DBFile, DBFolder } from "../api/db-classes";

@Component({
  selector: "supfile-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  folders = [
    { id: "", name: "My folder", isInEditMode: false },
    { id: "", name: "Another folder", isInEditMode: false },
    { id: "", name: "Super folder", isInEditMode: false }
  ];
  files: DBFile[];

  constructor(private apiService: APIService) {}

  getFolders() {
    this.apiService.getUsersFolders().then(folders => {
      this.folders = folders.map(x => {
        return {
          id: x.id,
          name: x.name,
          isInEditMode: false
        };
      });
    });
  }

  getFiles() {
    this.apiService.getUsersFiles().then(files => {
      this.files = files;
      console.log(files);
    });
  }

  ngOnInit() {
    this.getFolders();
    this.getFiles();
  }

  createFolder() {
    this.folders.push({ id: "", name: "New folder", isInEditMode: false });
    let folder = new DBFolder();
  }

  removeFolder(folder: Folder) {
    this.folders = this.folders.filter(x => x !== folder);
  }

  onFilesAdded(file: File) {
    if (!file) {
      return;
    }
    this.apiService.uploadFile(file.name, file);
  }
}
