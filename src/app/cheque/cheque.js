angular.module('app.cheque', [
  'ui.router',
  'toastr',
  'app.cheque.service',
  'app.bancoService'
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
              }],
            dataBanco: ['bancoService',
              function ( bancoService ){
                return bancoService.list();
              }]
          },
          controller: ['$scope', '$state', 'utils', 'toastr', 'dataLista', 'chequeService', 'dataBanco', 'ngDialog',
            function (  $scope, $state, utils, toastr, dataLista, chequeService, dataBanco, ngDialog) {
              $scope.dataLista = dataLista.data;
              $scope.dataBanco = dataBanco.data;
              $scope.consulta = {};
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'numero', name: 'No. Cheque' },
                { field:'cuenta', name: 'Cuenta' },
                { field:'cheque_desc', name: 'Nombre' },
                { field:'monto', name: 'Monto' },
                { field:'fecha_disponible', name: 'Fecha disponible',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate(row.entity.fecha_disponible)  | date:grid.appScope.dateOptions.format}}</div>' },
                { field:'fecha_cobro', name: 'Fecha de cobro',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate(row.entity.fecha_cobro)  | date:grid.appScope.dateOptions.format}}</div>' },
                { name: 'OPCIONES', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.editar(row.entity)" title="Editar cheque">Editar</button></span></div>' }
              ];

              $scope.cargarDatos = function ( cliente_id ) {
                chequeService.listaCliente( cliente_id ).then( function ( res ) {
                  if ( res.status == "OK" ) {
                    $scope.gridOptions.data = res.data;
                    $scope.consulta = {};
                    $scope.consulta.cliente_id = cliente_id;
                    $scope.consulta.numero = null;
                    $scope.consulta.cuenta = null;
                  } else {
                    toastr.error( res.message );
                  }
                }, function ( error ) {
                  toastr.error( error );
                });
              }

              $scope.editar = function ( row ) {
                if (row.estado_id == 2 ) {
                  toastr.warning('El cheque ya tiene fecha de cobro no es posible modificarlo');
                } else {
                  $scope.cheque = row;
                  $scope.banco_id = row.banco_id;
                  ngDialog.open({
                    template: 'app/cheque/cheque.add.tpl.html',
                    className: 'ngdialog-theme-default',
                    closeByDocument: false,
                    closeByEscape: true,
                    scope: $scope
                  });
                }
              };

              $scope.cerrarVentana = function () {
                ngDialog.close();
              }

              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  chequeService.buscar( $scope.data.numero, $scope.data.cuenta ) .then( function ( res ) {
                    if ( res.status == "OK" ) {
                      $scope.gridOptions.data = res.data;
                      $scope.consulta = {};
                      $scope.consulta.numero = $scope.data.numero;
                      $scope.consulta.cuenta = $scope.data.cuenta;
                      $scope.consulta.cliente_id = null;
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                }
              }

              $scope.submitFormCheque = function ( isValid ) {
                if ( isValid ) {
                  $scope.cheque.usuario_id = $scope.loginData.usuario_id;
                  chequeService.cobrar( $scope.cheque ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      if ($scope.consulta.cliente_id != null) {
                        $scope.cargarDatos($scope.consulta.cliente_id);
                      } else {
                        $scope.data.numero = $scope.consulta.numero;
                        $scope.data.cuenta = $scope.consulta.cuenta;
                        $scope.submitForm(true);
                      }
                      ngDialog.close();
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
