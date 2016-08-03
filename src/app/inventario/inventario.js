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
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate(row.entity.fecha)  | date:grid.appScope.dateOptions.format}}</div>' },
                { field:'no_envio', name: 'No. envio' },
                { field:'fecha_vencimiento', name: 'Fecha vencimiento',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate(row.entity.fecha_vencimiento)  | date:grid.appScope.dateOptions.format}}</div>' },
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
                proveedor_id: null,
                cantidad : null,
                existencia : null,
                usuario_id : $scope.loginData.usuario_id
              };
              $scope.muestraImagen = 0;
              $scope.dataImg = { urlImg : null };
              $scope.dataProducto = dataProducto.data;
              $scope.dataProveedor = dataProveedor.data;
              $scope.dataBodega = dataBodega.data;
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  inventarioService.add( $scope.data ).then( function ( res ) {
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
    }
  ]
);
