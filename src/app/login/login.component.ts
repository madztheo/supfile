import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from '../api/api.service';

declare const gapi: any;


@Component({
    selector: 'supfile-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LogInComponent {

    constructor(public router: Router, private apiService: APIService) {}
    auth2: any;
    ngAfterViewInit() {
        gapi.load('auth2',  () => {
            this.auth2 = gapi.auth2.init({
                client_id: '421233958586-jnug92ahf1fliq0v5ne35db88rja4rvd.apps.googleusercontent.com',
                cookiepolicy: 'single_host_origin',
                scope: 'profile email'
            });
            this.attachSignin(document.getElementById('googlelogin'));
        });
    }

    attachSignin(element) {
        this.auth2.attachClickHandler(element, {},
            (googleUser) => {
                const profile = googleUser.getBasicProfile();
                if (profile.getId() !== '' ) {
                    this.apiService.signGoogle(profile);
                    window.location.assign('/');
                                        }
            }, function (error) {
                console.log(error);
            });
    }

    onSubmit(event: Event) {
        event.preventDefault();
        this.router.navigate(['/']);
    }

    signUp() {
        this.router.navigate(['/signup']);
    }



}
