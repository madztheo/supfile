import * as Parse from "parse";

export class MainDBFolder extends Parse.Object {
  get user() {
    return this.get("user");
  }
  set user(value: Parse.User) {
    this.set("user", value);
  }

  constructor(className: string) {
    super(className);
  }

  save() {
    this.setACL(new Parse.ACL(this.user));
    return super.save();
  }
}

export class DBFolder extends MainDBFolder {
  get name() {
    return this.get("name");
  }
  set name(value: string) {
    this.set("name", value);
  }

  get parent() {
    return this.get("parent");
  }

  set parent(value: DBFolder) {
    this.set("parent", value);
  }

  isInEditMode: boolean;

  constructor() {
    super("Folder");
  }
}

export class DBFile extends MainDBFolder {
  get name() {
    return this.get("name");
  }
  set name(value: string) {
    this.set("name", value);
  }

  get fileName() {
    return this.get("fileName");
  }

  set fileName(value: string) {
    this.set("fileName", value);
  }

  get folder() {
    return this.get("folder");
  }
  set folder(value: DBFolder) {
    this.set("folder", value);
  }

  isInEditMode: boolean;

  constructor() {
    super("File");
  }
}
