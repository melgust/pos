angular.module('app.banco', [
  'ui.router',
  'toastr',
  'app.bancoService'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.banco', {
          abstract: true,
          url: 'banco',
          template: '<div ui-view></div>',
          resolve: {
          },
          controller: ['$scope',
            function (  $scope) {
              $scope.module = 'Bancos';
            }]
        })
        .state('index.banco.list', {
          url: '',
          templateUrl: 'app/banco/banco.list.tpl.html',
          resolve: {
            banco: ['bancoService',
              function ( bancoService ){
                return bancoService.list();
              }]
          },
          controller: ['$scope', '$state', 'banco',
            function (  $scope,   $state,   banco) {
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'banco_desc', name: 'Banco' },
              ];
              $scope.gridOptions.data = banco.data;
              $scope.editRow = function ( row ) {
                $state.go('^.edit',{ banco_id : row.banco_id });
              }
            }]
        })
        .state('index.banco.add', {
          url: '/add',
          templateUrl: 'app/banco/banco.add.tpl.html',
          resolve: {
          },
          controller: ['$scope', '$state', 'toastr', 'bancoService',
            function (  $scope,   $state,   toastr,   bancoService) {
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  bancoService.add( $scope.data ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      toastr.success( res.message );
                      $state.go( '^.list' );
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                }
              }
            }]
        })
        .state('index.banco.edit', {
          url: '/:banco_id/edit',
          templateUrl: 'app/banco/banco.add.tpl.html',
          resolve: {
            banco: ['bancoService', '$stateParams',
              function ( bancoService, $stateParams ){
                return bancoService.get( $stateParams.banco_id );
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'bancoService', 'banco',
            function (  $scope,   $state,   toastr,   bancoService,   banco) {
              $scope.data = banco.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  bancoService.edit( $scope.data ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      toastr.success( res.message );
                      $state.go( '^.list' );
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                }
              }
            }]
        })
    }
  ]
);
