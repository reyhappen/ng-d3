(function(angular) {
	"use strict";

	angular.module("something")
	//时钟
	.directive("time", ["$timeout", "$filter",
		function($timeout, $filter) {
			return function(scope, element, attrs) {
				var format = attrs.format || 'yyyy-MM-dd HH:mm:ss';
				var tt;
				var updateTime = function() {
					tt = $timeout(function() {
						element.text($filter('date')(new Date(), format));
						updateTime();
					}, 1000);
				};

				element.bind('$destroy', function() {
					$timeout.cancel(tt);
				});

				updateTime();
			};
		}
	])
	//loading图标
	.directive('loading', function() {
		return {
			scope: {
				state: '='
			},
			compile: function(tElement, tAttrs, transclude) {
				tElement.css({
					'position': 'relative'
				}).append('<div class="loadingMask"><img src="images/loading.gif"></div>');
				return function link(scope, iElement, iAttrs, controller) {
					scope.$watch('state', function(newVal, oldVal) {
						if (newVal) {
							iElement.find('.loadingMask').fadeIn();
						} else {
							iElement.find('.loadingMask').fadeOut();
						}
					});
				};
			}

		};
	})
	//后台左侧菜单
	.directive('menuswitch', function() {
		return {
			restrict: 'EA',
			scope: {
				menu: '=menu'
			},
			template: '<a href="" ng-click="toggle()">{{menu.name}}</a>' +
				'{{show}}' +
				'<ul ng-if="menu.childrens" ng-style="ulanimate">' +
				'<li ng-repeat="sub in menu.childrens">' +
				'<a href="">{{sub.name}}</a>' +
				'</li>' +
				'</ul>',
			link: function(scope, element, attrs) {
				scope.menu.show = true;
				var eHeight = scope.menu.childrens ? scope.menu.childrens.length * 25 : 0;

				//默认
				scope.ulanimate = {
					'top': 0,
					'height': eHeight + "px",
					'opacity': 1,
					'display': 'block !important'
				};

				scope.toggle = function toggle() {
					var t, h, o;
					if (scope.menu.show) {
						t = "-" + eHeight + "px";
						h = 0;
						o = 0;
					} else {
						t = "0";
						h = eHeight + "px";
						o = 1;
					}
					//css3动画
					scope.ulanimate = {
						'top': t,
						'height': h,
						'opacity': o,
						'display': 'block !important'
					};
					scope.menu.show = !scope.menu.show;
				}
			}
		}
	})
	//highcharts
	.directive('chart', function() {
		return {
			restrict: 'EA',
			template: '<div></div>',
			scope: {
				chartData: "=value"
			},
			transclude: true,
			replace: true,
			link: function($scope, $element, $attrs) {
				//Update when charts data changes
				$scope.$watch('chartData', function(value) {
					if (!value)
						return;

					// use default values if nothing is specified in the given settings
					$scope.chartData.chart = $scope.chartData.chart || {};
					$scope.chartData.chart.renderTo = $scope.chartData.chart.renderTo || $element[0];
					if ($attrs.type)
						$scope.chartData.chart.type = $scope.chartData.chart.type || $attrs.type;
					if ($attrs.height)
						$scope.chartData.chart.height = $scope.chartData.chart.height || $attrs.height;
					if ($attrs.width)
						$scope.chartData.chart.width = $scope.chartData.chart.width || $attrs.width;

					if ($attrs.type == "map") {
						$($element).highcharts('Map', $scope.chartData);
					} else {
						$($element).highcharts($scope.chartData);
					};
				});
			}
		};
	})
	//数据表
	.directive("datatable", ['$timeout',
		function($timeout) {
			return {
				restrict: "EA",
				scope: {
					data: '=data',
					fixHead: '@',
					scrollElem: '@'
				},
				template: '<table class="table table-hover table-bordered">' + '<thead>' + '<tr>' + '<th ng-repeat="header in data.headers" column-index="{{$index}}" ng-class="{sorting:header.sort,sorting_both:(!header.sortState || header.sortState == -1),sorting_desc:(header.sortState==2),sorting_asc:(header.sortState==1)}" ng-click="sort($index)">{{header.name}}</th>' + '</tr>' + '</thead>' + '<tbody>' + '<tr ng-repeat="data in data.datas">' + '<td ng-repeat="row in data">{{row}}</td>' + '</tr>' + '</tbody>' + '<tfoot>' + '<tr>' + '<td colspan="{{data.headers.length}}">共{{data.datas.length}}记录</t>' + '</tr>' + '</tfoot>' + '</table>',
				link: function(scope, element, attrs) {
					var data = scope.data;

					scope.sort = function(index) {
						if (data.headers[index].sort) {
							data.headers[index].sortState = data.headers[index].sortState || -1;
							switch (data.headers[index].sortState) {
								case 1: //asc
									data.datas = data.datas.sort(function(a, b) {
										return b[index] - a[index];
									});
									dealSortState(index, 2);
									break;
								case 2: //desc
								case -1: //both
									data.datas = data.datas.sort(function(a, b) {
										return a[index] - b[index];
									});
									dealSortState(index, 1);
									break;
							}
						}
					}

					function dealSortState(index, state) {
						for (var i = 0; i < scope.data.headers.length; i++) {
							scope.data.headers[i].sortState = -1;
						}

						scope.data.headers[index].sortState = state;
					}
					if (scope.fixHead) {
						var timer;
						var scrollElem = scope.scrollElem || "body";
						$(scrollElem).on('scroll', function() {
							if (timer) $timeout.cancel(timer);
							var tableTop = $(element).offset().top;
							timer = $timeout(function() {
								var sTop = $(".pl-content-right").scrollTop();
								var cloneThead = $("#cloneThead");

								if (tableTop < 0) {

									if (!cloneThead.length) {
										var cloneElem = $(element).find("thead").clone();

										$.each($(element).find('th'), function(k, v) {
											var w = $(this).outerWidth();
											cloneElem.find('th:eq(' + k + ')').css({
												width: w
											});
										});

										$("body").append("<div id='cloneThead' class='datatable'><table class='table table-bordered'></table></div>");
										$("#cloneThead table").append(cloneElem).css({
											width: $(element).width(),
											position: 'absolute',
											left: $(element).offset().left,
											top: 0
										});
									} else {
										cloneThead.show();
									}
								} else {
									if (cloneThead.length) {
										cloneThead.hide();
									}
								}

							}, 100);
						});
					}
				}
			}
		}
	])
	//挂件
	.directive("widget", function() {
		return {
			restrict: 'EA',
			scope: {
				tilte: '@'
			},
			replace: true,
			transclude: true,
			template: '<div class="widget">' + '<div class="widget-head">' + '<span class="ico pull-left glyphicon glyphicon-signal"></span>' + '<h4 class="title pull-left">{{tilte}}</h4>' + '<span class="pull-right"><a class="widget-close"><span class="glyphicon glyphicon-remove"></span></a></span>' + '</div>' + '<div class="widget-wrap" ng-transclude>' + '</div>' + '</div>'
		}
	})
	//五力模型
	.directive("fiveForce", ['$window',
		function($window) {
			return {
				restrict: 'EA',
				scope: {
					data: '=',
					xaxisName: '=',
					xaxisPos: '=',
					yaxisName: '=',
					yaxisPos: '=',
					d3Format: '=',
					width: '=',
					height: '='
				},
				link: function(scope, elem, attrs) {
					var d3 = $window.d3,
						margin = {
							top: 20,
							right: 20,
							bottom: 30,
							left: 60
						},
						width = scope.width || 500,
						height = scope.height || 270;

					width = width - margin.left - margin.right,
					height = height - margin.top - margin.bottom;

					var formatPercent = d3.format(scope.d3Format);
					var x = d3.scale.ordinal()
						.rangeRoundBands([0, width], .1);

					var y = d3.scale.linear()
						.range([height, 0]);

					var xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom");

					var yAxis = d3.svg.axis()
						.scale(y)
						.orient("left")
						.tickFormat(formatPercent);

					var svg = d3.select("#" + elem[0].id).append("svg") // selecting the DOM element by d3.js 
						// - getting from Angular context   
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


					var data = scope.data;
					x.domain(data.map(function(d) {
						return d.letter;
					}));
					y.domain([0, d3.max(data, function(d) {
						return d.frequency;
					})]);

					svg.append("g")
						.attr("class", "xaxis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis)
						.append("text")
						.attr("x", scope.xaxisPos)
						.attr("dx", ".71em")
						.style("text-anchor", "end")
						.text(scope.xaxisName);
					// x axis legend setting from angular variables
					svg.append("g")
						.attr("class", "yaxis")
						.call(yAxis)
						.append("text")
						.attr("transform", "rotate(-90)")
					// .attr("y", scope.yaxisPos)
					.attr("dy", ".71em")
						.style("text-anchor", "end")
						.text(scope.yaxisName);
					// y axis legend setting from angular variables
					svg.selectAll(".bar")
						.data(data)
						.enter().append("rect")
						.attr("class", "bar")
						.attr("x", function(d) {
							return x(d.letter);
						})
						.attr("width", x.rangeBand())
						.attr("y", function(d) {
							return y(d.frequency);
						})
						.attr("height", function(d) {
							return height - y(d.frequency);
						});
				}
			}
		}
	])
		.directive("d3Line", ['$timeout',
			function($timeout) {
				return {
					link: function(scope, element, attrs) {
						var dataSet = [{
							'name': 'java',
							value: 345
						}, {
							'name': 'php',
							value: 645
						}, {
							'name': 'c++',
							value: 745
						}, {
							'name': 'python',
							value: 245
						}];

						var data = {
							title:{
								text:"开发语言调查结果"
							},
							series:{
								data:[324,545,667,964,24]
							},
							xAxis:{
								categories:['java','php','c++','python','javascript']
							}

						};

						var defaultOpt = {
							chart: {
								margin: [60, 10, 40, 60],
								backgroundColor: '#FFFFFF',
								className: null,
								width: null,
								height: null,
								type: null
							},
							title: {
								text: null,
								align: 'center',
								verticalAlign: null,
								style: {
									"color": "#333333",
									"font-size": "16px"
								},
								x: 0,
								y: null
							},
							color: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
							legend: {

							},
							loading: {},
							series: {
								data: [],

							},
							xAxis:{
								type:null,
								title:{
									text:null,
									enabled:true,
									style:{ "color": "#707070", "font-weight": "bold" }
								},
								categories:[],
								min:null,
								max:null,
								tickLength:10,
								tickWidth:1,
								tickColor:null
							},
							yAxis:{
								type:null,
								title:{
									text:null,
									enabled:true,
									style:{ "color": "#707070", "font-weight": "bold" }
								},
								categories:[],
								min:null,
								max:null,
								tickLength:10,
								tickWidth:1,
								tickColor:null
							},
							tooltip:{
								style:null,
								shadow:true,
								backgroundColor: 'rgba(255, 255, 255, 0.85)',
								borderColor: null,
								borderRadius: 3,
								borderWidth:1,
								enabled:true
							}
						};

						var option = jQuery.extend({},defaultOpt,data);

						var w = element[0].clientWidth,
							h = element[0].clientHeight,
							margin = {
								left: 60,
								top: 10,
								bottom: 40,
								right: 60
							};

						var xW = w - margin.left - margin.right;
						var yH = h - margin.top - margin.bottom;

						//定义比例尺
						var xScale = d3.scale.ordinal()
							.rangeRoundBands([0, xW], 1)
							.domain(dataSet.map(function(d) {
								return d.name;
							}));
						var yScale = d3.scale.linear()
							.range([yH, 10])
							.domain([0, d3.max(dataSet, function(d) {
								return d.value;
							})]);



						var xAxis = d3.svg.axis().scale(xScale).ticks(5).orient("bottom");
						var yAxis = d3.svg.axis().scale(yScale).ticks(10).orient("left");

						var svg = d3.select(element[0])
							.append("svg")
							.attr("width", w)
							.attr("height", h)
							.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
							.attr("width", xW)
							.attr("height", yH);

						//x axis
						svg.append("g")
							.call(xAxis)
							.attr("transform", "translate(0," + yH + ")")
							.style({
								'stroke': 'black',
								'stroke-width': 1,
								'fill': 'none',
								'shape-rendering': 'crispEdges'
							})
							.selectAll('text')
							.style({
								'text-anchor': 'end',
								'font-size': '14px',
								'font-weight': 500,
								'fill': 'rgb(0, 0, 0)',
								'stroke-width': '0px'
							})
							.attr("transform", "rotate(-20)")
							.attr("dx", ".8px");

						//y axis
						svg.append("g")
							.call(yAxis)
							.attr("class", "yaxis")
							.style({
								'stroke': 'black',
								'stroke-width': 1,
								'fill': 'none',
								'shape-rendering': 'crispEdges'
							})
							.selectAll('text')
							.style({
								'text-anchor': 'end',
								'font-size': '12px',
								'font-weight': 500,
								'fill': 'rgb(0, 0, 0)',
								'stroke-width': '0px'
							});

						svg.select(".yaxis")
							.append("text")
							.text("支持数 (人)")
							.style({
								'font-size': '12px',
								'font-weight': 500,
								'fill': 'rgb(90, 90, 90)',
								'stroke-width': '0px'
							})
							.attr("y", -40)
							.attr("x", "-" + yH / 2)
							.attr("transform", "rotate(-90)");

						//data
						svg.append("g")
							.attr("class", 'bar')
							.selectAll("rect")
							.data(dataSet)
							.enter()
							.append("rect")
							.style({
								'fill': '#8D5BB4',
							})
							.attr("index", function(d, v) {
								return v;
							})
							.attr("x", function(d) {
								return xScale(d.name) - 10;
							})
							.attr("y", yH)
							.attr("width", 20)
							.attr("height", 0)
							.transition()
							.duration(1500)
							.attr("height", function(d) {
								return yH - yScale(d.value);
							})
							.attr("y", function(d) {
								return yScale(d.value);
							});

						//data
						svg.select(".bar")
							.selectAll("text")
							.data(dataSet)
							.enter()
							.append("text")
							.text(function(d) {
								return d.value;
							})
							.style({
								'fill': '#fff',
								'font-size': '12px'
							})
							.attr("x", function(d) {
								return xScale(d.name) - 10;
							})
							.attr("y", function(d) {
								return yScale(d.value) - 2;
							})
							.transition()
							.duration(2500)
							.style({
								'fill': '#000'
							});

						svg.select(".bar")
							.selectAll("rect")
							.on("mousemove", function() {
								var rect = d3.select(this).style({
									'fill': '#62427b'
								});
								var rectWH = {
									w: 100,
									h: 60
								};
								var mousePos = d3.mouse(this);
								var tooltipPos = {
									left: mousePos[0],
									top: mousePos[1]
								};

								if (tooltipPos.left - rectWH.w > 0) {
									tooltipPos.left = tooltipPos.left - rectWH.w - 5;
								} else {
									tooltipPos.left = tooltipPos.left + 5;
								}

								if (tooltipPos.top - rectWH.h > 0) {
									tooltipPos.top = tooltipPos.top - rectWH.h - 5;
								} else {
									tooltipPos.top = tooltipPos.top + 5;
								}


								var info = rect[0][0].__data__;
								var tooltip = d3.select(".tooltip");
								if (!tooltip[0][0]) {
									var tooltip = svg.append('g')
										.attr('class', 'tooltip')
										.style({
											'stroke': '#f00',
											'stroke-width': 0,
											'fill': '#000',
											'opacity': '0.8',
											'visibility': 'visible'
										})
										.attr("transform", "translate(" + tooltipPos.left + "," + tooltipPos.top + ")");

									tooltip.append('rect')
										.attr("width", rectWH.w)
										.attr("height", rectWH.h)
										.style({
											'fill': '#62427b'
										});
									tooltip.append('text')
										.text(info.name + ":" + info.value)
										.style({
											'font-size': '12px',
											'font-weight': 500,
											'fill': 'rgb(0, 0, 0)',
											'stroke-width': '0px'
										});
								} else {
									tooltip.style({
										'visibility': 'visible'
									})
										.attr("transform", "translate(" + tooltipPos.left + "," + tooltipPos.top + ")");
								}
							})
							.on('mouseout', function() {
								d3.select(this).style({
									'fill': '#8D5BB4'
								});
								d3.select(".tooltip")
									.style({
										'visibility': 'hidden'
									});
							});
					}
				};
			}
		])
.directive("d3Chart", ['$timeout',
			function($timeout) {
				return {
					link: function(scope, element, attrs) {

						var data = {
							title:{
								text:"开发语言调查结果"
							},
							series:{
								datas:[324,545,667,964,24]
							},
							xAxis:{
								categories:['java','php','c++','python','javascript'],
								tickWidth:20,
							},
							yAxis:{
								title:{
									text:"支持数 (人)"
								},
								min:0,
								max:100
							}
						};

						//默认配置
						var defaultOpt = {
							chart: {
								margin: [20, 20, 30, 60], //top right bottom left
								backgroundColor: '#FFFFFF',
								className: null,
								width: null,
								height: null,
								type: null
							},
							title: {
								text: null,
								align: 'center',
								verticalAlign: null,
								style: {
									"color": "#333333",
									"font-size": "16px"
								},
								x: 0,
								y: null
							},
							color: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
							legend: {

							},
							loading: {},
							series: {
								data: [],

							},
							xAxis:{
								type:null,
								title:{
									text:null,
									enabled:true,
									style:{ "color": "#707070", "font-weight": "bold" }
								},
								categories:[],
								min:null,
								max:null,
								tickLength:10,
								tickWidth:1,
								tickColor:null,
								orient:"bottom"
							},
							yAxis:{
								type:null,
								title:{
									text:null,
									enabled:true,
									style:{ "color": "#707070", "font-weight": "bold" }
								},
								categories:[],
								min:null,
								max:null,
								tickLength:10,
								tickWidth:1,
								tickColor:null,
								orient:"left"
							},
							tooltip:{
								style:null,
								shadow:true,
								backgroundColor: 'rgba(255, 255, 255, 0.85)',
								borderColor: null,
								borderRadius: 3,
								borderWidth:1,
								enabled:true
							}
						};

						var option = jQuery.extend(true,{},defaultOpt,data);

						option.chart.width = option.chart.width || element[0].clientWidth;
						option.chart.height = option.chart.height || element[0].clientHeight;

						var xAxisW = option.chart.width - option.chart.margin[3] - option.chart.margin[1];
						var yAxisH = option.chart.height - option.chart.margin[0] - option.chart.margin[2];

						//顶层SVG
						var svg = d3.select(element[0])
							.append("svg")
							.attr("width", option.chart.width)
							.attr("height", option.chart.height)
							.append("g")
							.attr("transform", "translate(" + option.chart.margin[3] + "," + option.chart.margin[0] + ")")
							.attr("width", xAxisW)
							.attr("height", yAxisH);


						//定义X轴比例尺
						var xScale = d3.scale.ordinal()
							.rangeRoundBands([0, xAxisW], 1)
							.domain(option.xAxis.categories.map(function(d) {
								return d;
							}));

						//定义X轴
						var xAxis = d3.svg.axis().scale(xScale).ticks(option.xAxis.tickLength).orient(option.xAxis.orient);

						//定义Y轴比例尺
						var yScale = d3.scale.linear()
							.range([yAxisH, option.yAxis.min?option.yAxis.min:0])
							.domain([0, d3.max(option.series.datas, function(d) {
								return d;
							})]);

						//定义Y轴
						var yAxis = d3.svg.axis().scale(yScale).ticks(option.yAxis.tickLength).orient(option.yAxis.orient);

						//X轴
						svg.append("g")
							.call(xAxis)
							.attr("class", "xaxis")
							.attr("transform", "translate(0," + yAxisH + ")")
							.style({
								'stroke': 'black',
								'stroke-width': 1,
								'fill': 'none',
								'shape-rendering': 'crispEdges'
							})
							.selectAll('text')
							.style({
								'text-anchor': 'end',
								'font-size': '14px',
								'font-weight': 500,
								'fill': 'rgb(0, 0, 0)',
								'stroke-width': '0px'
							})
							.attr("transform", "rotate(-20)")
							.attr("dx", ".8px");

						//Y 轴
						svg.append("g")
							.call(yAxis)
							.attr("class", "yaxis")
							.style({
								'stroke': 'black',
								'stroke-width': 1,
								'fill': 'none',
								'shape-rendering': 'crispEdges'
							})
							.selectAll('text')
							.style({
								'text-anchor': 'end',
								'font-size': '12px',
								'font-weight': 500,
								'fill': 'rgb(0, 0, 0)',
								'stroke-width': '0px'
							});

						//Y轴 标题
						svg.select(".yaxis")
							.append("text")
							.text(option.yAxis.title.text)
							.style({
								'font-size': '12px',
								'font-weight': 500,
								'fill': 'rgb(90, 90, 90)',
								'stroke-width': '0px'
							})
							.attr("y", -40)
							.attr("x", "-" + yAxisH / 2)
							.attr("transform", "rotate(-90)");

						//绑定数据
						svg.append("g")
							.attr("class", 'bar')
							.selectAll("rect")
							.data(option.series.datas)
							.enter()
							.append("rect")
							.style({
								'fill': '#8D5BB4',
							})
							.attr("index", function(d, v) {
								return v;
							})
							.attr("x", function(d,v) {
								return xScale(option.xAxis.categories[v]) - 10;
							})
							.attr("y", yAxisH)
							.attr("width", option.xAxis.tickWidth)
							.attr("height", 0)
							.transition()
							.duration(1500)
							.attr("height", function(d) {
								return yAxisH - yScale(d);
							})
							.attr("y", function(d) {
								return yScale(d);
							});

						//绑定数据
						svg.select(".bar")
							.selectAll("text")
							.data(option.series.datas)
							.enter()
							.append("text")
							.text(function(d) {
								return d;
							})
							.style({
								'fill': '#fff',
								'font-size': '12px'
							})
							.attr("x", function(d,v) {
								return xScale(option.xAxis.categories[v]) - 10;
							})
							.attr("y", function(d) {
								return yScale(d) - 2;
							})
							.transition()
							.duration(2500)
							.style({
								'fill': '#000'
							});

						//绑定图列说明
						svg.select(".bar")
							.selectAll("rect")
							.on("mousemove", function() {
								var rect = d3.select(this).style({
									'fill': '#62427b'
								});
								var rectWH = {
									w: 100,
									h: 60
								};
								var mousePos = d3.mouse(this);
								var tooltipPos = {
									left: mousePos[0],
									top: mousePos[1]
								};

								if (tooltipPos.left - rectWH.w > 0) {
									tooltipPos.left = tooltipPos.left - rectWH.w - 5;
								} else {
									tooltipPos.left = tooltipPos.left + 5;
								}

								if (tooltipPos.top - rectWH.h > 0) {
									tooltipPos.top = tooltipPos.top - rectWH.h - 5;
								} else {
									tooltipPos.top = tooltipPos.top + 5;
								}

								var info = {value:rect[0][0].__data__,name:option.xAxis.categories[rect.attr('index')]};
								var tooltip = d3.select(".tooltip");
								if (!tooltip[0][0]) {
									var tooltip = svg.append('g')
										.attr('class', 'tooltip')
										.style({
											'stroke': '#f00',
											'stroke-width': 0,
											'fill': '#000',
											'opacity': '0.8',
											'visibility': 'visible'
										})
										.attr("transform", "translate(" + tooltipPos.left + "," + tooltipPos.top + ")");

									tooltip.append('rect')
										.attr("width", rectWH.w)
										.attr("height", rectWH.h)
										.style({
											'fill': '#62427b'
										});
									tooltip.append('text')
										.text(info.name + ":" + info.value)
										.style({
											'font-size': '12px',
											'font-weight': 500,
											'fill': 'rgb(0, 0, 0)',
											'stroke-width': '0px'
										});
								} else {
									tooltip.style({
										'visibility': 'visible'
									})
										.attr("transform", "translate(" + tooltipPos.left + "," + tooltipPos.top + ")");
								}
							})
							.on('mouseout', function() {
								d3.select(this).style({
									'fill': '#8D5BB4'
								});
								d3.select(".tooltip")
									.style({
										'visibility': 'hidden'
									});
							});
					}
				};
			}
		]);

})(angular);