import * as Parse from "parse";

export class MainDBItem extends Parse.Object {
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

export class DBFolder extends MainDBItem {
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

export class DBFile extends MainDBItem {
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

  get type() {
    return this.get("type");
  }
  set type(value: string) {
    this.set("type", value);
  }

  isInEditMode: boolean;

  constructor() {
    super("File");
  }
}

export class StorageInfo extends MainDBItem {
  get used() {
    return this.get("used");
  }
  set used(value: number) {
    this.set("used", value);
  }

  get allowed() {
    return this.get("allowed");
  }

  set allowed(value: number) {
    this.set("allowed", value);
  }

  constructor() {
    super("StorageInfo");
  }
}
