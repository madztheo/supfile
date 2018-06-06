import * as Parse from "parse";

/**
 * Main class used by other database object
 * Contains the common property shared by all the objects,
 * that is the pointer to the user owning the object.
 */
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
    //Set the ACL so that only the user can read and write it
    this.setACL(new Parse.ACL(this.user));
    return super.save();
  }
}

/**
 * A folder, only represented in database not in data storage
 */
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

/**
 * Representation of file in the database
 */
export class DBFile extends MainDBItem {
  //The database name of the file (which can be changed for renaming)
  get name() {
    return this.get("name");
  }
  set name(value: string) {
    this.set("name", value);
  }

  //The original name of the file (will not change)
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

  //MIME type of the file
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

/**
 * Represent information about a user's storage use
 */
export class StorageInfo extends MainDBItem {
  //Storage used by the user in bytes
  get used() {
    return this.get("used");
  }
  set used(value: number) {
    this.set("used", value);
  }

  //Max storage the user is allowed to used
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
