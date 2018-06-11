angular
  .module('{{ngComponentModuleName}}')
  .directive('{{componentName}}', {{componentName}});

function () {
  var directive = {
    restrict: 'EA',
    templateUrl: '',
    scope: {
    },
    link: linkFunc,
    controller : {{componentName}}Ctrl,
    controllerAs: 'vm',
  };

  return directive;

  function linkFunc(scope, el, attr, ctrl) {

  }
}

{{componentName}}Ctrl.$inject = ['$scope'];

function {{componentName}}Ctrl($scope) {
  var vm = this;
}