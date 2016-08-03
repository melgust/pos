angular.module('app.cliente', [
  'ui.router',
  'toastr',
  'app.cliente.service',
  'app.tipocliente.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.cliente', {

          abstract: true,

          url: 'cliente',

          template: '<div ui-view></div>',

          resolve: {
          },

          controller: ['$scope',
            function (  $scope) {

              $scope.module = 'Cliente';

            }]

        })
        .state('index.cliente.list', {

          url: '',

          params: {
            stateToGo: null
          },

          templateUrl: 'app/cliente/cliente.list.tpl.html',

          resolve: {
            cliente: ['clienteService',
              function ( clienteService ){
                return clienteService.list();
              }]
          },

          controller: ['$scope', '$state', 'utils', 'cliente',
            function (  $scope,   $state,   utils,   cliente) {
              $scope.cliente = {};
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'cliente_id', name: 'Código del cliente' },
                { field:'cliente_desc', name: 'Cliente' },
                { field:'nit', name: 'Nit' },
                { field:'direccion', name: 'Dirección' },
                { field:'telefono', name: 'Teléfono' },
              ];

              $scope.gridOptions.data = cliente.data;

              $scope.editRow = function ( row ) {
                $state.go('^.edit',{ cliente_id: row.cliente_id });
              };

              $scope.gridOptions.onRegisterApi = function ( gridApi ) {
                gridApi.selection.on.rowSelectionChanged( $scope, function ( row ) {
                  if ( row.isSelected ) {
                    $scope.cliente = row.entity;
                  } else {
                    $scope.cliente = undefined;
                  }
                });

                gridApi.grid.registerDataChangeCallback( function () {
                  if ( $scope.current.cliente ) {
                    $scope.cliente = utils.findByField( $scope.gridOptions.data, 'cliente_id', $scope.current.cliente.cliente_id );
                    gridApi.selection.toggleRowSelection(
                      $scope.gridOptions.data[ $scope.gridOptions.data.indexOf( $scope.cliente )]
                    );
                  }
                });
              };

              $scope.isCurrentCliente = function () {
                // console.log('iscurrentcustomer',$scope.current.customer, $scope.customer);
                return $scope.current.cliente != undefined && $scope.cliente != undefined && $scope.current.cliente.cliente_id === $scope.cliente.cliente_id;
              };

              console.log( 'stateParams', $state.params.stateToGo );

              if ( $state.params.stateToGo ) {
                $scope.current.stateToGo = $state.params.stateToGo;
                console.log( '$scope.cliente.stateToGo', $scope.cliente.stateToGo );
              }

              $scope.setCliente = function () {
                // unselect
                if ( $scope.isCurrentCliente() ) {
                  $scope.current.cliente = undefined;
                } else {
                  $scope.current.cliente = $scope.cliente;
                }
                $state.go( $scope.current.stateToGo );
              };
            }]

        })
        .state('index.cliente.add', {

          url: '/add',

          templateUrl: 'app/cliente/cliente.add.tpl.html',

          resolve: {
            tipoCliente: ['tipoclienteService',
              function ( tipoclienteService ){
                return tipoclienteService.list();
              }]
          },

          controller: ['$scope', '$state', 'toastr', 'clienteService', 'tipoCliente',
            function (  $scope,   $state,   toastr,   clienteService,   tipoCliente) {

              $scope.tipoCliente = tipoCliente.data;

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
                    clienteService.add( $scope.data ).then( function ( res ) {
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
        .state('index.cliente.edit', {

          url: '/:cliente_id/edit',

          templateUrl: 'app/cliente/cliente.add.tpl.html',

          resolve: {
            cliente: ['clienteService', '$stateParams',
              function ( clienteService, $stateParams ){
                return clienteService.get( $stateParams.cliente_id );
              }],
            tipoCliente: ['tipoclienteService',
              function ( tipoclienteService ){
                return tipoclienteService.list();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'clienteService', 'cliente', 'tipoCliente',
            function (  $scope,   $state,   toastr,   clienteService,   cliente,   tipoCliente) {
              $scope.data = cliente.data;
              $scope.tipoCliente = tipoCliente.data;
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
                    clienteService.edit( $scope.data ) .then( function ( res ) {
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
