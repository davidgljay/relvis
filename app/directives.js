angular.module('relvis.directives', []) 
	.directive('d3bars', ['$document',
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
						barPadding = parseInt(attrs.barPadding) || 5;

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

							console.log(gravlinks)


							// setup variables 
							var width = d3.select(element[0]).node().offsetWidth - margin, 
							// calculate the height 
							height = width, 
							// Use the category20() scale function for multicolor support 
							color = d3.scale.category20(),

							force = d3.layout.force() 
								.charge(-80)
								.links(gravlinks)
								.linkDistance(100)
								.linkStrength(1)
								.size([width, height])
								.nodes(nodes)
								.start();

							// gravforce = d3.layout.force()
							// 	.charge(-200)
							// 	.size([width,height])
							// 	.nodes(scope.$parent.nodes)
							// 	.start();


							svg.attr('height', height);
							svg.attr('width', width);

							var node = svg.selectAll(".node") 
								.data(nodes) 
								.enter()
									.append("circle") 
									.attr("class", "node") 
									.attr("r", 5) 
									.style("fill", function(d) { 
										return color(d.group); 
									}) 
									.call(force.drag);

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
									}); 
									force.linkDistance(function(d) {
										return 100-d.target.stability*4;
									})
									// .linkStrength(1)
									.start();
								});

							//create the rectangles for the bar chart 
							// svg.selectAll('rect') 
							// 	.data(data).enter() 
							// 		.append('rect') 
							// 		.attr('height', barHeight) 
							// 		.attr('width', 140) 
							// 		.attr('x', Math.round(margin/2)) 
							// 		.attr('y', function(d,i) { 
							// 			return i * (barHeight + barPadding); 
							// 		}) 
							// 		.attr('fill', function(d) { 
							// 			return color(d.score); 
							// 		}) 
							// 		.transition() 
							// 			.duration(1000) 
							// 			.attr('width', function(d) { 
							// 				return xScale(d.score); 
							// 			});
						};
				} 
			}
		}
	]);