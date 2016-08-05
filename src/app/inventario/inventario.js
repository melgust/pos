angular.module('app.inventario', [
  'ui.router',
  'toastr',
  'app.inventario.service',
  'app.proveedor.service',
  'app.producto.service',
  'app.bodega.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.inventario', {

          abstract: true,

          url: 'inventario',

          template: '<div ui-view></div>',

          resolve: {
          },

          controller: ['$scope', 'toastr', 'appSettings',
            function (  $scope, toastr, appSettings) {
              $scope.module = 'Inventario';
            }
          ]
        })
        .state('index.inventario.list', {
          url: '',
          templateUrl: 'app/inventario/inventario.list.tpl.html',
          resolve: {
            inventario: ['inventarioService',
              function ( inventarioService ){
                return inventarioService.list();
              }]
          },

          controller: ['$scope', '$state', 'toastr', 'inventario', 'inventarioService',
            function (  $scope, $state, toastr, inventario, inventarioService) {

              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.rowHeight = 70;
              $scope.gridOptions.columnDefs = [
                { field:'producto_desc', name: 'Producto' },
                { field:'proveedor_desc', name: 'Proveedor' },
                { field:'bodega_desc', name: 'Bodega' },
                { field:'fecha', name: 'Fecha Registro',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate2(row.entity.fecha)  | date:grid.appScope.dateOptions.format}}</div>' },
                { field:'no_envio', name: 'No. envio' },
                { field:'fecha_vencimiento', name: 'Fecha vencimiento',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate2(row.entity.fecha_vencimiento)  | date:grid.appScope.dateOptions.format}}</div>' },
                { field:'cantidad', name: 'Cantidad' },
                { field: 'imagen_url', name: 'Imagen', enableFiltering: false,
                  cellTemplate:"<img width=\"70px\" ng-src=\"{{grid.appScope.getUrlImg(row.entity.imagen_url)}}\" lazy-src>", width: "10%"},
                  { name: 'OPCIONES', enableFiltering: false,
                    cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.editRow(row.entity)" title="Anular registro">Anular</button></span></div>' }
              ];
              $scope.getUrlImg = function(value) {
                return appSettings.urlBaseImg + value;
              }

              $scope.getTableHeight = function() {
                 var rowHeight = 110; // your row height
                 var headerHeight = 70; // your header height
                 return {
                    height: ($scope.gridOptions.data.length * rowHeight + headerHeight) + "px"
                 };
              };

              $scope.gridOptions.data = inventario.data;

              $scope.editRow = function ( row ) {
                swal({
                  title: "¿Está seguro que desea anular el registro?",
                  text: "",
                  showCancelButton: true,
                  confirmButtonClass: "btn-success",
                  confirmButtonText: "Confirmar",
                  cancelButtonClass: "btn-danger",
                  cancelButtonText: "Cancelar",
                  closeOnConfirm: true,
                },
                function () {
                  $scope.data = {usuario_id : $scope.loginData.usuario_id};
                  inventarioService.edit( row.ingreso_inventario_id, $scope.data ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      var index = $scope.gridOptions.data.indexOf( row );
                      $scope.gridOptions.data.splice(index, 1);
                      toastr.success( res.message );
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                });
              }
            }]

        })
        .state('index.inventario.add', {

          url: '/add',

          templateUrl: 'app/inventario/inventario.add.tpl.html',

          resolve: {
            dataProducto: ['productoService',
              function ( productoService ){
                return productoService.list();
              }],
            dataProveedor: ['proveedorService',
              function ( proveedorService ){
                return proveedorService.list();
              }],
            dataBodega: ['bodegaService',
              function ( bodegaService ){
                return bodegaService.list();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'appSettings', 'Upload', 'inventarioService', 'dataProducto', 'dataProveedor', 'dataBodega',
            function ($scope, $state, toastr, appSettings, Upload, inventarioService, dataProducto, dataProveedor, dataBodega) {
              $scope.data = {
                producto_id : null,
                producto_desc : null,
                proveedor_id: null,
                proveedor_desc : null,
                cantidad : null,
                existencia : null,
                no_envio : null,
                lote : null,
                fecha_vencimiento : null,
                bodega_id : null,
                bodega_desc : null,
                usuario_id : $scope.loginData.usuario_id
              };
              $scope.muestraImagen = 0;
              $scope.dataImg = { urlImg : null };
              $scope.dataProducto = dataProducto.data;
              $scope.dataProveedor = dataProveedor.data;
              $scope.dataBodega = dataBodega.data;
              $scope.lista = {
                datos : []
              };
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'producto_desc', name: 'Producto' },
                { field:'proveedor_desc', name: 'Proveedor' },
                { field:'cantidad', name: 'Cantidad' },
                { field:'bodega_desc', name: 'Bodega' },
                { field:'no_envio', name: '# Envio' },
                { field:'lote', name: 'Lote' },
                { name: 'OPCIONES', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.quitarFila(row.entity)" title="Quitar">Quitar</button></span></div>' }
              ];
              $scope.gridOptions.data = $scope.lista.datos;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  var i;
                  for (i = 0; i < $scope.dataProducto.length; i++) {
                    if ( $scope.dataProducto[i].producto_id == $scope.data.producto_id ) {
                      $scope.data.producto_desc = $scope.dataProducto[i].producto_desc;
                      break;
                    }
                  }
                  for (i = 0; i < $scope.dataProveedor.length; i++) {
                    if ( $scope.dataProveedor[i].proveedor_id == $scope.data.proveedor_id ) {
                      $scope.data.proveedor_desc = $scope.dataProveedor[i].proveedor_desc;
                      break;
                    }
                  }
                  for (i = 0; i < $scope.dataBodega.length; i++) {
                    if ( $scope.dataBodega[i].bodega_id == $scope.data.bodega_id ) {
                      $scope.data.bodega_desc = $scope.dataBodega[i].bodega_desc;
                      break;
                    }
                  }
                  var data = angular.copy($scope.data);
                  $scope.lista.datos.push(data);
                  $scope.gridOptions.data = $scope.lista.datos;
                  $scope.data.producto_id = null;
                  $scope.data.producto_desc = null;
                  $scope.data.cantidad = null;
                  $scope.data.fecha_vencimiento = null;
                  $scope.muestraImagen = 0;
                }
              }

              $scope.enviarLista = function () {
                if ($scope.lista.datos.length > 0) {
                  inventarioService.add( $scope.lista ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      toastr.success( res.message );
                      $state.go( '^.list' );
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                } else {
                  toastr.warning('Debe agregar al menos un producto');
                }
              }

              $scope.cargarDatos = function( producto_id, proveedor_id ) {
                if (producto_id != null && proveedor_id == null) {
                  inventarioService.get( 'inventario/producto/' + producto_id + '/proveedor/lista' ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      $scope.dataProveedor = res.data;
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                }
                if (producto_id == null && proveedor_id != null) {
                  inventarioService.get( 'inventario/proveedor/' + proveedor_id + '/producto/lista' ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      $scope.dataProducto = res.data;
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                }
                if (producto_id != null && proveedor_id != null) {
                  inventarioService.get( 'inventario/productoproveedor/' + producto_id + '/' + proveedor_id ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      $scope.data.existencia = res.data.existencia;
                      $scope.dataImg.urlImg = appSettings.urlBaseImg + res.data.imagen_url;
                      $scope.muestraImagen = 1;
                    } else {
                      toastr.error( res.message );
                      $scope.muestraImagen = 0;
                    }
                  }, function ( error ) {
                    $scope.mostrarImagen = 0;
                    toastr.error( error );
                  });
                }
              }
            }]
        })
        .state('index.inventario.edit', {
          url: '/:ingreso_inventario_id/edit',
          templateUrl: 'app/inventario/inventario.add.tpl.html',
          resolve: {
            inventario: ['inventarioService', '$stateParams',
              function ( inventarioService, $stateParams ){
                return inventarioService.get( $stateParams.ingreso_inventario_id );
              }],
            dataCategoria: ['categoriaService',
              function ( categoriaService ){
                return categoriaService.list();
              }]
          },

          controller: ['$scope', '$state', 'toastr', 'appSettings', 'Upload', 'inventarioService', 'inventario', 'dataCategoria',
            function (  $scope,   $state,   toastr, appSettings, Upload, inventarioService,   inventario,   dataCategoria) {
              $scope.dataImg = {};
              $scope.data = inventario.data;
              $scope.dataImg.urlImg = appSettings.urlBaseImg + inventario.data.imagen_url;
              $scope.dataCategoria = dataCategoria.data;
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'inventario_imagen_id', name: 'Correlativo' },
                { field: 'imagen_url', cellTemplate:"<img width=\"50px\" ng-src=\"http://chixot.com/pos/{{grid.getCellValue(row, col)}}\" lazy-src>"},
                { field:'descripcion', name: 'Descripcion' },
                { field:'estado_desc', name: 'Estado' },
                { name: 'OPCIONES', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.verImagen(row.entity)" title="Ver imagen"><i class="fa fa-file-image-o"></i></button><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.edit(row.entity)" title="Establecer como imagen principal"><i class="fa fa-check-square-o"></i></button><button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.delete(row.entity)" title="Eliminar"><i class="fa fa-remove"></i></button><button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.habilitar(row.entity)" title="Habilitar"><i class="fa fa-check"></i></button></span></div>' }
              ];
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  inventarioService.edit( $scope.data ) .then( function ( res ) {
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
              $scope.subir = function() {
                if ($scope.file) {
                  $scope.avance = 0;
                  Upload.upload({
                    url: 'upload.php',
                    method: 'POST',
                    file: $scope.file,
                    sendFieldsAs: 'form',
                    fields: {
                        inventario: [
                            { inventario_id: $scope.data.inventario_id, inventario_desc: $scope.data.inventario_desc }
                        ]
                    }
                  }).then(function (resp) {
                      if (resp.data.status == 'success') {
                        $scope.dataImg.urlImg = appSettings.urlBaseImg + resp.data.imagen_url;
                        $scope.data.imagen_url = resp.data.imagen_url;
                        toastr.success(resp.data.value);
                      } else {
                        toastr.error(resp.data.value)
                      }
                  }, function (resp) {
                      toastr.error('Error status: ' + resp.status);
                  }, function (evt) {
                      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                      $scope.avance = progressPercentage;
                  });
                } else {
                  toastr.error("Debe seleccionar un archivo")
                }
              }
            }]
        })
        .state('index.inventario.factura', {
          url: '/factura',
          templateUrl: 'app/inventario/factura.list.tpl.html',
          resolve: {

          },
          controller: ['$scope', 'toastr', 'utils', 'inventarioService', '$state',
            function (  $scope, toastr, utils, inventarioService, $state ) {
              $scope.obligatorio = false;
              $scope.data = {
                fechaIni : null,
                fechaFin : null,
                noFactura : null
              }
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'serie', name: 'Serie' },
                { field:'numero_factura', name: 'No. factura' },
                { field:'fecha_inicio', name: 'Fecha de emision',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate2(row.entity.fecha_inicio)  | date:grid.appScope.dateOptions.format}}</div>' },
                { field:'estado_desc', name: 'Estado' },
                { field:'fecha_ult_modif', name: 'Fecha de anulacion',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate2(row.entity.fecha_ult_modif)  | date:grid.appScope.dateOptions.format}}</div>' },
                { field:'usuario_desc', name: 'Usuario anula' },
                { name: 'OPCIONES', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.anularFactura(row.entity)" title="Anular registro">Anular</button></span></div>' }
              ];
              $scope.gridOptions.data = [];
              $scope.submitForm = function ( isValid ) {
                if (($scope.data.fechaIni == null || $scope.data.fechaFin == null
                    || $scope.data.fechaIni == "" || $scope.data.fechaFin == "")
                    && ($scope.data.serie == null || $scope.data.noFactura == null
                    || $scope.data.serie == "" || $scope.data.noFactura == "")) {
                  $scope.obligatorio = true;
                } else {
                  $scope.obligatorio = false;
                  isValid = true;
                }
                if ( isValid ) {
                  if ($scope.data.serie == null || $scope.data.noFactura == null || $scope.data.serie == "" || $scope.data.noFactura == "") {
                    $scope.data.noFactura = 0;
                  }
                  inventarioService.getData( 'inventario/factura/lista', $scope.data ).then( function ( res ) {
                    if ( res.status == "OK" ) {
                      $scope.gridOptions.data = res.data;
                    } else {
                      toastr.error( res.message );
                      $scope.gridOptions.data = [];
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                }
              }

              $scope.anularFactura = function ( row ) {
                if (row.estado != 1) {
                  toastr.error( 'La factura ya esta anulada' );
                } else {
                  swal({
                    title: "¿Está seguro que desea anular la factura?",
                    text: "",
                    showCancelButton: true,
                    confirmButtonClass: "btn-success",
                    confirmButtonText: "Confirmar",
                    cancelButtonClass: "btn-danger",
                    cancelButtonText: "Cancelar",
                    closeOnConfirm: true,
                  },
                  function () {
                    row.usuario_modifica_id = $scope.loginData.usuario_id;
                    inventarioService.anularFactura( row, row.factura_id ).then( function ( res ) {
                      if ( res.status == "OK" ) {
                        var index = $scope.gridOptions.data.indexOf(row);
                        $scope.gridOptions.data.splice( index , 1 );
                        toastr.success('Anulacion exitosa');
                      } else {
                        toastr.error( res.message );
                        $scope.gridOptions.data = [];
                      }
                    }, function ( error ) {
                      toastr.error( error );
                    });
                  });
                }
              }

            }
          ]
        })
    }
  ]
);
