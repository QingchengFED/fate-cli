(function (angular) {
angular
  .module('{{ngComponentModuleName}}')
  .directive('{{directiveName}}', {{directiveName}});

function () {
  var directive = {
    restrict: 'EA',
    templateUrl: '',
    scope: {
    },
    link: linkFunc,
    controller : {{directiveName}}Ctrl,
    controllerAs: 'vm',
};

  return directive;

  function linkFunc(scope, el, attr, ctrl) {

  }
}

{{directiveName}}Ctrl.$inject = [];

function {{directiveName}}Ctrl() {
  var vm = this;
}
}(angular));

