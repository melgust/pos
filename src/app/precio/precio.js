angular.module('app.precio', [
  'ui.router',
  'toastr',
  'app.precio.service',
  'app.tipocliente.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.precio', {
          abstract: true,
          url: 'precio',
          template: '<div ui-view></div>',
          resolve: {

          },
          controller: ['$scope',
            function ($scope) {
              $scope.module = 'Precios de productos';
            }]
        })
        .state('index.precio.list', {
          url: '',
          params: {
          },
          templateUrl: 'app/precio/precio.list.tpl.html',
          resolve: {
            tipoCliente: ['tipoclienteService',
              function ( tipoclienteService ){
                return tipoclienteService.list();
              }],
            dataEstado: ['precioService',
              function ( precioService ){
                return precioService.listaEstado();
              }]
          },
          controller: ['$scope', '$state', 'utils', 'toastr', 'ngDialog', 'tipoCliente', 'dataEstado', 'precioService',
            function (  $scope, $state, utils, toastr, ngDialog, tipoCliente, dataEstado, precioService) {
              $scope.dataFiltro = {
                tipo_cliente_id : null,
                producto_id : null
              }
              $scope.tipoCliente = tipoCliente.data;
              $scope.dataEstado = dataEstado.data;
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'producto_desc', name: 'Producto' },
                { field:'precio', name: 'Precio' },
                { field:'estado_desc', name: 'Estado' },
                { name: 'OPCIONES', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.editRow(row.entity)" title="Editar registro">Editar</button></span></div>' }
              ];
              $scope.gridOptions.data = [];
              var recargarGrid = function () {
                precioService.list( $scope.dataFiltro.tipo_cliente_id ).then( function ( res ) {
                  if ( res.status == "OK" ) {
                    $scope.gridOptions.data = res.data;
                  } else {
                    toastr.error( res.message );
                  }
                }, function ( error ) {
                  toastr.error( error );
                });
              }

              var recargarLista = function () {
                precioService.listaProducto( $scope.dataFiltro.tipo_cliente_id ).then( function ( res ) {
                  if ( res.status == "OK" ) {
                    $scope.dataProducto = res.data;
                  } else {
                    toastr.error( res.message );
                  }
                }, function ( error ) {
                  toastr.error( error );
                });
              }

              $scope.cargarProductos = function (tipo) {
                recargarLista();
                recargarGrid();
              }

              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  if ( $scope.dataFiltro.producto_id == 0) {
                    precioService.addAll( $scope.dataFiltro.tipo_cliente_id ).then( function ( res ) {
                      if ( res.status == "OK" ) {
                        recargarLista();
                        recargarGrid();
                      } else {
                        toastr.error( res.message );
                      }
                    }, function ( error ) {
                      toastr.error( error );
                    });
                  } else {
                    var date = new Date();
                    var data = {
                      precio_id : 0,
                      precio : 0.00,
                      estado : 1,
                      fecha_inicio : date.getDate(),
                      fecha_fin : date.getDate(),
                      tipo_cliente_id : $scope.dataFiltro.tipo_cliente_id,
                      producto_id : $scope.dataFiltro.producto_id
                    }
                    precioService.add( data ).then( function ( res ) {
                      if ( res.status == "OK" ) {
                        recargarLista();
                        recargarGrid();
                      } else {
                        toastr.error( res.message );
                      }
                    }, function ( error ) {
                      toastr.error( error );
                    });
                  }
                }
              }

              $scope.editRow = function ( row ) {
                precioService.get( row.precio_id ).then( function ( res ) {
                  if ( res.status == "OK" ) {
                    $scope.dataPrecio = res.data;
                    ngDialog.open({
                      template: 'app/precio/precio.add.tpl.html',
                      //className: 'ngdialog-theme-plain',
                      width: 600,
                      closeByDocument: false,
                      closeByEscape: true,
                      scope: $scope
                    });
                  } else {
                    toastr.error( res.message );
                  }
                }, function ( error ) {
                  toastr.error( error );
                });
              };

              $scope.submitFormPrecio = function ( isValid ) {
                if ( isValid ) {
                  var data = {
                    precio_id : $scope.dataPrecio.precio_id,
                    precio : $scope.dataPrecio.precio,
                    estado : $scope.dataPrecio.estado,
                    fecha_inicio : $scope.dataPrecio.fecha_inicio,
                    fecha_fin : $scope.dataPrecio.fecha_fin
                  }
                  precioService.edit( data ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      recargarGrid();
                      toastr.success( res.message );
                      ngDialog.close();
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                }
              };

              $scope.cerrarVentana = function () {
                ngDialog.close();
                if ($scope.producto) {
                  $scope.producto.codigoProducto = null;
                }
              };
            }]
        })
    }
  ]
);
