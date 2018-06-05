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

  getRawFile() {
    /*this.apiService.getFile(this.file).subscribe(rawFile => {
      console.log(rawFile);
      this.fileUrl = rawFile;
      this.fileType = this.getType(rawFile.type);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fileContent = e.target.result;
      };
      if (this.fileType !== "text" && this.fileType !== "other") {
        reader.readAsDataURL(this.fileUrl);
      } else if (this.fileType !== "other") {
        reader.readAsText(this.fileUrl);
      }
    });*/
  }

  setUrl(url: string) {
    this.fileType = this.getType(this.file.type);
    this.fileUrl = url;
    if (this.fileType === "text") {
      this.http.get(this.fileUrl, { responseType: "text" }).subscribe(text => {
        this.fileContent = text;
      });
    }
  }

  getPublicFileUrl() {
    this.apiService.getPublicFileUrl(this.file).then(({ url }) => {
      this.setUrl(url);
    });
  }

  getFileUrl() {
    this.apiService.getFileUrl(this.file).then(({ url }) => {
      this.setUrl(url);
    });
  }

  getType(mimeType: string) {
    console.log(mimeType);
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
              const fileId = params.get("id");
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

  openFile() {
    window.open(this.fileUrl);
  }

  download() {
    window.open(this.apiService.getFile(this.file));
  }
}
