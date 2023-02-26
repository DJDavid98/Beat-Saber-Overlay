import { mountAppComponent } from "./js/utils/mount-app-component";
import { App } from "./js/App";
import { HeartRate } from "./js/heartrate/HeartRate";

mountAppComponent('app-root', App, 500);
mountAppComponent('heart-rate-root', HeartRate);
