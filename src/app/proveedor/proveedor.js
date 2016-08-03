angular.module('app.proveedor', [
  'ui.router',
  'toastr',
  'app.proveedor.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.proveedor', {
          abstract: true,
          url: 'proveedor',
          template: '<div ui-view></div>',
          resolve: {
          },
          controller: ['$scope',
            function (  $scope) {
              $scope.module = 'Proveedores';
            }]
        })
        .state('index.proveedor.list', {
          url: '',
          params: {
          },

          templateUrl: 'app/proveedor/proveedor.list.tpl.html',
          resolve: {
            proveedor: ['proveedorService',
              function ( proveedorService ){
                return proveedorService.list();
              }]
          },

          controller: ['$scope', '$state', 'utils', 'proveedor',
            function (  $scope,   $state,   utils,   proveedor) {
              $scope.proveedor = {};
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'proveedor_desc', name: 'proveedor' },
                { field:'contacto', name: 'Contacto' },
                { field:'direccion', name: 'Dirección' },
                { field:'telefono', name: 'Teléfono' },
              ];

              $scope.gridOptions.data = proveedor.data;

              $scope.editRow = function ( row ) {
                $state.go('^.edit',{ proveedor_id: row.proveedor_id });
              };
            }]
        })
        .state('index.proveedor.add', {
          url: '/add',
          templateUrl: 'app/proveedor/proveedor.add.tpl.html',
          resolve: {
            dataEstado: ['proveedorService',
              function ( proveedorService ){
                return proveedorService.listaEstado();
              }]
          },

          controller: ['$scope', '$state', 'toastr', 'proveedorService', 'dataEstado',
            function (  $scope, $state, toastr, proveedorService, dataEstado) {
              $scope.dataEstado = dataEstado.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  proveedorService.add( $scope.data ).then( function ( res ) {
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
        .state('index.proveedor.edit', {
          url: '/:proveedor_id/edit',
          templateUrl: 'app/proveedor/proveedor.add.tpl.html',
          resolve: {
            proveedor: ['proveedorService', '$stateParams',
              function ( proveedorService, $stateParams ){
                return proveedorService.get( $stateParams.proveedor_id );
              }],
            dataEstado: ['proveedorService',
              function ( proveedorService ){
                return proveedorService.listaEstado();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'proveedorService', 'proveedor', 'dataEstado',
            function ( $scope, $state, toastr, proveedorService, proveedor, dataEstado) {
              $scope.data = proveedor.data;
              $scope.dataEstado = dataEstado.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  proveedorService.edit( $scope.data ) .then( function ( res ) {
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
