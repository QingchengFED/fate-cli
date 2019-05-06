(function (angular) {
angular
  .module('{{ngComponentModuleName}}')
  .directive('{{componentName}}', {{componentName}});

function {{componentName}}() {
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

function {{componentName}}Ctrl() {
  var vm = this;
}
}(angular));
