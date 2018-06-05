import { Injectable } from "@angular/core";
import * as Parse from "parse";
import { HttpClient } from "@angular/common/http";
import { DBFile, DBFolder, StorageInfo } from "./db-classes";
import * as fileType from "file-type";

@Injectable()
export class APIService {
  private serverUrl = "http://localhost:1337";
  private serverPublicKey = "r2iHRgNfOM8lih4";
  public webAppUrl = "http://localhost:4200";

  constructor(private http: HttpClient) {}

  /**
   * Initialize the connection to the server
   */
  initializeConnectionToServer() {
    //Initialize the connection to the server
    Parse.initialize(this.serverPublicKey);
    (<any>Parse).serverURL = this.serverUrl + "/parse";

    Parse.Object.registerSubclass("File", DBFile);
    Parse.Object.registerSubclass("Folder", DBFolder);
    Parse.Object.registerSubclass("StorageInfo", StorageInfo);
  }

  getCurrentUser() {
    return Parse.User.current();
  }

  /**
   * Log the user in
   * @param username
   * @param password
   */
  logIn(username: string, password: string) {
    return Parse.User.logIn(username.trim(), password).then(
      (userLogged: Parse.User) => {
        console.log(userLogged);
        return userLogged;
      }
    );
  }

  /**
   * Log out the user
   */
  logOut() {
    return Parse.User.logOut().then(res => {
      console.log("User logged out");
      console.log(res);
    });
  }

  /**
   * Create a new user
   * @param email
   * @param username
   * @param password
   */
  signUp(email: string, username: string, password: string) {
    const user = new Parse.User();
    user.setUsername(username.trim());
    user.setEmail(email.trim());
    user.setPassword(password);
    return user.signUp(null).then((userCreated: Parse.User) => {
      console.log(userCreated);
      return userCreated;
    });
  }

  private makeQuery(DBClass: any): Promise<any[]> {
    //Will only get users' items because it's the only ones he can
    //access, no need for further constraints
    let query = new Parse.Query(DBClass);
    return Promise.resolve(query.find());
  }

  getUsersFolders(parentFolder?: DBFolder): Promise<DBFolder[]> {
    let query = new Parse.Query(DBFolder);
    query.equalTo("user", this.getCurrentUser());
    query.equalTo("parent", parentFolder);
    return Promise.resolve(query.find());
  }

  getPublicFolders(parentFolder?: DBFolder): Promise<DBFolder[]> {
    let query = new Parse.Query(DBFolder);
    query.notEqualTo("user", this.getCurrentUser());
    query.equalTo("parent", parentFolder);
    return Promise.resolve(query.find());
  }

  getUsersFiles(folder?: DBFolder): Promise<DBFile[]> {
    let query = new Parse.Query(DBFile);
    query.equalTo("user", this.getCurrentUser());
    query.equalTo("folder", folder);
    return Promise.resolve(query.find());
  }

  getPublicFiles(folder?: DBFolder): Promise<DBFile[]> {
    let query = new Parse.Query(DBFile);
    query.notEqualTo("user", this.getCurrentUser());
    query.equalTo("folder", folder);
    return Promise.resolve(query.find());
  }

  getFolder(id: string): Promise<DBFolder> {
    return Promise.resolve(new Parse.Query(DBFolder).get(id));
  }

  getDBFile(id: string): Promise<DBFile> {
    return Promise.resolve(new Parse.Query(DBFile).get(id));
  }

  private getUploadUrl(fileName: string) {
    return Parse.Cloud.run("getUploadUrl", {
      fileName
    });
  }

  uploadFile(file: File, folder?: DBFolder): Promise<DBFile> {
    return Promise.resolve(
      this.getUploadUrl(file.name).then(res => {
        const url = res.url;
        return <any>this.http
          .put(url, file)
          .toPromise()
          .then(() => {
            const currentUser = this.getCurrentUser();
            let dbFile = new DBFile();
            dbFile.name = file.name;
            dbFile.type = file.type;
            dbFile.user = currentUser;
            if (folder) {
              dbFile.folder = folder;
            }
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                const type = fileType(e.target.result);
                if (type) {
                  dbFile.type = type.mime;
                } else {
                  dbFile.type = file.type;
                }
                resolve(dbFile.save());
              };
              reader.readAsArrayBuffer(file);
            });
          });
      })
    );
  }

  getFileUrl(file: DBFile) {
    return Parse.Cloud.run("getFileUrl", {
      fileName: file.fileName
    });
  }

  getPublicFileUrl(file: DBFile) {
    return Parse.Cloud.run("getPublicFileUrl", {
      fileId: file.id
    });
  }

  shareFile(file: DBFile) {
    return Parse.Cloud.run("shareFile", {
      fileId: file.id
    });
  }

  stopSharingFile(file: DBFile) {
    return Parse.Cloud.run("stopSharingFile", {
      fileId: file.id
    });
  }

  shareFolder(folder: DBFolder) {
    return Parse.Cloud.run("shareFolder", {
      folderId: folder.id
    });
  }

  stopSharingFolder(folder: DBFolder) {
    return Parse.Cloud.run("stopSharingFolder", {
      folderId: folder.id
    });
  }

  getFile(file: DBFile) {
    return `${this.serverUrl}/files/download/${
      file.fileName
    }?sessionToken=${this.getCurrentUser().getSessionToken()}`;
    /*return this.http.post(
      `${this.serverUrl}/files/download`,
      {
        fileName: file.fileName,
        sessionToken: this.getCurrentUser().getSessionToken()
      },
      { responseType: "blob" }
    );*/
  }

  getFolderDownloadUrl(folder: DBFolder) {
    return `${this.serverUrl}/folders/download/${
      folder.id
    }?sessionToken=${this.getCurrentUser().getSessionToken()}`;
  }

  downloadFolder(folder: DBFolder) {
    return this.http.post(
      `${this.serverUrl}/folders/download`,
      {
        folderId: folder.id,
        sessionToken: this.getCurrentUser().getSessionToken()
      },
      { responseType: "blob" }
    );
  }

  getStorageInfo() {
    let query = new Parse.Query(StorageInfo);
    query.equalTo("user", this.getCurrentUser());
    return Promise.resolve(query.first());
  }
}
