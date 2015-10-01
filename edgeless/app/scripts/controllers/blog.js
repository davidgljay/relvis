'use strict';

/**
 * @ngdoc function
 * @name edgelessApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the edgelessApp
 */
angular.module('edgelessApp')
  .controller('blogCtrl', function ($scope,$routeParams) {
    $scope.posts = [{
        	"code":"relationality",
        	"pubdate":"10/1/2015",
        	"title":"Relationality"
        }];
     $scope.currentPost = $routeParams.post || $scope.posts.reverse()[0];
     $scope.postpath = 'views/blog/' + $scope.currentPost.code + '.html';
  });
