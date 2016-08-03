angular.module('app.factura', [
  'ui.router',
  'toastr',
  'app.facturaService',
  'app.producto.service',
  'app.categoria.service'
])

.config(
  ['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('index.factura', {
          abstract: true,
          url: 'factura',
          template: '<div ui-view></div>',
          resolve: {

          },
          controller: ['$scope',
            function ($scope) {
              $scope.module = 'Factura';
              // function getTotalFactura
              $scope.getTotalFactura = function () {
                var grandTotal = 0;
                if ($scope.current.factura) {
                  for( var i = 0; i < $scope.current.factura.detalle.length; i++ ) {
                    if ( !isNaN( $scope.current.factura.detalle[i].total ) ) {
                      grandTotal += parseFloat( $scope.current.factura.detalle[i].total, 10 );
                    }
                  }
                }
                return grandTotal.toFixed(2);
              };

              $scope.getTotalPago = function() {
                var totalPayment = 0;
                for (var i = 0; i < $scope.current.factura.pagos.length; i++ ) {
                  totalPayment += parseFloat($scope.current.factura.pagos[i].monto, 10);
                }
                return parseFloat(totalPayment).toFixed(2);
              };

              $scope.getTotalPagoEfectivo = function() {
                var totalEfectivo = 0;
                for (var i = 0; i < $scope.current.factura.pagos.length; i++ ) {
                  if ($scope.current.factura.pagos[i].tipo_pago_id == 1) {
                    totalEfectivo += parseFloat($scope.current.factura.pagos[i].monto, 10);
                  }
                }
                return parseFloat(totalEfectivo).toFixed(2);
              };

              $scope.getTotalPagoCredito = function() {
                var totalCredito = 0;
                for (var i = 0; i < $scope.current.factura.pagos.length; i++ ) {
                  if ($scope.current.factura.pagos[i].tipo_pago_id == 2) {
                    totalCredito += parseFloat($scope.current.factura.pagos[i].monto, 10);
                  }
                }
                return parseFloat(totalCredito).toFixed(2);
              };
            }]
        })
        .state('index.factura.input', {
          url: '',
          templateUrl: 'app/factura/buscarnit.tpl.html',
          resolve: {

          },
          controller: ['$scope', 'toastr', 'utils', 'facturaService', 'focus', '$state',
            function (  $scope,   toastr,   utils, facturaService, focus, $state) {
              $scope.bndBuscar = '';
              $scope.buscarCliente = function(nit) {
                if (nit != null) {
                  var continuar = true;
                  nit = nit.toUpperCase();
                  /*if (nit != 'C/F') {
                    if (nit.length <= 5) {
                      continuar = false;
                      toastr.error('No es un nit válido, favor de revisar');
                      $scope.current.cliente = {};
                    }
                  }*/
                  if (continuar == true) {
                    if (nit.indexOf('/') > -1) {
                      nit = nit.replace('/', '$');
                    }
                    if ($scope.current.cliente.cliente_id == null || $scope.bndBuscar != nit) {
                      facturaService.buscarCliente( nit ) .then( function ( res ) {
                        if (res.status == 'OK') {
                          var item = res.data[0];
                          $scope.current.cliente = item;
                          var limite = parseFloat(item.limite_credito).toFixed(2);
                          var saldo = parseFloat(item.saldo).toFixed(2);
                          var disponible = limite - saldo;
                          if (disponible < 0) {
                            disponible = 0;
                          }
                          $scope.current.cliente.disponible = disponible;
                          $scope.bndBuscar = $scope.current.cliente.nit;
                        } else {
                          $scope.current.cliente = {};
                          toastr.error(res.message);
                          focus('nit');
                        }
                      }, function ( error ) {
                        toastr.error( error );
                      });
                    }
                  }
                }
              }

              $scope.agregarCliente = function() {
                $state.go('^.cliente');
              }

              $scope.setFocus = function() {
                focus('nit');
              }

              $scope.onKeyPress = function (keyEvent) {
                switch (keyEvent.which) {
                  case 65:
                    $state.go('^.cliente');
                    break;
                  case 97:
                    $state.go('^.cliente');
                    break;
                  case 66:
                    $state.go('^.buscacliente');
                    break;
                  case 98:
                    $state.go('^.buscacliente');
                    break;
                  default:
                  break;
                }
              }

              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  $state.go('^.add');
                }
              }
              focus('nit');
            }]
        })
        .state('index.factura.cliente', {
          url: '/cliente',
          templateUrl: 'app/factura/cliente.add.tpl.html',
          resolve: {
            dataTipoCliente: ['facturaService',
              function ( facturaService ){
                return facturaService.listaTipoCliente();
              }]
          },
          controller: ['$scope', 'toastr', 'utils', 'facturaService', 'focus', '$state', 'dataTipoCliente',
            function (  $scope, toastr, utils, facturaService, focus, $state, dataTipoCliente) {
              $scope.control = {
                mensaje : null
              };
              $scope.dataTipoCliente = dataTipoCliente.data;
              $scope.agregarCliente = function( isValid ) {
                if ( isValid ) {
                  var continuar = true;
                  var nit = $scope.cliente.nit.toUpperCase();
                  if (nit != 'C/F') {
                    if (nit.length <= 5) {
                      continuar = false;
                      toastr.error('No es un nit válido, favor de revisar');
                      $scope.control.mensaje = res.message;
                    }
                  }
                  if (continuar == true) {
                    facturaService.agregarCliente( $scope.cliente ).then( function ( res ) {
                      if (res.status == 'OK') {
                        $scope.current.cliente = $scope.cliente;
                        $state.go('^.input');
                      } else {
                        toastr.error( res.message );
                        $scope.control.mensaje = res.message;
                      }
                    }, function ( error ) {
                      toastr.error( error );
                    });
                  }
                }
              }

              $scope.setFocus = function() {
                focus('nit');
              }

              focus('nit');
            }
          ]
        })
        .state('index.factura.buscacliente', {
          url: '/buscacliente',
          templateUrl: 'app/factura/buscacliente.tpl.html',
          resolve: {

          },
          controller: ['$scope', 'toastr', 'utils', 'facturaService', 'focus', '$state',
            function (  $scope, toastr, utils, facturaService, focus, $state) {
              $scope.current.buscarId = 0;
              $scope.datos = [];
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.columnDefs = [
                { field:'cliente_id', name: 'Identificador' },
                { field:'cliente_desc', name: 'Nombre' },
                { field:'nit', name: 'NIT' },
                { field:'direccion', name: 'Dirección' },
                { field:'tipo_cliente_desc', name: 'Tipo' }
              ];
              $scope.gridOptions.data = [];
              $scope.buscarCliente = function(nombre) {
                var tmpMensaje = 'Debe indicar al menos un nombre y un apellido';
                var continuar = false;
                if (nombre) {
                  /*var partes = nombre.split(' ');
                  if (partes.length > 1) {*/
                    continuar = true;
                  //}
                }
                if (continuar) {
                  facturaService.buscarNombre( nombre ) .then( function ( res ) {
                    if (res.status == 'OK') {
                      $scope.datos = res.data;
                      $scope.gridOptions.data = $scope.datos;
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                } else {
                  toastr.error( tmpMensaje );
                }
              }

              $scope.submitForm = function( isValid ) {
                if ( isValid ) {
                  if ($scope.data.cliente_id) {
                    if (isNumeric($scope.data.cliente_id)) {
                      if ($scope.data.cliente_id > 0) {
                        facturaService.buscarClienteId( $scope.data.cliente_id ) .then( function ( res ) {
                          if (res.status == 'OK') {
                            $scope.current.cliente = res.data[0];
                            var disponible = parseFloat(parseFloat($scope.current.cliente.limite_credito) - parseFloat($scope.current.cliente.saldo)).toFixed(2);
                            if (disponible < 0) {
                              disponible = 0;
                            }
                            $scope.current.cliente.disponible = disponible;
                            toastr.warning('El crédito disponible para el cliente es: ' + $scope.current.cliente.disponible);
                            $state.go('^.add');
                          } else {
                            toastr.error( res.message );
                            focus('focus');
                          }
                        }, function ( error ) {
                          toastr.error( error );
                        });
                      } else {
                        toastr.error( 'Debe indicar un identificador válido' );
                      }
                    } else {
                      toastr.error( 'Debe indicar un identificador válido' );
                    }
                  } else {
                    toastr.error( 'Debe indicar un identificador válido' );
                  }
                }
              }

              var isNumeric = function (value) {
                return !isNaN(parseFloat(value));
              };

              $scope.setFocus = function() {
                focus('nombre');
              }

              focus('nombre');
            }
          ]
        })
        .state('index.factura.buscaproducto', {
          url: '/buscaproducto',
          templateUrl: 'app/factura/buscaproducto.tpl.html',
          resolve: {
            dataCategoria: ['categoriaService',
              function ( categoriaService ){
                return categoriaService.list();
              }]
          },
          controller: ['$scope', 'toastr', 'utils', 'facturaService', 'focus', '$state', 'ngDialog', 'productoService', 'dataCategoria',
            function (  $scope, toastr, utils, facturaService, focus, $state, ngDialog, productoService, dataCategoria) {
              if (!$scope.current.cliente) {
                $state.go('^.input');
              };
              $scope.dataCategoria = dataCategoria.data;
              $scope.current.buscarId = 0;
              $scope.datos = [];
              $scope.dataImg = {};
              $scope.gridOptions = angular.copy( $scope.gridOptionsSingleSelection );
              $scope.gridOptions.rowHeight = 70;
              $scope.gridOptions.columnDefs = [
                { field:'producto_id', name: 'Identificador' },
                { field:'producto_desc', name: 'Nombre' },
                { field:'precio', name: 'Precio' },
                { field:'existencia', name: 'Existencia' },
                { field: 'imagen_url', name: 'Imagen', enableFiltering: false,
                  cellTemplate:"<img width=\"70px\" ng-src=\"{{grid.appScope.getUrlImg(row.entity.imagen_url)}}\" lazy-src>", width: "10%"},
                { name: 'Detalles', enableFiltering: false,
                  cellTemplate: '<div class="ui-grid-cell-contents text-center col-options"><span><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.detalle(row.entity)" title="Ver detalles">Detalles</button></span></div>'}
              ];
              $scope.gridOptions.data = [];

              $scope.getTableHeight = function() {
                 var rowHeight = 110; // your row height
                 var headerHeight = 70; // your header height
                 return {
                    height: ($scope.gridOptions.data.length * rowHeight + headerHeight) + "px"
                 };
              };

              $scope.detalle = function ( row ) {
                productoService.get( row.producto_id ) .then( function ( res ) {
                  if (res.status == 'OK') {
                    $scope.dataProducto = res.data;
                    $scope.dataImg.urlImg = appSettings.urlBaseImg + res.data.imagen_url;
                    ngDialog.open({
                      template: 'app/factura/producto.detalle.tpl.html',
                      className: 'ngdialog-theme-default',
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

              $scope.cerrarVentana = function () {
                ngDialog.close();
              }

              $scope.buscarProducto = function(nombre) {
                if (nombre && nombre.length > 3) {
                  facturaService.buscarNombreProducto( nombre, $scope.current.cliente.tipo_cliente_id ) .then( function ( res ) {
                    if (res.status == 'OK') {
                      $scope.datos = res.data;
                      $scope.gridOptions.data = $scope.datos;
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                } else {
                  toastr.error( 'Debe indicar un filtro mayor a 3 caracteres' );
                  focus('nombre');
                }
              }

              $scope.getUrlImg = function(value) {
                return appSettings.urlBaseImg + value;
              }

              $scope.submitForm = function( isValid ) {
                if ( isValid ) {
                  if ($scope.data.producto_id) {
                    if (isNumeric($scope.data.producto_id)) {
                      if ($scope.data.producto_id > 0) {
                          $scope.current.buscarId = $scope.data.producto_id;
                          $state.go('^.add');
                      } else {
                        toastr.error( 'Debe indicar un identificador válido' );
                      }
                    } else {
                      toastr.error( 'Debe indicar un identificador válido' );
                    }
                  } else {
                    toastr.error( 'Debe indicar un identificador válido' );
                  }
                }
              }

              var isNumeric = function (value) {
                return !isNaN(parseFloat(value));
              };

              $scope.setFocus = function() {
                focus('nombre');
              }

              focus('nombre');
            }
          ]
        })
        .state('index.factura.add', {
          url: '/crear',
          templateUrl: 'app/factura/factura.tpl.html',
          resolve: {
          },
          controller: ['$scope', 'toastr', 'utils', 'facturaService', 'focus', '$state', 'ngDialog',
            function (  $scope, toastr, utils, facturaService, focus, $state, ngDialog) {
              if (!$scope.current.cliente) {
                $state.go('^.input');
              };
              $scope.control = {
                cantidad : 1,
                tmpCantidad : 1,
                correlativo : 0
              };

              $scope.control.cantidad = 1;
              $scope.current.factura.fecha = new Date();

              if ($scope.current.cliente) {
                $scope.current.factura.nit = $scope.current.cliente.nit;
                $scope.current.factura.nombre = $scope.current.cliente.cliente_desc;
                $scope.current.factura.direccion = $scope.current.cliente.direccion;
                $scope.current.factura.cliente_id = $scope.current.cliente.cliente_id;
              }

              $scope.buscarProducto = function (codigo) {
                if ($scope.producto) {
                  if ($scope.producto.codigoProducto != null && isNumeric($scope.producto.codigoProducto)) {
                    if (codigo > 0) {
                      facturaService.buscarProducto( codigo, $scope.current.cliente.tipo_cliente_id ) .then( function ( res ) {
                        $scope.producto.codigoProducto = null;
                        if (res.status == 'OK') {
                          if (!$scope.control.cantidad || $scope.control.cantidad <= 0) {
                            $scope.control.cantidad = 1;
                          }
                          var reserva = 0;
                          for( var i = 0; i < $scope.current.factura.detalle.length; i++ ) {
                            if ( codigo == $scope.current.factura.detalle[i].producto_id ) {
                              reserva++;
                            }
                          }
                          var item = res.data[0];
                          var existencia = item.existencia - reserva;
                          if (existencia >= $scope.control.cantidad) {
                            item.cantidad = $scope.control.cantidad;
                            if ($scope.current.factura) {
                              $scope.control.correlativo = $scope.current.factura.detalle.length + 1;
                            } else {
                              $scope.control.correlativo = 1;
                            }
                            item.correlativo = $scope.control.correlativo;
                            $scope.current.factura.detalle.push( item );
                          } else {
                            toastr.error('La cantidad disponible de existencias [' + existencia +'] del producto es menor a la cantidad solicitada');
                          }
                        } else {
                          toastr.error(res.message);
                        }
                        $scope.control.cantidad = 1;
                        $scope.control.tmpCantidad = null;
                        $scope.current.buscarId = 0;
                        $scope.current.cantidad = 1;
                        focus('codigoProducto');
                      }, function ( error ) {
                        toastr.error( error );
                      });
                    } else {
                      $scope.producto.codigoProducto = null;
                      focus('codigoProducto');
                    }
                  }
                }
              };

              $scope.borrarDetalle = function (item) {
                $scope.current.factura.detalle.splice( $scope.current.factura.detalle.indexOf( item ), 1 );
              }

              $scope.setFocus = function() {
                focus('codigoProducto');
              };

              $scope.getTotal = function ( item ) {
                var total = item.cantidad * item.precio;
                return ( isNaN( total ) ? 0 :
                  ( total ) - ( total * ( isNaN ( item.descuento ) ? 0 : item.descuento / 100 ) ) ).toFixed(2);
              };

              $scope.onKeyPress = function (keyEvent) {
                console.log(keyEvent.which);
                switch (keyEvent.which) {
                  case 13:
                    if ($scope.producto != null) {
                      $scope.buscarProducto($scope.producto.codigoProducto);
                    }
                    break;
                  case 67:
                        $scope.abrirVentana();
                      break;
                  case 66:
                        $state.go('^.buscaproducto');
                      break;
                  case 65:
                    pregutarAnular();
                    break;
                  case 69: //envio
                    if ($scope.current.factura.detalle.length > 0) {
                      $scope.generarProformaOEnvio(2);
                    }
                    break;
                  case 70: //proforma
                    if ($scope.current.factura.detalle.length > 0) {
                      $scope.generarProformaOEnvio(1);
                    }
                    break;
                  case 80:
                      if ($scope.current.factura.detalle.length > 0) {
                        $state.go('^.pagar');
                      }
                      break;
                  case 98:
                      $state.go('^.buscaproducto');
                    break;
                  case 99:
                      $scope.abrirVentana();
                    break;
                  case 97:
                    pregutarAnular();
                    break;
                  case 101: //envio
                    if ($scope.current.factura.detalle.length > 0) {
                      $scope.generarProformaOEnvio(2);
                    }
                    break;
                  case 102: //proforma
                    if ($scope.current.factura.detalle.length > 0) {
                      $scope.generarProformaOEnvio(1);
                    }
                    break;
                  case 112:
                    if ($scope.current.factura.detalle.length > 0) {
                      $state.go('^.pagar');
                    }
                    break;
                  default:
                    break;
                }
              };

              var pregutarAnular = function() {
                swal({
                  title: "¿Está seguro que desea eliminar?",
                  text: "",
                  showCancelButton: true,
                  confirmButtonClass: "btn-success",
                  confirmButtonText: "Confirmar",
                  cancelButtonClass: "btn-danger",
                  cancelButtonText: "Cancelar",
                  closeOnConfirm: true,
                },
                function () {
                  $scope.current.cliente = null;
                  $scope.current.factura = {
                    tipo : 0,
                    usuario_id : $scope.loginData.usuario_id,
                    caja_id: $scope.loginData.caja_id,
                    serie : null,
                    numero : null,
                    nit : null,
                    nombre : null,
                    direccion : null,
                    cliente_id : null,
                    fecha : null,
                    total : null,
                    totalCredito : null,
                    totalIva : null,
                    totalSinIva : null,
                    detalle : [],
                    pagos : []
                  };
                  $state.go('^.input');
                });
              }

              $scope.abrirVentana = function () {
                $scope.control.tmpCantidad = null;
                ngDialog.open({
                  template: 'app/factura/factura.cantidad.tpl.html',
                  className: 'ngdialog-theme-default',
                  closeByDocument: false,
                  closeByEscape: true,
                  scope: $scope
                });
              }

              $scope.cerrarVentana = function () {
                ngDialog.close();
                if ($scope.producto) {
                  $scope.producto.codigoProducto = null;
                }
              }

              $scope.guardarCantidad = function () {
                ngDialog.close();
                if (!$scope.control.tmpCantidad || $scope.control.tmpCantidad <= 0) {
                  $scope.control.tmpCantidad = 1;
                }
                $scope.control.cantidad = $scope.control.tmpCantidad;
                $scope.current.cantidad = $scope.control.tmpCantidad;
                $scope.producto.codigoProducto = null;
              }

              $scope.cambiarCantidad = function () {
                $scope.abrirVentana();
              }

              $scope.pagarFactura = function() {
                $state.go('^.pagar');
              }

              $scope.anularFactura = function () {
                pregutarAnular();
              }


              $scope.generarProformaOEnvio = function( tipo ) {
                var mensaje = "";
                if (tipo == 1) {
                  mensaje = "¿Está seguro de generar la proforma?";
                } else {
                  mensaje = "¿Está seguro de generar el envio?";
                }
                swal({
                  title: mensaje,
                  text: "",
                  showCancelButton: true,
                  confirmButtonClass: "btn-success",
                  confirmButtonText: "Confirmar",
                  cancelButtonClass: "btn-danger",
                  cancelButtonText: "Cancelar",
                  closeOnConfirm: true,
                },
                function () {
                  $scope.current.factura.tipo = tipo;
                  facturaService.addProforma( $scope.current.factura ).then( function ( res ) {
                    if (res.status == 'OK') {
                      var proformaId = res.data;
                      toastr.success( res.message );
                      $scope.current.factura = {
                        tipo: 0,
                        usuario_id : $scope.loginData.usuario_id,
                        caja_id: $scope.loginData.caja_id,
                        serie : null,
                        numero : null,
                        nit : null,
                        nombre : null,
                        direccion : null,
                        cliente_id : null,
                        fecha : null,
                        total : null,
                        totalCredito : null,
                        totalIva : null,
                        totalSinIva : null,
                        detalle : [],
                        pagos : []
                      };
                      $scope.current.cliente = null;
                      $state.go('^.proforma', { proformaId: proformaId });
                    } else {
                      toastr.error( res.message );
                    }
                  }, function ( error ) {
                    toastr.error( error );
                  });
                });
              }

              var isNumeric = function (value) {
                return !isNaN(parseFloat(value));
              };

              focus('codigoProducto');

              if ( $scope.current.buscarId > 0 ) {
                $scope.producto = {codigoProducto: 0};
                $scope.producto.codigoProducto = $scope.current.buscarId;
                if ($scope.current.cantidad > 1) {
                  $scope.control.cantidad = $scope.current.cantidad;
                }
                $scope.buscarProducto($scope.current.buscarId);
              }
            }]
        })
        .state('index.factura.pagar', {
          url: '/pagar',
          templateUrl: 'app/factura/factura.pago.tpl.html',
          resolve: {
            dataTipoPago: ['facturaService',
              function ( facturaService ){
                return facturaService.listaTipoPago();
              }]
          },
          controller: ['$scope', '$state', 'toastr', 'utils', 'dataTipoPago', 'focus', 'facturaService',
            function (  $scope,   $state,   toastr,   utils, dataTipoPago, focus, facturaService) {
              if (!$scope.current.cliente) {
                $state.go('^.input');
              };
              $scope.dataTipoPago = dataTipoPago.data;
              $scope.control = {
                total: 0,
                totalDeuda: 0,
                pagado: 0,
                vuelto: 0
              }

              $scope.pago = {
                correlativo: null,
                monto: 0.00,
                tipo_pago_id: null,
                tipoPago: ''
              };

              var calcularPagos = function() {
                var tmpCantidad = 0.00;
                var tmpTotal = $scope.getTotalFactura();
                var tmpIva = parseFloat(tmpTotal / 1.12).toFixed(2);
                $scope.current.factura.total = tmpTotal;
                $scope.current.factura.totalCredito = $scope.getTotalPagoCredito();
                $scope.current.factura.totalIva = tmpIva;
                $scope.current.factura.totalSinIva = parseFloat(tmpTotal - tmpIva).toFixed(2);
                $scope.control.total = tmpTotal;
                var tmpPagado = $scope.getTotalPago();
                $scope.control.pagado = tmpPagado;
                var tmpEfectivo = $scope.getTotalPagoEfectivo();
                if (tmpPagado == tmpEfectivo) {
                  tmpCantidad = tmpPagado - tmpTotal;
                  if (tmpCantidad < 0) {
                    tmpCantidad = 0;
                  }
                } else {
                  if (tmpEfectivo > 0) {
                    tmpCantidad = tmpPagado - tmpEfectivo;
                    tmpCantidad = tmpTotal - tmpCantidad;
                    tmpCantidad = tmpEfectivo - tmpCantidad;
                    if (tmpCantidad < 0) {
                      tmpCantidad = 0;
                    }
                  } else {
                    tmpCantidad = 0;
                  }
                }
                $scope.control.vuelto = tmpCantidad.toFixed(2);
                var tmpDeuda = tmpTotal - tmpPagado;
                if (tmpDeuda < 0) {
                  tmpDeuda = 0;
                }
                $scope.control.totalDeuda = tmpDeuda.toFixed(2);
              }

              $scope.agregarMonto = function () {
                if ($scope.pago.monto > 0) {
                  if ($scope.control.totalDeuda > 0) {
                    $scope.pago.correlativo = $scope.current.factura.pagos.length + 1;
                    var monto = parseFloat($scope.pago.monto).toFixed(2);
                    $scope.pago.monto = monto;
                    var encontrado = false;
                    var i = 0;
                    for (i = 0; i < $scope.current.factura.pagos.length; i++) {
                      if ($scope.pago.tipo_pago_id == $scope.current.factura.pagos[i].tipo_pago_id) {
                        encontrado = true;
                        break;
                      }
                    }
                    if ($scope.pago.tipo_pago_id == 2) { //credit
                      if (monto > parseFloat($scope.control.totalDeuda)) {
                        toastr.error('El pago al crédito no puede ser mayor al total de la factura');
                      } else {
                        var disponible = $scope.current.cliente.disponible;
                        console.log(disponible + ' ' + monto);
                        if (parseFloat(disponible) >= parseFloat(monto)) {
                          if (encontrado) {
                            var tmpMontoAct = parseFloat($scope.current.factura.pagos[i].monto);
                            $scope.current.factura.pagos[i].monto = parseFloat(tmpMontoAct) + parseFloat(monto);
                          } else {
                            for (i = 0; i < dataTipoPago.data.length; i++) {
                              if ($scope.pago.tipo_pago_id == dataTipoPago.data[i].tipo_pago_id) {
                                $scope.pago.tipoPago = dataTipoPago.data[i].tipo_pago_desc;
                                break;
                              }
                            }
                            $scope.current.factura.pagos.push($scope.pago);
                          }
                          disponible = disponible - monto;
                          $scope.current.cliente.disponible = disponible;
                          calcularPagos();
                        } else {
                          toastr.error('El crédito disponible para el cliente es: Q. ' + disponible);
                        }
                      }
                    } else {
                      if (encontrado) {
                        var tmpMontoAct = parseFloat($scope.current.factura.pagos[i].monto);
                        $scope.current.factura.pagos[i].monto = parseFloat(tmpMontoAct) + parseFloat(monto);
                      } else {
                        for (i = 0; i < dataTipoPago.data.length; i++) {
                          if ($scope.pago.tipo_pago_id == dataTipoPago.data[i].tipo_pago_id) {
                            $scope.pago.tipoPago = dataTipoPago.data[i].tipo_pago_desc;
                            break;
                          }
                        }
                        $scope.current.factura.pagos.push($scope.pago);
                      }
                      calcularPagos();
                    }
                  } else {
                    toastr.error('La deuda está justificada, no se debe agregar más pagos');
                  }
                  $scope.pago = {};
                  focus('focus');
                }
              }

              $scope.borrarPago = function (item) {
                $scope.current.factura.pagos.splice( $scope.current.factura.pagos.indexOf( item ), 1 );
                if (item.tipo_pago_id == 2) {
                  $scope.current.cliente.disponible = $scope.current.cliente.disponible + item.monto;
                }
                calcularPagos();
                focus('focus');
              }

              $scope.submitForm = function ( isValid ) {
                if ( isValid ) {
                  $scope.finalizarFactura();
                }
              }

              $scope.finalizarFactura = function () {
                if ($scope.control.totalDeuda <= 0) {
                  swal({
                    title: "¿Está seguro de finalizar la factura?",
                    text: "",
                    showCancelButton: true,
                    confirmButtonClass: "btn-success",
                    confirmButtonText: "Confirmar",
                    cancelButtonClass: "btn-danger",
                    cancelButtonText: "Cancelar",
                    closeOnConfirm: true,
                  },
                  function () {
                    facturaService.add( $scope.current.factura ).then( function ( res ) {
                      if (res.status == 'OK') {
                        var facturaId = res.data;
                        toastr.success( res.message );
                        $scope.current.factura = {
                          tipo : 0,
                          usuario_id : $scope.loginData.usuario_id,
                          caja_id: $scope.loginData.caja_id,
                          serie : null,
                          numero : null,
                          nit : null,
                          nombre : null,
                          direccion : null,
                          cliente_id : null,
                          fecha : null,
                          total : null,
                          totalCredito : null,
                          totalIva : null,
                          totalSinIva : null,
                          detalle : [],
                          pagos : []
                        };
                        $scope.current.cliente = null;
                        $state.go('^.recibo', { facturaId: facturaId });
                      } else {
                        toastr.error( res.message );
                      }
                    }, function ( error ) {
                      toastr.error( error );
                    });
                  });
                } else {
                  toastr.error('La deuda de la factura no puede ser mayor a cero');
                }
              };

              $scope.setFocus = function () {
                focus('focus');
              }

              $scope.onKeyPress = function (keyEvent) {
                switch (keyEvent.which) {
                  case 13:
                    $scope.finalizarFactura();
                    break;
                  case 70:
                      $scope.finalizarFactura();
                      break;
                  case 102:
                      $scope.finalizarFactura();
                      break;
                  default:
                    break;
                }
              };

              calcularPagos();
              focus('focus');
            }]
        })
        .state('index.factura.recibo', {
          url: '/:facturaId/recibo',
          templateUrl: 'app/factura/factura.recibo.tpl.html',
          resolve: {
            dataFactura: ['facturaService', '$stateParams',
              function ( facturaService, $stateParams ){
                return facturaService.get( $stateParams.facturaId );
              }]
          },
          controller: ['$scope', 'toastr', 'utils', 'facturaService', 'focus', '$state', 'dataFactura',
            function (  $scope, toastr, utils, facturaService, focus, $state, dataFactura) {
              $scope.factura = dataFactura.data.factura;
              $scope.detalle = dataFactura.data.detalle;
              $scope.pagos = dataFactura.data.pagos;
              var tmpPagado = 0.00;
              var tmpEfectivo = 0.00;
              var tmpCredito = 0.00;
              for (var i = 0; i < $scope.pagos.length; i++ ) {
                //tmpPagado += parseFloat($scope.pagos[i].monto, 10);
                if ($scope.pagos[i].tipo_pago_id == 1) {
                  tmpEfectivo += parseFloat($scope.pagos[i].monto, 10);
                }
                if ($scope.pagos[i].tipo_pago_id == 2) {
                  tmpCredito += parseFloat($scope.pagos[i].monto, 10);
                }
              }

              tmpPagado = parseFloat($scope.factura.total) - tmpCredito;
              var tmpVuelto = parseFloat(tmpEfectivo - tmpPagado).toFixed(2);
              if (tmpVuelto <= 0) {
                tmpVuelto = 0.00;
              }
              $scope.vuelto = tmpVuelto;
              $scope.onKeyPress = function (keyEvent) {
                switch (keyEvent.which) {
                  case 73:
                      $scope.imprimirRecibo();
                      break;
                  case 105:
                      $scope.imprimirRecibo();
                      break;
                  case 83:
                      $state.go('^.input');
                      break;
                  case 115:
                      $state.go('^.input');
                      break;
                  default:
                    break;
                }
              };

              $scope.imprimirRecibo = function() {
                utils.openWindow( '#receipt', $scope, 'Recibo' );
              };
              focus('focus');
            }
          ]
        })
        .state('index.factura.proforma', {
          url: '/:proformaId/proforma',
          templateUrl: 'app/factura/factura.proforma.tpl.html',
          resolve: {
            dataProforma: ['facturaService', '$stateParams',
              function ( facturaService, $stateParams ){
                return facturaService.getProforma( $stateParams.proformaId );
              }]
          },
          controller: ['$scope', 'toastr', 'utils', 'facturaService', 'focus', '$state', 'dataProforma',
            function (  $scope, toastr, utils, facturaService, focus, $state, dataProforma) {
              $scope.factura = dataProforma.data.factura;
              $scope.detalle = dataProforma.data.detalle;
              $scope.onKeyPress = function (keyEvent) {
                switch (keyEvent.which) {
                  case 73:
                      $scope.imprimirRecibo();
                      break;
                  case 105:
                      $scope.imprimirRecibo();
                      break;
                  case 83:
                      $state.go('^.input');
                      break;
                  case 115:
                      $state.go('^.input');
                      break;
                  default:
                    break;
                }
              };

              $scope.imprimirRecibo = function() {
                utils.openWindow( '#receipt', $scope, 'Proforma' );
              };
              focus('focus');
            }
          ]
        })
    }
  ]
);
