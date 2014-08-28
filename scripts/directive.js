(function(angular) {
	"use strict";

	angular.module("ngd3")
	.directive("d3Chart", ['$timeout',
		function($timeout) {
			return {
				restrict: 'EA',
				scope: {
					data: '='
				},
				link: function(scope, element, attrs) {

					var data = scope.data;

					//默认配置
					var defaultOpt = {
						chart: {
							margin: [30, 20, 50, 60], //top right bottom left
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
						xAxis: {
							type: null,
							title: {
								text: null,
								enabled: true,
								style: {
									"color": "#707070",
									"font-weight": "bold"
								}
							},
							categories: [],
							min: null,
							max: null,
							tickLength: 10,
							tickWidth: 1,
							tickColor: null,
							orient: "bottom",
							gridLineColor:"#c0c0c0",
							gridLineWidth:1
						},
						yAxis: {
							type: null,
							title: {
								text: null,
								enabled: true,
								style: {
									"color": "#707070",
									"font-weight": "bold"
								}
							},
							categories: [],
							min: null,
							max: null,
							tickLength: 10,
							tickWidth: 1,
							tickColor: null,
							orient: "left",
							gridLineColor:"#c0c0c0",
							gridLineWidth:1
						},
						tooltip: {
							style: null,
							shadow: true,
							backgroundColor: 'rgba(255, 255, 255, 0.85)',
							borderColor: null,
							borderRadius: 3,
							borderWidth: 1,
							enabled: true
						}
					};

					var option = jQuery.extend(true, {}, defaultOpt, data);

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
						.range([yAxisH, option.yAxis.min ? option.yAxis.min : 0])
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
							'stroke': option.xAxis.gridLineColor,
							'stroke-width': option.xAxis.gridLineWidth,
							'fill': 'none',
							'shape-rendering': 'crispEdges'
						})
						.selectAll('text')
						.style({
							'text-anchor': 'center',
							'font-size': '14px',
							'font-weight': 500,
							'fill': '#525252',
							'stroke-width': '0px'
						})
						.attr("transform", "rotate(-20)");

					//Y 轴
					svg.append("g")
						.call(yAxis)
						.attr("class", "yaxis")
						.style({
							'stroke': option.yAxis.gridLineColor,
							'stroke-width': option.yAxis.gridLineWidth,
							'fill': 'none',
							'shape-rendering': 'crispEdges'
						})
						.selectAll('text')
						.style({
							'text-anchor': 'end',
							'font-size': '12px',
							'font-weight': 500,
							'fill': '#525252',
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
							'fill': option.color[0],
						})
						.attr("index", function(d, v) {
							return v;
						})
						.attr("x", function(d, v) {
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
						.attr("x", function(d, v) {
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
								'fill': option.color[1]
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

							var info = {
								value: rect[0][0].__data__,
								name: option.xAxis.categories[rect.attr('index')]
							};
							var tooltip = d3.select(element[0]).select(".bar-tooltip");
							if (!tooltip[0][0]) {
								var tooltip = svg.append('g')
									.attr('class', 'bar-tooltip')
									.style({
										'visibility': 'visible'
									})
									.attr("transform", "translate(" + tooltipPos.left + "," + tooltipPos.top + ")");

								tooltip.append('rect')
									.attr("width", rectWH.w)
									.attr("height", rectWH.h)
									.attr("rx", 5)
									.attr("ry", 5)
									.style({
										'opacity': '0.8',
										'stroke': option.color[0],
										'stroke-width': 1,
										'fill': '#fff'
									});
								tooltip.append('text')
									.attr("transform", "translate(10,20)")
									.text(info.name + " : " + info.value)
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
								.attr("transform", "translate(" + tooltipPos.left + "," + tooltipPos.top + ")")
								.select("text")
								.text(info.name + " : " + info.value);
							}
						})
						.on('mouseout', function() {
							d3.select(this).style({
								'fill': option.color[0]
							});
							d3.select(".bar-tooltip")
								.style({
									'visibility': 'hidden',
								});
						});
				}
			};
		}
	]);

})(angular);