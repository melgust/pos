angular.module('app.caja', [
  'ui.router',
  'toastr',
  'app.caja.service',
  'app.tiendaService'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.caja', {
          abstract: true,
          url: 'caja',
          template: '<div ui-view></div>',
          resolve: {
          },
          controller: ['$scope',
            function (  $scope) {
              $scope.module = 'Caja';
            }
          ]
        })
        .state('index.caja.list', {
          url: '',
          params: {
          },
          templateUrl: 'app/caja/caja.list.tpl.html',
          resolve: {
            caja: ['cajaService',
              function ( cajaService ){
                return cajaService.list();
              }]
          },
          controller: ['$scope', '$state', 'utils', 'caja',
            function (  $scope,   $state,   utils,   caja) {
              $scope.caja = {};
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'caja_id', name: 'Código' },
                { field:'caja_desc', name: 'caja' },
                { field:'serie', name: 'Serie' },
                { field:'numero_factura', name: 'Correlativo factura' },
                { field:'numero_proforma', name: 'Correlativo proforma' },
                { field:'numero_envio', name: 'Correlativo envio' }
              ];

              $scope.gridOptions.data = caja.data;
              $scope.editRow = function ( row ) {
                $state.go('^.edit',{ caja_id: row.caja_id });
              };
            }
          ]
        })
        .state('index.caja.add', {
          url: '/add',
          templateUrl: 'app/caja/caja.add.tpl.html',
          resolve: {
            dataTienda: ['tiendaService', '$stateParams',
              function ( tiendaService, $stateParams ){
                return tiendaService.list();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'cajaService', 'dataTienda',
            function (  $scope,   $state,   toastr,   cajaService,   dataTienda) {
              $scope.dataTienda = dataTienda.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  var continuar = true;
                  var nit = $scope.data.nit.toUpperCase();
                  if (nit != 'C/F') {
                    if (nit.length <= 5) {
                      continuar = false;
                      toastr.error('No es un nit válido, favor de revisar');
                    }
                  }
                  if (continuar == true) {
                    cajaService.add( $scope.data ).then( function ( res ) {
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
              }
            }]
        })
        .state('index.caja.edit', {

          url: '/:caja_id/edit',

          templateUrl: 'app/caja/caja.add.tpl.html',

          resolve: {
            caja: ['cajaService', '$stateParams',
              function ( cajaService, $stateParams ){
                return cajaService.get( $stateParams.caja_id );
              }],
            dataTienda: ['tiendaService', '$stateParams',
              function ( tiendaService, $stateParams ){
                return tiendaService.list();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'cajaService', 'caja', 'dataTienda',
            function (  $scope,   $state,   toastr,   cajaService,   caja,   dataTienda) {
              $scope.data = caja.data;
              $scope.dataTienda = dataTienda.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  var continuar = true;
                  var nit = $scope.data.nit.toUpperCase();
                  if (nit != 'C/F') {
                    if (nit.length <= 5) {
                      continuar = false;
                      toastr.error('No es un nit válido, favor de revisar');
                    }
                  }
                  if (continuar == true) {
                    cajaService.edit( $scope.data ) .then( function ( res ) {
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
              }
            }]
        })
    }
  ]
);
