import { Injectable } from "@angular/core";
import * as Parse from "parse";
import { HttpClient } from "@angular/common/http";
import { DBFile, DBFolder } from "./db-classes";

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

  getUsersFolders(): Promise<DBFolder[]> {
    return this.makeQuery(DBFolder);
  }

  getUsersFiles(): Promise<DBFile[]> {
    return this.makeQuery(DBFile);
  }

  private getUploadUrl(fileName: string) {
    return Parse.Cloud.run("getUploadUrl", {
      fileName
    });
  }

  uploadFile(fileName: string, file: File, folder?: DBFolder) {
    return this.getUploadUrl(fileName).then(res => {
      const url = res.url;
      return this.http.put(url, file).subscribe(() => {
        const currentUser = this.getCurrentUser();
        let dbFile = new Parse.Object("File");
        dbFile.set("name", fileName);
        dbFile.set("user", currentUser);
        if (folder) {
          dbFile.set("folder", folder);
        }
        dbFile.setACL(new Parse.ACL(currentUser));
        dbFile.save().then(() => console.log("File saved to db"));
      });
    });
  }

  getFileUrl(file: DBFile) {
    console.log(file);
    return Parse.Cloud.run("getFileUrl", {
      fileName: file.name
    });
  }
}
