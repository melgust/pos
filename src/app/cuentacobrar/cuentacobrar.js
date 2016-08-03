angular.module('app.cuentacobrar', [
  'ui.router',
  'toastr',
  'app.cuentacobrar.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.cuentacobrar', {
          abstract: true,
          url: 'cuentacobrar',
          template: '<div ui-view></div>',
          resolve: {

          },
          controller: ['$scope',
            function ($scope) {
              $scope.module = 'Cuentas por cobrar';
            }]
        })
        .state('index.cuentacobrar.list', {
          url: '',
          params: {
          },
          templateUrl: 'app/cuentacobrar/cuentacobrar.list.tpl.html',
          resolve: {
            dataLista: ['cuentacobrarService',
              function ( cuentacobrarService ){
                return cuentacobrarService.lista();
              }]
          },
          controller: ['$scope', '$state', 'utils', 'toastr', 'dataLista', 'cuentacobrarService',
            function (  $scope, $state, utils, toastr, dataLista, cuentacobrarService) {
              $scope.dataLista = dataLista.data;
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'cuenta_cobrar_id', name: 'No. Crédito' },
                { field:'valor', name: 'Valor' },
                { field:'saldo', name: 'Saldo' },
                { field:'fecha_registro', name: 'Fecha crédito',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate(row.entity.fecha_registro)  | date:grid.appScope.dateOptions.format}}</div>' },
                { field:'fecha_ult_modif', name: 'Fecha último abono',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate(row.entity.fecha_ult_modif)  | date:grid.appScope.dateOptions.format}}</div>' },
                { name: 'OPCIONES', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.abonar(row.entity)" title="Abonar a cuenta">Abonar</button></span></div>' }
              ];

              $scope.cargarDatos = function ( cliente_id ) {
                cuentacobrarService.listaCliente( cliente_id ).then( function ( res ) {
                  if ( res.status == "OK" ) {
                    $scope.gridOptions.data = res.data;
                  } else {
                    toastr.error( res.message );
                  }
                }, function ( error ) {
                  toastr.error( error );
                });
              }

              $scope.abonar = function ( row ) {
                $state.go('^.abonar',{ id: row.cuenta_cobrar_id });
              };
            }
          ]
        }
      )
      .state('index.cuentacobrar.abonar', {

        url: '/:id/abonar',

        templateUrl: 'app/cuentacobrar/cuentacobrar.add.tpl.html',

        resolve: {
          dataCuenta: ['cuentacobrarService', '$stateParams',
            function ( cuentacobrarService, $stateParams ){
              return cuentacobrarService.get( $stateParams.id );
            }]
        },
        controller: ['$scope', '$state', 'toastr', 'cuentacobrarService', 'dataCuenta',
          function ($scope, $state, toastr, cuentacobrarService, dataCuenta) {
            $scope.data = {
              cuenta_cobrar_id : dataCuenta.data.cuenta_cobrar_id,
              cliente_desc : dataCuenta.data.cliente_desc,
              valor: dataCuenta.data.valor,
              saldo : dataCuenta.data.saldo,
              monto : null,
              usuario_id : $scope.loginData.usuario_id
            };
            $scope.submitForm = function ( isValid ) {
              if ($scope.data.monto > $scope.data.saldo) {
                isValid = false;
                toastr.error( 'El abono no puede ser superior al saldo' );
              }
              if ( isValid ) {
                cuentacobrarService.add( $scope.data ) .then( function ( res ) {
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
        ]
      }
    )
    }
  ]
);
