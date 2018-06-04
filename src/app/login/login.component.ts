import { Component } from '@angular/core';
import { Router } from '@angular/router';


declare const gapi: any;


@Component({
    selector: 'supfile-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LogInComponent {

    constructor(public router: Router) {}
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
                console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
                console.log('Name: ' + profile.getName());
                console.log('Image URL: ' + profile.getImageUrl());
                console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
                if (profile.getId() !== '' ) {


                    window.location.assign('/dashboard');

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
