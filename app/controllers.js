var relvisApp = angular.module('relvisApp', ['ngSlider']);

relvisApp.controller('relvisCtrl', function ($scope, $interval) {

	//Variables used to define the behavior of the model.
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
	$scope.title = "Edgless Networks"

	//Variables used to track timers that update the model and provide animation
	var transmitLoop
	var bitLoop

	//Data arrays
	var nodes = $scope.nodes=[]
	var bits = $scope.bits=[]
	var lines = $scope.lines=[]

	//Calculate the X and Y position of nodes.
	var xpos = $scope.xpos = function(index) {
		return index%gridroot * padding + padding
	}

	var ypos = $scope.ypos = function(index) {
		return Math.floor(index/gridroot) * padding + padding;
	}

	//Transmit a bit from one node to another.
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

	//Function which lets a node find a new target.
	//Note, targets are returned as a delta from the nodes' current position.
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

	//Animate the bits as they move from one node to another. 
	//When a bit reaches a node, increase that node's stability.
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

	//Cycle through all of the nodes.
	//If a node has some stability, transmit a bit and decrease its stability.
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

	//Reset the grid.
	//Eliminate all bits and lines, and set all nodes to the default stability.
	var resetGrid = function() {
		gridroot = Math.min(Math.round(Math.sqrt($scope.gridsize)),8);
		var height = ($scope.gridsize/gridroot+1)*padding;
		var width = (gridroot+1)*padding
		$scope.graph= {
			height:height,
			width:width
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

		//Restart the timers to transmit and animate bits.
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

	//Trigger events when the user manipulates model variables (ie, when the user changes the grid size reset everything.)
	$scope.$watch('gridsize', function() {
		resetGrid()
		$scope.rangeOptions = {
			from:0,
			to:gridroot,
			step:1,
			skin:"round"
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

	setSliderOptions($scope, gridroot);

	//Make a node more stable when the user taps it.
	$scope.tapNode = function(index) {
		if ($scope.nodes[index].stability <= $scope.maxStability) {
			$scope.nodes[index].stability++
		}
	}

});

//Set options for the sliders.
var setSliderOptions = function(scope,gridroot) {
	scope.gridsizeOptions = {
		from:0,
		to:100,
		step:1,
		skin:"round"
	}

	scope.initialBitOptions = {
		from:0,
		to:5,
		step:1,
		skin:"round"
	}

	scope.percentageOptions = {
		from:0,
		to:100,
		step:1,
		dimension:"%",
		skin:"round"
	}

	scope.rangeOptions = {
		from:0,
		to:gridroot,
		step:1,
		skin:"round"
	}

	scope.bitsPerNodeOptions = {
		from:0,
		to:3,
		step:1,
		skin:"round"
	}
}

relvisApp.controller('stabilityGraphController', function ($scope, $interval) {
	var vals;
	$scope.point_radius=2;
	$interval(function() {
		vals=[];
		for (var i = $scope.nodes.length - 1; i >= 0; i--) {
			vals.push(
				$scope.nodes[i].stability
			);
		};
		vals.sort();
		$scope.points=[];
		console.log(vals);
		for (var i = 0; i < vals.length; i++) {
			$scope.points.push({
				y:100-vals[i]*100/20,
				x:i*3
			})
		};
		$scope.graph={
			width:$scope.points.length*3,
			height:100
		}
	},500);
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