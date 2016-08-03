angular.module('app.tipocliente', [
  'ui.router',
  'toastr',
  'app.tipocliente.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.tipocliente', {
          abstract: true,
          url: 'tipocliente',
          template: '<div ui-view></div>',
          resolve: {
          },
          controller: ['$scope',
            function (  $scope) {
              $scope.module = 'Tipo de Cliente';
            }]

        })
        .state('index.tipocliente.list', {
          url: '',
          templateUrl: 'app/tipocliente/tipocliente.list.tpl.html',
          resolve: {
            tipocliente: ['tipoclienteService',
              function ( tipoclienteService ){
                return tipoclienteService.list();
              }]
          },
          controller: ['$scope', '$state', 'tipocliente',
            function (  $scope,   $state,   tipocliente) {
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'tipo_cliente_desc', name: 'Tipo' },
                { field:'limite_credito', name: 'Limite de credito' }
              ];
              $scope.gridOptions.data = tipocliente.data;
              $scope.editRow = function ( row ) {
                $state.go('^.edit',{ tipo_cliente_id: row.tipo_cliente_id });
              }
            }]

        })
        .state('index.tipocliente.add', {
          url: '/add',
          templateUrl: 'app/tipocliente/tipocliente.add.tpl.html',
          resolve: {
          },
          controller: ['$scope', '$state', 'toastr', 'tipoclienteService',
            function (  $scope,   $state,   toastr,   tipoclienteService) {
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  tipoclienteService.add( $scope.data ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      toastr.success( 'Agregado' );
                      $state.go( '^.list' );
                    } else {
                      toastr.error( res.status );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                }
              }
            }]
        })
        .state('index.tipocliente.edit', {
          url: '/:tipo_cliente_id/edit',
          templateUrl: 'app/tipocliente/tipocliente.add.tpl.html',
          resolve: {
            tipocliente: ['tipoclienteService', '$stateParams',
              function ( tipoclienteService, $stateParams ){
                return tipoclienteService.get( $stateParams.tipo_cliente_id );
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'tipoclienteService', 'tipocliente',
            function (  $scope,   $state,   toastr,   tipoclienteService,   tipocliente) {
              $scope.data = tipocliente.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  tipoclienteService.edit( $scope.data ) .then( function ( res ) {
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
