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

  /**
   * Get the current logged user. If no user is connected it will be null
   */
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

  /**
   * Get the folders in a specific part of the folder tree belonging to current user
   * @param parentFolder The parent folder determining which part of the folder tree we want to get
   */
  getUsersFolders(parentFolder?: DBFolder): Promise<DBFolder[]> {
    let query = new Parse.Query(DBFolder);
    query.equalTo("user", this.getCurrentUser());
    query.equalTo("parent", parentFolder);
    return Promise.resolve(query.find());
  }

  /**
   * Same as getUsersFolders but for folders publically accessible
   * @param parentFolder The parent folder determining which part of the folder tree we want to get
   */
  getPublicFolders(parentFolder?: DBFolder): Promise<DBFolder[]> {
    let query = new Parse.Query(DBFolder);
    query.notEqualTo("user", this.getCurrentUser());
    query.equalTo("parent", parentFolder);
    return Promise.resolve(query.find());
  }

  /**
   * Get the files belonging to users in a specific folder
   * @param folder The folder in which to get the files (if not specified, it will the root of the folder tree)
   */
  getUsersFiles(folder?: DBFolder): Promise<DBFile[]> {
    let query = new Parse.Query(DBFile);
    query.equalTo("user", this.getCurrentUser());
    query.equalTo("folder", folder);
    return Promise.resolve(query.find());
  }

  /**
   * Get the files publically accessible
   * @param folder The folder in which to get the files (if not specified, it will the root of the folder tree)
   */
  getPublicFiles(folder?: DBFolder): Promise<DBFile[]> {
    let query = new Parse.Query(DBFile);
    query.notEqualTo("user", this.getCurrentUser());
    query.equalTo("folder", folder);
    return Promise.resolve(query.find());
  }

  /**
   * Get a folder from database
   * @param id The id of the folder to get
   */
  getFolder(id: string): Promise<DBFolder> {
    return Promise.resolve(new Parse.Query(DBFolder).get(id));
  }

  /**
   * Get a file from database
   * @param id The id of the file to get
   */
  getDBFile(id: string): Promise<DBFile> {
    return Promise.resolve(new Parse.Query(DBFile).get(id));
  }

  /**
   * Get the url to upload a file to
   * @param fileName The name of the file to upload
   */
  private getUploadUrl(fileName: string) {
    return Parse.Cloud.run("getUploadUrl", {
      fileName
    });
  }

  /**
   * Upload a file to data storage
   * @param file The file to upload
   * @param folder The folder to put the file
   */
  uploadFile(file: File, folder?: DBFolder): Promise<DBFile> {
    return Promise.resolve(
      //We get the upload url
      this.getUploadUrl(file.name).then(res => {
        const url = res.url;
        //Push the file to the upload url
        return <any>this.http
          .put(url, file)
          .toPromise()
          .then(() => {
            const currentUser = this.getCurrentUser();
            //Create representation of the uploaded file into the database
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
                //We detect the MIME type from the array buffer of the file
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

  /**
   * Get the public url of a file
   * @param file
   */
  getPublicFileUrl(file: DBFile) {
    return Parse.Cloud.run("getPublicFileUrl", {
      fileId: file.id
    });
  }

  /**
   * Allow sharing on a file by making it publically readable
   * @param file
   */
  shareFile(file: DBFile) {
    return Parse.Cloud.run("shareFile", {
      fileId: file.id
    });
  }

  /**
   * Disallow sharing on a file by making it fully private
   * @param file
   */
  stopSharingFile(file: DBFile) {
    return Parse.Cloud.run("stopSharingFile", {
      fileId: file.id
    });
  }

  /**
   * Allow sharing on a folder by making it publically readable
   * @param file
   */
  shareFolder(folder: DBFolder) {
    return Parse.Cloud.run("shareFolder", {
      folderId: folder.id
    });
  }

  /**
   * Disallow sharing on a folder by making it fully private
   * @param file
   */
  stopSharingFolder(folder: DBFolder) {
    return Parse.Cloud.run("stopSharingFolder", {
      folderId: folder.id
    });
  }

  /**
   * Get the url to view a file
   * @param file
   */
  getFileUrl(file: DBFile) {
    return `${this.serverUrl}/files/download/${
      file.fileName
    }?sessionToken=${this.getCurrentUser().getSessionToken()}`;
  }

  /**
   * Get the url to download a file
   * @param file
   */
  getFileDownloadUrl(file: DBFile) {
    return `${this.serverUrl}/files/download/${
      file.fileName
    }?sessionToken=${this.getCurrentUser().getSessionToken()}&forceDownload=true`;
  }

  /**
   * Get the url to download a folder as a zip archive
   * @param folder
   */
  getFolderDownloadUrl(folder: DBFolder) {
    return `${this.serverUrl}/folders/download/${
      folder.id
    }?sessionToken=${this.getCurrentUser().getSessionToken()}`;
  }

  /**
   * Get the storage information of a user
   */
  getStorageInfo() {
    let query = new Parse.Query(StorageInfo);
    query.equalTo("user", this.getCurrentUser());
    return Promise.resolve(query.first());
  }

  /**
   *  Sign in Google user
   * */
  signGoogle(profile) {
    return this.signUp(
      profile.getEmail(),
      profile.getName(),
      profile.getId()
    ).then(
      user => user,
      err => {
        if (err.code === 202) {
          console.log("username already taken");
          return this.logIn(profile.getName(), profile.getId());
        }
      }
    );
  }
}
