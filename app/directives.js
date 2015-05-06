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
					bitArray = [],
					nodes=[],
					bit;

					// for (var i = 100 - 1; i >= 0; i--) {
					// 	bitArray.push({
					// 		target:0,
					// 		sender:0,
					// 		completion:0

					// 	});
					// 	};

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

					// scope.$watch('$parent.bits',
					// 	function(newVals, oldVals) {
					// 	//This function is only called once, rather than every time the bit array is updated. 
					// 	//The ugly way to do this is to have an event broadcast from the controller, then broadcast back when completion=100. That may be what I have to do though.
					// 		for (var i = newVals.length - 1; i >= 0; i--) {
					// 			if (i<bitArray.length) {
					// 				bitArray[i] = newVals[i]
					// 			}
					// 		};
					// 	});


					var xpos = function(i) {
						return nodes[i].x;
					};
					var ypos = function(i) {
						return nodes[i].y;
					};

					scope.$on('newBit', function(event, bitData) {
							bitArray.push(bitData);
							svg.selectAll(".bit").remove();
							bit = svg.selectAll(".bit")
								.data(bitArray)
								.enter()
									.append("circle")
									.attr("r",2)
									.attr("class","bit blue")
									.attr("cx", function(d) {
											return xpos(d.sender)
										})
									.attr("cy", function(d) {
											return ypos(d.sender)
										});
					})

					scope.render = function() { 

						// remove all previous items before render 
						svg.selectAll('*').remove();

						nodes = scope.$parent.nodes.slice();
						if (!nodes) 
							return;

						nodes.push({
							"gravnode":true,
							stability:20
						})

						var gravlinks = [];
						var targetLinks = [];

						for (var i = nodes.length - 1; i >= 0; i--) {
							if (!nodes[i].gravnode) {
								gravlinks.push({
									source:nodes.length-1,
									target:i
								});
								targetLinks.push({
									source:i,
									target:nodes[nodes[i].targets[0]]
								})

							}
						};


						// setup variables 
						var width = d3.select(element[0]).node().offsetWidth - margin, 
						// calculate the height 
						height = width, 
						// Use the category20() scale function for multicolor support 
						color = d3.scale.category20(),
						//TODO: add node links and gravity links to the same linkset, apply different classes and strengths to them programatically
						force = d3.layout.force() 
							.charge(-200)
							.links(gravlinks)
							.linkDistance(200)
							.linkStrength(.4)
							.size([width, height])
							.nodes(nodes)
							.start();

						linkforce = d3.layout.force()
							.links(targetLinks)
							.linkDistance(80)
							.linkStrength(0)
							.size([width,height])
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

						var link = svg. selectAll(".link")
							.data(targetLinks)
							.enter()
								.append("line")
								.attr("x1",function(d) {
									return d.source.x
								})
								.attr("x2", function(d) {
									return d.target.x
								})
								.attr("y1", function(d) {
									return d.source.y
								})
								.attr("y2", function(d) {
									return d.target.y
								});

						bit = svg.selectAll(".bit")
								.data(bitArray)
								.enter()
									.append("circle")
									.attr("r",2)
									.attr("class","bit blue")
									.attr("cx", function(d) {
											return xpos(d.sender)
										})
									.attr("cy", function(d) {
											return ypos(d.sender)
										});

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
										return d.x;
								})
								.attr("cy", function(d) {
										d.completion++;
										return d.completion/100*(ypos(d.target)-ypos(d.sender)) + ypos(d.sender)
								})
								for (var i = bitArray.length - 1; i >= 0; i--) {
									if (bitArray[i].completion>=100) {
										scope.$emit('bitComplete', bitArray[i]);
										bitArray.remove(i);
									}
								};
								for (var i = targetLinks.length - 1; i >= 0; i--) {
									targetLinks[i].target = nodes[nodes[i].targets[0]];
								};
								link.attr("x1",function(d) {
									return d.source.x
								})
								.attr("x2", function(d) {
									return d.target.x
								})
								.attr("y1", function(d) {
									return d.source.y
								})
								.attr("y2", function(d) {
									return d.target.y
								})
								.attr("class", function(d) {
									if (d.source.stability>10) {
										return "blue_line";
									} else {
										return "";
									}
								});
								linkforce.linkStrength(function(d) {
									if (d.source.stability>10) {
										return .01;
									} else {
										return 0;
									}
								})
						});

					}
				} 
			}
		}
	]);