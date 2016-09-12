angular.module('app.cheque', [
  'ui.router',
  'toastr',
  'app.cheque.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.cheque', {
          abstract: true,
          url: 'cheque',
          template: '<div ui-view></div>',
          resolve: {

          },
          controller: ['$scope',
            function ($scope) {
              $scope.module = 'Cuentas por cobrar';
            }]
        })
        .state('index.cheque.list', {
          url: '',
          params: {
          },
          templateUrl: 'app/cheque/cheque.list.tpl.html',
          resolve: {
            dataLista: ['chequeService',
              function ( chequeService ){
                return chequeService.lista();
              }]
          },
          controller: ['$scope', '$state', 'utils', 'toastr', 'dataLista', 'chequeService',
            function (  $scope, $state, utils, toastr, dataLista, chequeService) {
              $scope.dataLista = dataLista.data;
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'numero', name: 'No. Cheque' },
                { field:'cuenta', name: 'Cuenta' },
                { field:'cheque_desc', name: 'Nombre' },
                { field:'monto', name: 'Monto' },
                { field:'fecha_registro', name: 'Fecha registro',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate(row.entity.fecha_registro)  | date:grid.appScope.dateOptions.format}}</div>' },
                { field:'fecha_cobro', name: 'Fecha de cobro',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate(row.entity.fecha_ult_modif)  | date:grid.appScope.dateOptions.format}}</div>' },
                { name: 'OPCIONES', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.editar(row.entity)" title="Editar cheque">Editar</button></span></div>' }
              ];

              $scope.cargarDatos = function ( cliente_id ) {
                chequeService.listaCliente( cliente_id ).then( function ( res ) {
                  if ( res.status == "OK" ) {
                    $scope.gridOptions.data = res.data;
                  } else {
                    toastr.error( res.message );
                  }
                }, function ( error ) {
                  toastr.error( error );
                });
              }

              $scope.editar = function ( row ) {
                $state.go('^.abonar',{ id: row.cuenta_cobrar_id });
              };

              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  chequeService.buscar( $scope.data.numero, $scope.data.cuenta ) .then( function ( res ) {
                    if ( res.status == "OK" ) {
                      $scope.gridOptions.data = res.data;
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
