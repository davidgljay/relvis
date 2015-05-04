angular.module('relvis.directives', []) 
	.directive('relvis', ['$document',
		function() { 
			return { 
				restrict: 'EA', 
				scope: { 
					data: '=' 
					// bi-directional data-binding 
				},
				link: function(scope, element, attrs) { 
					var svg = d3.select(element[0])
						.append("svg")
						.style('width', '100%');

					var margin = parseInt(attrs.margin) || 20, 
					barHeight = parseInt(attrs.barHeight) || 20, 
					barPadding = parseInt(attrs.barPadding) || 5,
					bit;

					window.onresize = function() { 
						scope.$apply(); 
					};

					// hard-code data 
					// scope.data = [ 
					// 	{name: "Greg", score: 98}, 
					// 	{name: "Ari", score: 96}, 
					// 	{name: 'Q', score: 75}, 
					// 	{name: "Loser", score: 48} 
					// ];

					// Watch for resize event 
					scope.$watch(
						function() { 
							return angular.element(window)[0].innerWidth; 
						}, 
						function() { 
							scope.render(); 
					});

					scope.$watch('$parent.data', 
						function(newVals, oldVals) { 
							return scope.render(); 
						}, true);

					scope.$watch('$parent.bits',
						function(newVals, oldVals) {
							//TODO: Possibly handle bit transmittion internally, that will let us run an .enter() and exit command rather than refreshing the array.
						bit = svg.selectAll("bit")
							.data(scope.$parent.bits)
							.enter()
								.append("circle")
								.attr("r",2)
								.attr("class","bit blue");
						},true)

					scope.render = function() { 

						// remove all previous items before render 
						svg.selectAll('*').remove();

						var nodes = scope.$parent.nodes.slice();
						if (!nodes) 
							return;

						nodes.push({
							"gravnode":true,
							stability:20
						})

						var gravlinks = [];

						for (var i = nodes.length - 1; i >= 0; i--) {
							if (!nodes[i].gravnode)
							gravlinks.push({
								source:nodes.length-1,
								target:i
							});
						};


						// setup variables 
						var width = d3.select(element[0]).node().offsetWidth - margin, 
						// calculate the height 
						height = width, 
						// Use the category20() scale function for multicolor support 
						color = d3.scale.category20(),

						force = d3.layout.force() 
							.charge(-200)
							.links(gravlinks)
							.linkDistance(200)
							.linkStrength(1)
							.size([width, height])
							.nodes(nodes)
							.start();

						svg.attr('height', height);
						svg.attr('width', width);

						var node = svg.selectAll(".node") 
							.data(nodes) 
							.enter()
								.append("circle") 
								.attr("class", function(d) {
									if (d.gravnode) {
										return "gravnode";
									} else {
										return "node blue";
									}

								}) 
								.attr("r", 5)  
								.call(force.drag);

						var bit = svg.selectAll(".bit")
							.data(scope.$parent.bits)
							.enter()
								.append("circle")
								.attr("r",2)
								.attr("class","bit blue");

						force.on("tick", 
							function() { 
								node.attr("cx", function(d) { 
									if (d.gravnode) {
										return width/2;
									} else {
										return d.x; 											
									}
								}) 
								.attr("cy", function(d) {
									if (d.gravnode) {
										return height/2;
									} else {
										return d.y; 
									}
								})
								.attr("r", function(d) {
									return d.stability/2 + 1
								}); 
								force.linkDistance(function(d) {
									return 200-d.target.stability*8;
								})
								.start();
								bit.attr("cx", function(d) {
										return d.completion/100*(xpos(d.target)-xpos(d.sender)) + xpos(d.sender)
								})
								.attr("cy", function(d) {
										return d.completion/100*(ypos(d.target)-ypos(d.sender)) + ypos(d.sender)
								})
								//TODO: add bit motion;
							});

						var xpos = function(i) {
							return nodes[i].x;
						};
						var ypos = function(i) {
							return nodes[i].y;
						};
							// $interval(function() {
							// 		for (var i = bits.length - 1; i >= 0; i--) {
							// 			if (bits[i].completion<100) {
							// 				bits[i].completion++
							// 				bits[i].x = bits[i].completion/100*(xpos(bits[i].target)-xpos(bits[i].sender)) + xpos(bits[i].sender)
							// 				bits[i].y = bits[i].completion/100*(ypos(bits[i].target)-ypos(bits[i].sender)) + ypos(bits[i].sender)			
							// 			} else {
							// 				bits.remove(i)
							// 			}
							// 			};
							// 		},1)
							// };
					}
				} 
			}
		}
	]);