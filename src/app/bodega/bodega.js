angular.module('app.bodega', [
  'ui.router',
  'toastr',
  'app.bodega.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.bodega', {
          abstract: true,
          url: 'bodega',
          template: '<div ui-view></div>',
          resolve: {
          },
          controller: ['$scope',
            function (  $scope) {
              $scope.module = 'Bodega';
            }]

        })
        .state('index.bodega.list', {
          url: '',
          templateUrl: 'app/bodega/bodega.list.tpl.html',
          resolve: {
            bodega: ['bodegaService',
              function ( bodegaService ){
                return bodegaService.list();
              }]
          },
          controller: ['$scope', '$state', 'bodega',
            function (  $scope,   $state,   bodega) {
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'bodega_desc', name: 'Tipo' }
              ];
              
              $scope.gridOptions.data = bodega.data;
              $scope.editRow = function ( row ) {
                $state.go('^.edit',{ bodega_id: row.bodega_id });
              }
            }]

        })
        .state('index.bodega.add', {
          url: '/add',
          templateUrl: 'app/bodega/bodega.add.tpl.html',
          resolve: {
            dataEstado: ['bodegaService',
              function ( bodegaService ){
                return bodegaService.listaEstado();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'bodegaService', 'dataEstado',
            function (  $scope,   $state,   toastr,   bodegaService, dataEstado) {
              $scope.dataEstado = dataEstado.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  bodegaService.add( $scope.data ).then( function ( res ) {
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
        .state('index.bodega.edit', {
          url: '/:bodega_id/edit',
          templateUrl: 'app/bodega/bodega.add.tpl.html',
          resolve: {
            bodega: ['bodegaService', '$stateParams',
              function ( bodegaService, $stateParams ){
                return bodegaService.get( $stateParams.bodega_id );
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'bodegaService', 'bodega',
            function (  $scope,   $state,   toastr,   bodegaService,   bodega) {
              $scope.data = bodega.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  bodegaService.edit( $scope.data ) .then( function ( res ) {
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
