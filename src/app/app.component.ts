import { Component } from '@angular/core';
import { APIService } from './api/api.service';

@Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>'
})
export class AppComponent {
    title = 'app';

    constructor(private apiService: APIService) {}

    ngOnInit() {
        this.apiService.initializeConnectionToServer();
    }
}

