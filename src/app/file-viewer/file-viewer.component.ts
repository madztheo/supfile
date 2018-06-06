import {
  Component,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef
} from "@angular/core";
import {
  trigger,
  state,
  transition,
  style,
  animate
} from "@angular/animations";
import { DBFolder, DBFile } from "../api/db-classes";
import { APIService } from "../api/api.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "supfile-file-viewer",
  templateUrl: "./file-viewer.component.html",
  styleUrls: ["./file-viewer.component.scss"]
})
export class FileViewerComponent {
  fileUrl: any;
  fileContent: any;
  @Input() file: DBFile;
  @Output() onRemove = new EventEmitter<DBFile>();
  fileType: "video" | "image" | "text" | "audio" | "other";

  constructor(
    private apiService: APIService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  /**
   * Set the url of the file
   * @param url
   */
  setUrl(url: string) {
    this.fileType = this.getType(this.file.type);
    this.fileUrl = url;
    if (this.fileType === "text") {
      //If it's a file text, we get its content to inject it in the page
      this.http.get(this.fileUrl, { responseType: "text" }).subscribe(text => {
        this.fileContent = text;
      });
    }
  }

  /**
   * Set the url of the file if it's public
   */
  getPublicFileUrl() {
    this.apiService.getPublicFileUrl(this.file).then(({ url }) => {
      this.setUrl(url);
    });
  }

  /**
   * Set the url of the file if it's private
   */
  getFileUrl() {
    this.setUrl(this.apiService.getFileUrl(this.file));
  }

  /**
   * Get the type of the file
   * @param mimeType The MIME type to analyze
   */
  getType(mimeType: string) {
    if (mimeType.startsWith("image")) {
      return "image";
    } else if (mimeType.startsWith("video")) {
      return "video";
    } else if (mimeType.startsWith("audio")) {
      return "audio";
    } else if (mimeType.startsWith("text")) {
      return "text";
    } else {
      return "other";
    }
  }

  ngOnInit() {
    if (
      this.route.routeConfig.path == "my-drive/files/:id" ||
      this.route.routeConfig.path == "public/files/:id"
    ) {
      this.route.paramMap
        .pipe(
          switchMap((params: ParamMap) => {
            if (params.has("id")) {
              //We get the id from the route params
              const fileId = params.get("id");
              //We get the file with the given id
              return this.apiService.getDBFile(fileId);
            }
            return null;
          })
        )
        .subscribe(file => {
          this.file = file;
          if (this.file.user.id !== this.apiService.getCurrentUser().id) {
            this.getPublicFileUrl();
          } else {
            this.getFileUrl();
          }
        });
    }
  }

  /**
   * Open the file. Will view directly in the browser, if it can or will
   * download it otherwise
   */
  openFile() {
    window.open(this.fileUrl);
  }

  /**
   * Download the file. Will always download the file, wheter the browser
   * can show it directly or not
   */
  download() {
    window.open(this.apiService.getFileDownloadUrl(this.file));
  }
}
