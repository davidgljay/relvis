var relvisApp = angular.module('relvisApp', []);

relvisApp.controller('relvisCtrl', function ($scope, $interval) {

	//TODOS:
	//Emergent Targetting
	//Sliders

	//Model variables
	$scope.maxStability = 20
	$scope.bitEscapeChance = 0
	$scope.minradius = 2
	$scope.bitradius = 3
	$scope.gridsize = 25
	$scope.initialStability = 0 
	$scope.bitVisibility = 1
	$scope.numTargets=1
	$scope.locality=1
	var stabilityBoost = 2
	var gridroot

	//Styling variables
	var padding = 60
	var maxLineWidth = 4
	var timeCounter = 0

	//Promise variables
	var transmitLoop
	var bitLoop

	//Data arrays
	var nodes = $scope.nodes=[]
	var bits = $scope.bits=[]
	var lines = $scope.lines=[]

	$scope.$watch('gridsize', function() {
		resetGrid()
	})

	$scope.$watch('initialStability', function() {
		resetGrid()
	})

	$scope.$watch('locality', function() {
		if ($scope.locality > gridroot) {
			$scope.locality = gridroot
		}
	})

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
		if ($scope.nodes[index].stability <= $scope.maxStability) {
			$scope.nodes[index].stability++
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
					if(bits[i].completion==100 && nodes[bits[i].target] && nodes[bits[i].target].stability < $scope.maxStability) {
						nodes[bits[i].target].stability += stabilityBoost
					}				
				} else {
					bits.remove(i)
				}
			};
		},1)
	}

	var setTransmitLoop = function() {
		return $interval(function() {
			timeCounter++
			var i = timeCounter%$scope.gridsize
			if (nodes[i] && nodes[i].stability) {
				$scope.lines.remove(i)
				for (var j =0; j<$scope.numTargets; j++) {
					if (randInt(0,$scope.maxStability) > nodes[i].stability) {
						if (randInt(0,100) < $scope.bitEscapeChance) {
							nodes[i].targets[j] = parseInt($scope.gridsize) + randInt(0,gridroot-1)				
						} else {
							var deltaX=Math.round(randInt($scope.locality*-1,$scope.locality))
							var deltaY=Math.round(randInt($scope.locality*-1,$scope.locality)*gridroot)
							if (deltaY==deltaX==0) {
								deltaX=-1	
							}
							if (i+deltaY+deltaX > $scope.gridsize || i+deltaY+deltaX < 0) {
								deltaY=deltaY*-1
								deltaX=deltaX*-1
							}
							nodes[i].targets[j] = i+deltaX+deltaY		
						} 
					} 
					transmit(i,nodes[i].targets[j])
					if (nodes[i].stability>0) {
						nodes[i].stability--						
					}
					var targetLine={
						"style": {
							"opacity": nodes[i].stability/$scope.maxStability-.5,
						},
						"target":nodes[i].targets[j],
						"sender":i
					}
					if (0<nodes[i].targets[j] && nodes[i].targets[j]<$scope.gridsize) {
						$scope.lines.push(targetLine)
					}
				}
			}
		}, 1500/$scope.gridsize) 
	}

	var resetGrid = function() {
		gridroot = Math.floor(Math.sqrt($scope.gridsize))
		$scope.nodes=[]

		$scope.lines=[]
		for (var i = 0; i<= $scope.gridsize - 1; i++) {
			$scope.nodes.push({
				stability:$scope.initialStability,
				targets:[],
				lineWidth:0
			})
			for (var j = $scope.numTargets; j > 0; j--) {
				$scope.nodes[i].targets.push(
					randInt(0,$scope.gridsize-1)
				)
			};
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