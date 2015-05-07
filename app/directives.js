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
					bit,
					linkSettings = {
						linkStrength: {
							gravlink: .4,
							rellink: 0
						},
						linkDistance: {
							gravlink: 200,
							rellink : 80
						}
					};



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

						var linkArray = [];

						for (var i = nodes.length - 1; i >= 0; i--) {
							if (!nodes[i].gravnode) {
								linkArray.push({
									source:nodes.length-1,
									target:i,
									type:"gravlink"
								});
								linkArray.push({
									source:i,
									target:nodes[nodes[i].targets[0]],
									type:"rellink"
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
							.links(linkArray)
							.linkDistance(function(d) {
								return linkSettings.linkDistance[d.type];
							})
							.linkStrength(function(d) {
								return linkSettings.linkStrength[d.type];
							})
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

						var link = svg. selectAll(".link")
							.data(linkArray)
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
									if (d.type=="gravlink") {
										return 200-d.target.stability*8;
									} else {
										return linkSettings.linkDistance[d.type];
									}
								})
								.linkStrength(function(d) {
									if (d.type=="rellink" && d.sender != null && d.sender.stability>10) {
										return .1/(16-d.sender.stability);
									} else {
										return linkSettings.linkStrength[d.type];
									}
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

								for (var i = linkArray.length - 1; i >= 0; i--) {
									if (linkArray.type=="rellink") {
										linkArray[i].target = nodes[nodes[i].targets[0]];
									}
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
									if (d.source.stability>10 && d.type=="rellink") {
										return "blue_line";
									} else {
										return "";
									}
								})
								.attr("opacity", function(d) {
									if (d.source.stability>10 && d.type=="rellink") {
										return (d.source.stability-10)/5;
									} else {
										return 0;
									}
								});;
						});

					}
				} 
			}
		}
	]);