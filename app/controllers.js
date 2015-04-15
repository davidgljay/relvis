var relvisApp = angular.module('relvisApp', ['ngSlider']);

relvisApp.controller('relvisCtrl', function ($scope, $interval) {

	//TODOS:
	//Emergent Targetting
	//Sliders

	//Model variables
	$scope.maxStability = 15
	$scope.bitEscapeChance = 0
	$scope.minradius = 2
	$scope.bitradius = 3
	$scope.gridsize = 25
	$scope.initialStability = 1 
	$scope.bitVisibility = 100
	$scope.numTargets=1
	$scope.locality=3
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
		$scope.rangeOptions = {
			from:0,
			to:gridroot,
			step:1,
			css:slidercss
		}
	})

	$scope.$watch('initialStability', function() {
		resetGrid()
	})

	$scope.$watch('locality', function() {
		if ($scope.locality > gridroot) {
			$scope.locality = gridroot
		}
	})

	var slidercss = {
        background: {"background-color": "white"},
        before: {"background-color": "#26466D"},
        default: {"background-color": "white"},
        after: {"background-color": "#26466D"},
        range:{"visibility":"hidden"},
        pointer: {"background-color": "#26466D"}  	
	}

	$scope.gridsizeOptions = {
		from:0,
		to:100,
		step:1,
		vertical:false,
		css:slidercss
	}

	$scope.initialBitOptions = {
		from:0,
		to:5,
		step:1,
		css:slidercss
	}

	$scope.percentageOptions = {
		from:0,
		to:100,
		step:1,
		dimension:"%",
		css:slidercss
	}

	$scope.rangeOptions = {
		from:0,
		to:gridroot,
		step:1,
		css:slidercss
	}

	$scope.bitsPerNodeOptions = {
		from:0,
		to:3,
		step:1,
		css:slidercss
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
							nodes[i].targets[j] = i+findTarget(i)
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
					if (0<=nodes[i].targets[j] && nodes[i].targets[j]<$scope.gridsize) {
						$scope.lines.push(targetLine)
					}
				}
			}
		}, 1500/$scope.gridsize) 
	}

	var resetGrid = function() {
		gridroot = Math.floor(Math.sqrt($scope.gridsize))
		$scope.graph= {
			height:(gridroot+2)*padding,
			width:(gridroot+1)*padding
		}
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
					j+findTarget(j)
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

	var findTarget = function(pos) {
			var deltaX=Math.round(randInt($scope.locality*-1,$scope.locality))
			var deltaY=Math.round(randInt($scope.locality*-1,$scope.locality)*gridroot)
			if (deltaY==0 || deltaX==0) {
				//Don't target yourself
				return findTarget(pos)	
			}
			if (pos+deltaY+deltaX > $scope.gridsize-1 || pos+deltaY+deltaX < 0) {
				//Don't target outside of the grid
				return findTarget(pos)
			}
		return deltaX+deltaY
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