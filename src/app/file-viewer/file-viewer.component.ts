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

@Component({
  selector: "supfile-file-viewer",
  templateUrl: "./file-viewer.component.html",
  styleUrls: ["./file-viewer.component.scss"]
})
export class FileViewerComponent {
  @Input() rawFile: Blob;
  fileContent: any;
  @Input() file: DBFile;
  @Output() onRemove = new EventEmitter<DBFile>();
  fileType: "video" | "image" | "text" | "other";

  constructor(private apiService: APIService, private route: ActivatedRoute) {}

  getRawFile() {
    this.apiService.getFile(this.file).subscribe(rawFile => {
      this.rawFile = rawFile;
      this.getFileType();
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fileContent = e.target.result;
      };
      if (this.fileType !== "text" && this.fileType !== "other") {
        reader.readAsDataURL(this.rawFile);
      } else if (this.fileType !== "other") {
        reader.readAsText(this.rawFile);
      } else {
        //We let the browser take care of it for files we can't support
        const link = window.URL.createObjectURL(this.rawFile);
        window.open(link);
      }
    });
  }

  getFileType() {
    if (this.rawFile.type.startsWith("image")) {
      this.fileType = "image";
    } else if (this.rawFile.type.startsWith("video")) {
      this.fileType = "video";
    } else if (this.rawFile.type.startsWith("text")) {
      this.fileType = "text";
    } else {
      this.fileType = "other";
    }
  }

  ngOnInit() {
    if (this.route.routeConfig.path == "my-drive/files/:id") {
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
          this.getRawFile();
        });
    }
  }
}
