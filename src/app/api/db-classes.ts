import * as Parse from "parse";

export class DBFolder extends Parse.Object {
  get name() {
    return this.get("name");
  }
  set name(value: string) {
    this.set("name", value);
  }

  get user() {
    return this.get("user");
  }
  set user(value: Parse.User) {
    this.set("user", value);
  }

  get parent() {
    return this.get("parent");
  }

  set parent(value: DBFolder) {
    this.set("parent", value);
  }

  constructor() {
    super("Folder");
  }
}

export class DBFile extends Parse.Object {
  get name() {
    return this.get("name");
  }
  set name(value: string) {
    this.set("name", value);
  }

  get user() {
    return this.get("user");
  }
  set user(value: Parse.User) {
    this.set("user", value);
  }

  get folder() {
    return this.get("folder");
  }
  set folder(value: DBFolder) {
    this.set("folder", value);
  }

  constructor() {
    super("File");
  }
}
