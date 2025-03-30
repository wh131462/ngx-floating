import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { GithubOutline,CodeSandboxOutline,EyeOutline,EyeInvisibleOutline } from '@ant-design/icons-angular/icons';
import {NzIconModule} from "ng-zorro-antd/icon";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),importProvidersFrom(BrowserAnimationsModule,NzIconModule.forRoot([GithubOutline,CodeSandboxOutline,EyeOutline,EyeInvisibleOutline]))]
};
