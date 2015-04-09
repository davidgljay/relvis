var relvisApp = angular.module('relvisApp', []);

relvisApp.controller('relvisCtrl', function ($scope, $interval) {

	var gridsize = 25
	var gridroot = Math.floor(Math.sqrt(gridsize))
	$scope.minradius = 5
	var padding = 80
	$scope.nodes=[];

	for (var i = gridsize^2 - 1; i>= 0; i--) {
		$scope.nodes.push({
			stability:0,
			targets:[
				randInt(0,gridsize),
				randInt(0,gridsize)
			]
		})
	};
	$scope.graph= {
		height:600,
		width:800
	}

	$scope.xpos = function(index) {
		return index%gridroot * padding + padding
	}

	$scope.ypos = function(index) {
		return Math.floor(index/gridroot) * padding + padding;
	}

	// $scope.circleClick = function(index) {
	// 	$scope.nodes[index].r++
	// }


		// $interval(function() {
		// 	xdelta++;
		// 	ydelta++;
		// 	$scope.nodes = [
		//     {'x': 15+xdelta, 'y': 20+ydelta, 'r':$scope.radius},
		//     {'x': 35+xdelta, 'y': 60+ydelta, 'r':$scope.radius},
		// ]
		// }, 10, 50);
});

var randInt = function(min,max) {
	return (Math.floor(Math.random() * (max - min + 1)) + min);
}