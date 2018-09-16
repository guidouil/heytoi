import { sAlert } from 'meteor/juliancwirko:s-alert';

sAlert.config({
  effect: 'stackslide',
  position: 'top',
  timeout: 4000,
  onRouteClose: false,
  stack: false,
});
