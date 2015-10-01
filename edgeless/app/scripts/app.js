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
      .when('/blog/:post', {
        templateUrl: 'views/blog.html',
        controller: 'blogCtrl',
        controllerAs: 'blog'
      })
      .when('/blog', {
        templateUrl: 'views/blog.html',
        controller: 'blogCtrl',
        controllerAs: 'blog'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(['$rootScope', '$route', function($rootScope, $route) {
    $rootScope.$on('$routeChangeSuccess', function() {
        $rootScope.active = $route.current.controllerAs;
  });
}]);
