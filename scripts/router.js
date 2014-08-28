(function(angular){
	"use strict";
	angular.module("ngd3")
		.config(["$stateProvider","$urlRouterProvider",function($stateProvider,$urlRouterProvider){
			$urlRouterProvider.otherwise('/');

			$stateProvider.state("home",{
				url:'/',
				templateUrl:'views/main.html',
				controller:"HomeController"
			});
		}]);
		
})(angular);