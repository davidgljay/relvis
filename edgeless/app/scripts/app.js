'use strict';

/**
 * @ngdoc overview
 * @name edgelessApp
 * @description
 * # edgelessApp
 *
 * Main module of the application.
 */
angular
  .module('edgelessApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularAwesomeSlider'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'relvisCtrl',
        controllerAs: 'relvis'
      })
      .when('/about', {
        templateUrl: 'views/blog.html',
        controller: 'blogCtrl',
        controllerAs: 'blog'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
