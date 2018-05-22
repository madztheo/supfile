import { Injectable } from "@angular/core";
import * as Parse from "parse";
import { HttpClient } from "@angular/common/http";
import { DBFile, DBFolder } from "./db-classes";
import * as fileType from "file-type";

@Injectable()
export class APIService {
  private serverUrl = "http://localhost:1337";
  private serverPublicKey = "r2iHRgNfOM8lih4";

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
    //if (parentFolder) {
    query.equalTo("parent", parentFolder);
    //}
    return Promise.resolve(query.find());
  }

  getUsersFiles(folder?: DBFolder): Promise<DBFile[]> {
    let query = new Parse.Query(DBFile);
    //if (folder) {
    query.equalTo("folder", folder);
    //}
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

  getFile(file: DBFile) {
    return this.http.post(
      `${this.serverUrl}/files/download`,
      {
        fileName: file.fileName,
        sessionToken: this.getCurrentUser().getSessionToken()
      },
      { responseType: "blob" }
    );
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
}
