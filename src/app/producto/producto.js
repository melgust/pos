angular.module('app.producto', [
  'ui.router',
  'toastr',
  'app.producto.service',
  'app.categoria.service'
])

.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        .state('index.producto', {

          abstract: true,

          url: 'producto',

          template: '<div ui-view></div>',

          resolve: {
          },

          controller: ['$scope', 'toastr', 'appSettings',
            function (  $scope, toastr, appSettings) {
              $scope.module = 'Producto';
            }
          ]
        })
        .state('index.producto.list', {
          url: '',
          templateUrl: 'app/producto/producto.list.tpl.html',
          resolve: {
            producto: ['productoService',
              function ( productoService ){
                return productoService.list();
              }]
          },

          controller: ['$scope', '$state', 'producto',
            function (  $scope,   $state,   producto) {

              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.rowHeight = 70;
              $scope.gridOptions.columnDefs = [
                { field:'producto_desc', name: 'Producto' },
                { field:'fecha_registro', name: 'Fecha Registro',
                  cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.showDate(row.entity.fecha_registro)  | date:grid.appScope.dateOptions.format}}</div>' },
                { field:'existencia', name: 'Existencia' },
                { field: 'imagen_url', name: 'Imagen', enableFiltering: false,
                  cellTemplate:"<img width=\"70px\" ng-src=\"{{grid.appScope.getUrlImg(row.entity.imagen_url)}}\" lazy-src>", width: "10%"}
              ];
              $scope.getUrlImg = function(value) {
                return appSettings.urlBaseImg + value;
              }
              $scope.gridOptions.data = producto.data;

              $scope.editRow = function ( row ) {
                $state.go('^.edit',{ producto_id: row.producto_id });
              }

            }]

        })
        .state('index.producto.add', {

          url: '/add',

          templateUrl: 'app/producto/producto.add.tpl.html',

          resolve: {
            dataCategoria: ['categoriaService',
              function ( categoriaService ){
                return categoriaService.list();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'appSettings', 'Upload', 'productoService', 'dataCategoria',
            function ($scope, $state, toastr, appSettings, Upload, productoService,   dataCategoria) {
              $scope.data = {
                producto_id : null,
                producto_desc: null,
                existencia: 0,
                cantidad_minima : 1,
                categoria_id : null,
                imagen_url : null
              };
              $scope.dataImg = {};
              $scope.mostrarImagenes = 0;
              $scope.dataCategoria = dataCategoria.data;
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'producto_imagen_id', name: 'Correlativo' },
                { field: 'imagen_url', cellTemplate:"<img width=\"50px\" ng-src=\"http://chixot.com/pos/{{grid.getCellValue(row, col)}}\" lazy-src>"},
                { field:'descripcion', name: 'Descripcion' },
                { field:'estado_desc', name: 'Estado' },
                { name: 'OPCIONES', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.verImagen(row.entity)" title="Ver imagen"><i class="fa fa-file-image-o"></i></button><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.edit(row.entity)" title="Establecer como imagen principal"><i class="fa fa-check-square-o"></i></button><button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.delete(row.entity)" title="Eliminar"><i class="fa fa-remove"></i></button><button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.habilitar(row.entity)" title="Habilitar"><i class="fa fa-check"></i></button></span></div>' }
              ];
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  productoService.add( $scope.data ).then( function ( res ) {
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
                        producto: [
                            { producto_id: $scope.data.producto_id, producto_desc: $scope.data.producto_desc }
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
        .state('index.producto.edit', {
          url: '/:producto_id/edit',
          templateUrl: 'app/producto/producto.add.tpl.html',
          resolve: {
            producto: ['productoService', '$stateParams',
              function ( productoService, $stateParams ){
                return productoService.get( $stateParams.producto_id );
              }],
            dataCategoria: ['categoriaService',
              function ( categoriaService ){
                return categoriaService.list();
              }]
          },

          controller: ['$scope', '$state', 'toastr', 'appSettings', 'Upload', 'productoService', 'producto', 'dataCategoria',
            function (  $scope,   $state,   toastr, appSettings, Upload, productoService,   producto,   dataCategoria) {
              $scope.dataImg = {};
              $scope.data = producto.data;
              $scope.dataImg.urlImg = appSettings.urlBaseImg + producto.data.imagen_url;
              $scope.dataCategoria = dataCategoria.data;
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'producto_imagen_id', name: 'Correlativo' },
                { field: 'imagen_url', cellTemplate:"<img width=\"50px\" ng-src=\"http://chixot.com/pos/{{grid.getCellValue(row, col)}}\" lazy-src>"},
                { field:'descripcion', name: 'Descripcion' },
                { field:'estado_desc', name: 'Estado' },
                { name: 'OPCIONES', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.verImagen(row.entity)" title="Ver imagen"><i class="fa fa-file-image-o"></i></button><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.edit(row.entity)" title="Establecer como imagen principal"><i class="fa fa-check-square-o"></i></button><button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.delete(row.entity)" title="Eliminar"><i class="fa fa-remove"></i></button><button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.habilitar(row.entity)" title="Habilitar"><i class="fa fa-check"></i></button></span></div>' }
              ];
              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  productoService.edit( $scope.data ) .then( function ( res ) {
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
                        producto: [
                            { producto_id: $scope.data.producto_id, producto_desc: $scope.data.producto_desc }
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
