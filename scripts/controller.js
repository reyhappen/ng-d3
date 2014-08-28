(function(angular) {
	"use strict";

	angular.module("ngd3")
		.controller("HomeController", ['$scope', '$timeout','$window',
			function($scope, $timeout,$window) {

				//demo d3
				$scope.d3Data = {
						title: {
							text: "开发语言调查结果"
						},
						series: {
							datas: [545, 667, 794, 400,900]
						},
						xAxis: {
							categories: ['php', 'c++', 'python', 'js','node'],
							tickWidth: 20,
						},
						yAxis: {
							title: {
								text: "支持数 (人)"
							},
							min: 0,
							max: 100
						}
					};
			}
		]);
})(angular);