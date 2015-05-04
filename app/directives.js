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
								scope.render(scope.data); 
						});

						scope.$watch('$parent.data', 
							function(newVals, oldVals) { 
								return scope.render(newVals); 
							}, true);

						scope.render = function(data) { 

							// remove all previous items before render 
							svg.selectAll('*').remove();

							// If we don't pass any data, return out of the element 
							if (!data) 
								return;

							// setup variables 
							var width = d3.select(element[0]).node().offsetWidth - margin, 
							// calculate the height 
							height = width, 
							// Use the category20() scale function for multicolor support 
							color = d3.scale.category20(), 

							// set the height based on the calculations above 
							force = d3.layout.force() 
								.charge(-120) 
								.linkDistance(30) 
								.size([width, height])
								.nodes(scope.$parent.nodes)
								.links(scope.$parent.lines)
								.start();

							svg.attr('height', height);
							svg.attr('width', width);

							var link = svg.selectAll(".link") 
								.data(scope.$parent.lines) 
								.enter()
								.append("line") 
								.attr("class", "link") 
								.style("stroke-width", function(d) { 
									return Math.sqrt(d.value); 
								});

							var node = svg.selectAll(".node") 
								.data(scope.$parent.nodes) 
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
									link.attr("x1", function(d) { 
										return d.source.x; 
									}) 
									.attr("y1", function(d) { 
										return d.source.y; 
									}) 
									.attr("x2", function(d) { 
										return d.target.x; 
									}) 
									.attr("y2", function(d) { 
										return d.target.y; 
									}); 

									node.attr("cx", function(d) { 
										return d.x; 
									}) 
									.attr("cy", function(d) { 
										return d.y; 
									}); 
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