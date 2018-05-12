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
  storageUsed = 10;
  totalStorage = 30;

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

  ngOnInit() {
    this.setChartData();
    this.setChartOptions();
    this.username = this.apiService.getCurrentUser().getUsername();
  }

  signOut() {
    this.apiService.logOut().then(() => {
      this.router.navigate(["/login"]);
    });
  }
}
