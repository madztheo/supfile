import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { APIService } from "../api/api.service";

@Component({
  selector: "supfile-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"]
})
export class MenuComponent {
  username = "John Doe";
  chartData: any;
  chartOptions: any;
  storageUsed = 0;
  totalStorage = Math.pow(10, 9) * 30;

  constructor(private router: Router, private apiService: APIService) {}

  setChartData() {
    this.chartData = {
      datasets: [
        {
          data: [this.totalStorage - this.storageUsed, this.storageUsed],
          backgroundColor: ["#FF6384", "#36A2EB"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB"],
          borderWidth: 0
        }
      ],
      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: ["Free", "Used"]
    };
  }

  setChartOptions() {
    this.chartOptions = {
      legend: {
        display: false
      }
    };
  }

  getFormattedSize(size: number) {
    if (size < Math.pow(10, 3)) {
      return size;
    } else if (size < Math.pow(10, 6)) {
      return size / Math.pow(10, 3);
    } else if (size < Math.pow(10, 9)) {
      return size / Math.pow(10, 6);
    } else {
      return size / Math.pow(10, 9);
    }
  }

  getStorageSuffix(size: number) {
    if (size < Math.pow(10, 3)) {
      return "B";
    } else if (size < Math.pow(10, 6)) {
      return "KB";
    } else if (size < Math.pow(10, 9)) {
      return "MB";
    } else {
      return "GB";
    }
  }

  refreshStorageInfo() {
    this.apiService.getStorageInfo().then(storageInfo => {
      if (storageInfo) {
        this.storageUsed = storageInfo.used;
        this.totalStorage = storageInfo.allowed;
      }
      this.setChartData();
    });
  }

  ngOnInit() {
    this.setChartOptions();
    this.username = this.apiService.getCurrentUser().getUsername();
    this.refreshStorageInfo();
  }

  signOut() {
    this.apiService.logOut().then(() => {
      this.router.navigate(["/login"]);
    });
  }
}
