var relvisApp = angular.module('relvisApp', []);

relvisApp.controller('relvisCtrl', function ($scope, $interval) {
	var gridsize
	var gridroot
	var maxStability = $scope.maxStability = 20
	$scope.bitEscapeChance = bitEscapeChance = 10
	var stabilityBoost = 2
	var initialStability = 2
	$scope.minradius = 5
	$scope.bitradius = 3
	var padding = 60
	var nodes = $scope.nodes=[]
	var bits = $scope.bits=[]
	var timeCounter = 0
	var transmitLoop
	var bitLoop

	$scope.$watch('gridsize', function() {
		gridsize = $scope.gridsize
		gridroot = Math.floor(Math.sqrt(gridsize))
		$scope.nodes=[]
		for (var i = gridsize - 1; i>= 0; i--) {
			$scope.nodes.push({
				stability:initialStability,
				target:randInt(0,gridsize-1)
			})
		};

		if (transmitLoop) {
			$interval.cancel(transmitLoop)
		}
		transmitLoop = setTransmitLoop()

		if (bitLoop) {
			$interval.cancel(bitLoop)
		}
		bitLoop = setBitLoop()

		nodes = $scope.nodes
	})

	$scope.$watch('maxStability', function() {
		maxStability = $scope.maxStability
	})

	$scope.$watch('maxStability', function() {
		maxStability = $scope.maxStability
	})

	$scope.gridsize = 25

	$scope.graph= {
		height:800,
		width:800
	}

	var xpos = $scope.xpos = function(index) {
		return index%gridroot * padding + padding
	}

	var ypos = $scope.ypos = function(index) {
		return Math.floor(index/gridroot) * padding + padding;
	}

	$scope.tapNode = function(index) {
		if ($scope.nodes[index].stability <= maxStability) {
			$scope.nodes[index].stability++
		}
	}

	$scope.lineOpacity = function(stability) {
		if (stability > maxStability/2) {
			return stability/maxStability
		} else {
			return 0
		}
	}

	var transmit = function(sender, target) {
			var senderx = xpos(sender)
			var sendery = ypos(sender)
			var targetx = xpos(target)
			var targety = ypos(target)

			bits.push({
				sender:sender,
				target:target,
				x:senderx, 
				y:sendery, 
				completion:0
			})
	}

	//Transmit bits
	var setBitLoop = function() {
		return $interval(function() {
			for (var i = bits.length - 1; i >= 0; i--) {
				if (bits[i].completion<100) {
					bits[i].completion++
					bits[i].x = bits[i].completion/100*(xpos(bits[i].target)-xpos(bits[i].sender)) + xpos(bits[i].sender)
					bits[i].y = bits[i].completion/100*(ypos(bits[i].target)-ypos(bits[i].sender)) + ypos(bits[i].sender)
					if(bits[i].completion==100 && nodes[bits[i].target] && nodes[bits[i].target].stability < maxStability) {
						nodes[bits[i].target].stability += stabilityBoost
					}				
				} else {
					bits.remove(i)
				}
			};
		},20)
	}

	var setTransmitLoop = function() {
		return $interval(function() {
			timeCounter++
			var i = timeCounter%gridsize
			if (nodes[i] && nodes[i].stability) {
				nodes[i].stability--
				if (randInt(0,maxStability) > nodes[i].stability) {
					if (randInt(0,100) < bitEscapeChance) {
						nodes[i].target = parseInt(gridsize) + randInt(0,gridroot-1)				
					} else {
						nodes[i].target = randInt(0,gridsize-1)					
					}
				}
				transmit(i,nodes[i].target)
			}
		}, 1500/gridsize) 
	}

});



var randInt = function(min,max) {
	return (Math.floor(Math.random() * (max - min + 1)) + min);
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};