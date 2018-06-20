(function (angular) {
  angular
    .module('{{ngCtrlModuleName}}')
    .controller('{{ctrlName}}', {{ctrlName}})

  {{ctrlName}}.$inject = []

  function {{ctrlName}}() {
    var vm = this;
  }
}(angular));

