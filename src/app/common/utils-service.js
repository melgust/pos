angular.module('app.utilsService', [

])

.factory('utils', ['$filter', '$timeout', function ($filter, $timeout) {
  return {
    findById: function (a, id) {
      if ( typeof a !== "undefined" ) {
        for (var i = 0; i < a.length; i++) {
          if (a[i].id == id) return a[i];
        }
      }
      return null;
    },

    findFieldById: function (a, field, id) {
      var obj = this.findById(a,id);
      return obj !== null ? obj[field] : null;
    },

    findByField: function (a, field, value) {
      for (var i = 0; i < a.length; i++) {
        if (a[i][field] == value) return a[i];
      }
      return null;
    },

    filterByField: function (a, field, value) {
      var newArray = [];
      if ( typeof a !== "undefined" ) {
        for (var i = 0; i < a.length; i++) {
          if (a[i][field] == value) newArray.push(a[i]);
        }
      }
      return newArray;
    },

    existInArray: function (a, field, value) {
      if ( typeof a !== "undefined" ) {
        for (var i = a.length - 1; i >= 0; i--) {
          if ( a[i][field] == value) {
            return true;
          }
        }
      }
      return false;
    },

    compareAndDeleteRepeatedItems: function(a1, a2, field) {
      var newArray = [];
      if ( typeof a1 !== "undefined" && typeof a2 !== "undefined" ) {
        for (var i = 0; i < a1.length; i++) {
          if ( !this.existInArray( a2, field, a1[i][field]) ) {
            newArray.push( a1[i] );
          }
        }
      }
      return newArray;
    },

    xml2json: function (a) {

      try {
        var result = a.replace("<?xml version=\"1.0\" encoding=\"utf-8\"?>\r","").replace("<string xmlns=\"http://tempuri.org/\">", "").replace("</string>","");
        return ( result === '' ) ? [] : JSON.parse( result );
      } catch ( error ) {
        return undefined;
      }
    },

    // Util for returning a random key from a collection that also isn't the current key
    newRandomKey: function (coll, key, currentKey) {
      var randKey;
      do {
        randKey = coll[Math.floor(coll.length * Math.random())][key];
      } while (randKey == currentKey);
      return randKey;
    },

    parseValue: function( str, fixed ) {
      var value = parseFloat( str, 10 );
      return isNaN( value ) ? 0 : parseFloat( value.toFixed( fixed ), 10 );
    },
    /*
      Funcion que abre una nueva ventana con el cotenido de una plantilla
      Esta funcion compila el html de la plantilla a html puro, es decir si tiene ng-repeat o cualquier directiva angular aqui se compila de otra forma se mostraria tal cual aparece el html
      Parametros:
      html: puede ser la URL de una plantilla o un selector JQuery .class o #id
      scope: El $scope del controlador, util para la compilacion
      title: El titulo de la ventana
    */
    openWindow: function ( html, scope, title ) {
      var markup = '<!DOCTYPE HTML>' +
        '<html>' +
          '<head>' +
            '<title>' + title + '</title></head>' +
            '<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css">' +
          '<body>';

      var element = null;

      try {
        element = angular.element( html );
      } catch ( error ) {
        element = $compile( '<div>' + $templateCache.get( html ) + '</div>' )(scope);
      }

      $timeout(function(){
        markup += '<div class="container">' + element.html() + '</div>';
        markup += "</body></html>";
        var newwindow = window.open("", title, "resizable,scrollbars,status");
        newwindow.document.write( markup );
        newwindow.document.close();
        $timeout(function(){
          newwindow.print();
          // newwindow.close();
        }, 4);
      }, 0);
    },

    generarFactura : function ( data, textoLetras, tipo ) {
      var nombreSalida = 'documento';
      if (tipo == 1) {
        nombreSalida = 'Factura ' + data.factura.serie + ' ' + data.factura.numero_factura + ' ' + data.factura.nit + '.pdf';
      } else {
        nombreSalida = 'Proforma ' + data.factura.numero_proforma + ' ' + data.factura.nit + '.pdf';
      }
      var formatNumber = {
        separador: ",", // separador para los miles
        sepDecimal: '.', // separador para los decimales
        formatear:function (num) {
          num +='';
          var splitStr = num.split('.');
          var splitLeft = splitStr[0];
          var splitRight = splitStr.length > 1 ? this.sepDecimal + splitStr[1] : '';
          var regx = /(\d+)(\d{3})/;
          while (regx.test(splitLeft)) {
            splitLeft = splitLeft.replace(regx, '$1' + this.separador + '$2');
          }
          return this.simbol + splitLeft  +splitRight;
        },
        new : function(num, simbol) {
          this.simbol = simbol ||'';
          return this.formatear(num);
        }
      };
      //13.5 cm ancho y 19.5 de alto
      var dataDetalle = data.detalle;
      var detalle = [];
      for (var i = 0; i < dataDetalle.length; i++) {
        var item = {
          columns : [
            { width: 40, text : dataDetalle[i].cantidad, style: 'izquierda' },
            { width: 145, text : dataDetalle[i].producto_desc, style: 'izquierda' },
            { width: 70, text : formatNumber.new(dataDetalle[i].precio_unidad), style: 'derecha' },
            { width: 75, text : formatNumber.new(dataDetalle[i].total), style: 'derecha' }
          ]
        }
        detalle.push( item );
      }
      var fecha = new Date(data.factura.fecha_inicio);
      var mes = parseInt(fecha.getMonth()) + 1;
      var content = [
        {
          alignment: 'justify',
    			columns: [
    				{ width : 120, text: ' ' },
            { width : 115, text: ' ' },
            [
              {
                columns: [
                  { width: 35, text : ' ' + fecha.getDate(), style : 'izquierda' },
                  { width: 35, text : ' ' + mes, style : 'izquierda' },
                  { text : ' ' + fecha.getFullYear(), style : 'fecha' }
                ]
              }
            ]
          ],
        },
        {
          text : data.factura.cliente_desc,
          style: 'datos'
        },
        {
          text : data.factura.direccion,
          style: 'datos'
        },
        [
          {
            columns : [
              {
                width: 240,
                text : ' ',
                style: 'datos'
              },
              {
                text : data.factura.nit,
                style: 'izquierda'
              }
            ]
          }
        ],
        '\n',
        detalle
      ];
      var docDefinition = {
        pageSize: { width: 380, height: 555 },
        pageOrientation: 'portrait',
        pageMargins: [ 25, 110, 0, 35 ],
        footer: {
          columns: [
            { width: 195, style: 'foot', text: textoLetras },
            { width: 80, style: 'derecha', text: ' ' },
            { width: 80, style: 'derecha', text: formatNumber.new(data.factura.total) }
          ]
        },
        content: content,
        styles: {
          header: {
            fontSize: 12,
            bold: true,
            alignment: 'center'
          },
          centrar: {
            fontSize: 12,
            bold: true,
            alignment: 'center'
          },
          izquierda: {
            fontSize: 12,
            bold: true,
            alignment: 'left'
          },
          foot: {
            fontSize: 8,
            bold: false,
            alignment: 'left',
            margin: [25, 0, 0, 0]
          },
          derecha: {
            fontSize: 12,
            bold: true,
            alignment: 'right'
          },
          datos: {
      			fontSize: 12,
      			bold: true,
      			margin: [70, 5, 0, 0]
      		},
      		subheader: {
      			fontSize: 12,
      			bold: true,
      			margin: [0, 10, 0, 5]
      		},
      		tableExample: {
      			margin: [0, 5, 0, 15]
      		},
      		tableHeader: {
      			bold: true,
      			fontSize: 12,
      			color: 'black'
      		}
        }
      };

      pdfMake.createPdf(docDefinition).download( nombreSalida );
    }
  };
}]);
