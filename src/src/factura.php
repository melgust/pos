<?php

$factura = $app['controllers_factory'];

$factura->get('/fecha/{fecha}/lista', function () use ($app) {
  return $app->json( $app['db']->fetchAll( "SELECT * FROM Invoice order by id desc", array() ) );
});

$factura->get('/cliente/{nit}', function ($nit) use ($app) {
  if (strpos(strtolower($nit), '$') !== false) {
    $nit = str_replace('$', '/', $nit);
  }
  $nit = strtoupper($nit);
  $strQuery = "select c.cliente_id, c.cliente_desc, c.nit, c.direccion, "
              ."c.tipo_cliente_id, tc.tipo_cliente_desc, limite_credito, "
              ."(select ifnull(sum(saldo), 0) from tt_cuenta_cobrar cc "
              ."where cc.cliente_id = c.cliente_id and cc.estado = 1) saldo, 0 disponible "
              ."from tc_cliente c "
              ."inner join tc_tipo_cliente tc on c.tipo_cliente_id = tc.tipo_cliente_id ";
              if (strpos($nit, '-') || strpos($nit, '/')){
                $strQuery = $strQuery."where c.nit = '".$nit."'";
              } else {
                $strQuery = $strQuery."where c.cliente_id = ".$nit;
              }
  $row = $app['db']->fetchAll($strQuery, array());
  if (count($row) > 0) {
    return $app->json(resultArray('OK', 'Cliente encontrado', $row));
  } else {
    return $app->json(resultArray('error', 'NIT: '.$nit.' no encontrado', null));
  }
});

$factura->get('/cliente/{id}/codigo', function ($id) use ($app) {
  $strQuery = "select c.cliente_id, c.cliente_desc, c.nit, c.direccion, "
              ."c.tipo_cliente_id, tc.tipo_cliente_desc, limite_credito, "
              ."(select ifnull(sum(saldo), 0) from tt_cuenta_cobrar cc "
              ."where cc.cliente_id = c.cliente_id and cc.estado = 1) saldo, 0 disponible "
              ."from tc_cliente c "
              ."inner join tc_tipo_cliente tc on c.tipo_cliente_id = tc.tipo_cliente_id "
              ."where c.cliente_id = ?";
  $row = $app['db']->fetchAll($strQuery, array($id));
  if (count($row) > 0) {
    return $app->json(resultArray('OK', 'Cliente encontrado', $row));
  } else {
    return $app->json(resultArray('error', 'NIT: '.$nit.' no encontrado', null));
  }
});

$factura->get('/cliente/lista/{filtro}/filtro', function ($filtro) use ($app) {
  $origFiltro = $filtro;
  $filtro = strtolower($filtro);
  $strQuery = "select c.cliente_id, c.cliente_desc, c.nit, c.direccion, "
              ."c.tipo_cliente_id, tc.tipo_cliente_desc, limite_credito, 0 disponible "
              ."from tc_cliente c "
              ."inner join tc_tipo_cliente tc on c.tipo_cliente_id = tc.tipo_cliente_id "
              ."where c.estado = 1 and lower(c.cliente_desc) like '%".str_replace(' ', '%', $filtro)."%'";
  $row = $app['db']->fetchAll($strQuery, array());
  if (count($row) > 0) {
    return $app->json(resultArray('OK', 'Lista cargada', $row));
  } else {
    return $app->json(resultArray('error', 'No hay datos para el filtro: '.$origFiltro, null));
  }
});

$factura->get('/productocliente/{producto_id}/{tipo_cliente_id}', function ($producto_id, $tipo_cliente_id) use ($app) {
  $strQuery = "select p.producto_id, p.producto_desc, p.existencia, p.imagen_url, c.precio, 0 descuento, 1 cantidad, 0 total, 0 correlativo "
              ."from tc_producto p "
              ."inner join tc_precio c on p.producto_id = c.producto_id "
              ."where p.producto_id = ? and c.tipo_cliente_id = ? "
              ."and p.estado = 1 and c.estado = 1";
  $row = $app['db']->fetchAll($strQuery, array($producto_id, $tipo_cliente_id));
  if (count($row) > 0) {
    return $app->json(resultArray('OK', 'Datos cargados', $row));
  } else {
    return $app->json(resultArray('error', 'No hay datos para el producto indicado', null));
  }
});

$factura->get('/productocliente/lista/{filtro}/{tipo_cliente_id}/filtro', function ($filtro, $tipo_cliente_id) use ($app) {
  $origFiltro = $filtro;
  $filtro = strtolower($filtro);
  $strQuery = "select p.producto_id, p.producto_desc, p.existencia, p.imagen_url, c.precio, "
              ."0 descuento, 1 cantidad, 0 total, 0 correlativo "
              ."from tc_producto p "
              ."inner join tc_precio c on p.producto_id = c.producto_id "
              ."where lower(p.producto_desc) like '%".str_replace(' ', '%', $filtro)."%' and c.tipo_cliente_id = ? "
              ."and p.estado = 1 and c.estado = 1";
  $row = $app['db']->fetchAll($strQuery, array($tipo_cliente_id));
  if (count($row) > 0) {
    return $app->json(resultArray('OK', 'Datos cargados', $row));
  } else {
    return $app->json(resultArray('error', 'No hay datos para el filtro: '.$origFiltro, null));
  }
});

$factura->get('/tipopago/lista', function () use ($app) {
  $strQuery = "select tipo_pago_id, tipo_pago_desc "
              ."from tc_tipo_pago "
              ."where estado = 1";
  $row = $app['db']->fetchAll($strQuery, array());
  if (count($row) > 0) {
    return $app->json(resultArray('OK', 'datos cargados', $row));
  } else {
    return $app->json(resultArray('error', 'No hay datos para la lista', null));
  }
});

$factura->get('/tipocliente/lista', function () use ($app) {
  $strQuery = "select tipo_cliente_id, tipo_cliente_desc "
              ."from tc_tipo_cliente ";
  $row = $app['db']->fetchAll($strQuery, array());
  if (count($row) > 0) {
    return $app->json(resultArray('OK', 'datos cargados', $row));
  } else {
    return $app->json(resultArray('error', 'No hay datos para la lista', null));
  }
});

$factura->get('/{id}', function ($id) use ($app) {
  $sql = "select d.*, p.cliente_desc, p.nit, p.direccion "
        ."from tt_factura d "
        ."inner join tc_cliente p on d.cliente_id = p.cliente_id "
        ."where d.factura_id = ?";
  $data = $app['db']->fetchAssoc( $sql, array($id));
  $respuesta['factura'] = $data;
  $sql = "select d.*, p.producto_desc "
        ."from tt_detalle_factura d "
        ."inner join tc_producto p on d.producto_id = p.producto_id "
        ."where d.factura_id = ? and d.estado = 1";
  $data = $app['db']->fetchAll( $sql, array($id));
  $respuesta['detalle'] = $data;
  $sql = "select d.*, p.tipo_pago_desc "
        ."from tc_pago d "
        ."inner join tc_tipo_pago p on d.tipo_pago_id = p.tipo_pago_id "
        ."where d.factura_id = ?";
  $data = $app['db']->fetchAll( $sql, array($id));
  $respuesta['pagos'] = $data;
  return $app->json( resultArray('OK', "Datos cargados", $respuesta) );
});

$factura->get('/proforma/{id}', function ($id) use ($app) {
  $sql = "select d.*, p.cliente_desc, p.nit, p.direccion "
        ."from tt_proforma d "
        ."inner join tc_cliente p on d.cliente_id = p.cliente_id "
        ."where d.proforma_id = ?";
  $data = $app['db']->fetchAssoc( $sql, array($id));
  $respuesta['factura'] = $data;
  $sql = "select d.*, p.producto_desc "
        ."from tt_detalle_proforma d "
        ."inner join tc_producto p on d.producto_id = p.producto_id "
        ."where d.proforma_id = ? and d.estado = 1";
  $data = $app['db']->fetchAll( $sql, array($id));
  $respuesta['detalle'] = $data;
  return $app->json( resultArray('OK', "Datos cargados", $respuesta) );
});

$factura->get('/lista/proforma', function () use ($app) {
  $sql = "select d.*, p.cliente_desc, p.nit, p.direccion "
        ."from tt_proforma d "
        ."inner join tc_cliente p on d.cliente_id = p.cliente_id "
        ."where d.estado = 1";
  $data = $app['db']->fetchAll( $sql, array());
  return $app->json( resultArray('OK', "Datos cargados", $data) );
});

$factura->put('/proforma/{id}/cambiarestado/{estado}', function ($id, $estado) use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tt_proforma', array('estado' => $estado), array( 'proforma_id' => $id ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

$factura->post('/cliente/agregar', function () use ($app) {
  try {
    $data = json_decode( file_get_contents("php://input"), true );
    $app['db']->insert('tc_cliente', $data);
    return $app->json(resultArray('OK', $app['db']->lastInsertId(), null));
  } catch (Exception $e) {
    if (strpos(strtolower($e->getMessage()), 'duplicate') !== false) {
        return $app->json(resultArray('error', 'No se puede registrar al cliente debido a que el NIT ya existe', null));
    }
    return $app->json(resultArray('error', $e->getMessage(), null));
  }
});

$factura->post('/agregar', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  try {
    $respuesta = null;
    //$app['db']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $app['db']->beginTransaction();
    // get owing by customer
    $sql = "select tc.limite_credito, "
            ."(select ifnull(sum(saldo), 0) from tt_cuenta_cobrar cc "
            ."where cc.cliente_id = c.cliente_id and cc.estado = 1) saldo "
            ."from tc_cliente c "
            ."inner join tc_tipo_cliente tc on c.tipo_cliente_id = tc.tipo_cliente_id "
            ."where c.cliente_id = ".$data['cliente_id'];
    $credito = $app['db']->fetchAll( $sql, array() );
    $limite_credito = $credito[0]['limite_credito'] - $credito[0]['saldo'];
    //obtener total factura con base al detalle
    $items = $data['detalle'];
    $totalProductos = 0;
    $totalFactura = 0.00;
    for( $i = 0; $i < sizeof($items); $i++ ) {
      $totalFactura += ( double ) $items[$i]['total'];
      $totalProductos++;
    }

    //validar existencias
    $productoId = 0;
    $conteo = 0;
    for( $i = 0; $i < sizeof($items); $i++ ) {
      $totalFactura += ( double ) $items[$i]['total'];
      $totalProductos++;
    }

    //obtener pagos
    $itemsPago = $data['pagos'];
    $totalCredito = 0.00;
    $totalPagado = 0.00;
    for( $i = 0; $i < sizeof($itemsPago); $i++ ) {
      $totalPagado += ( double ) $itemsPago[$i]['monto'];
      if ($itemsPago[$i]['tipo_pago_id'] == 2) { //solo al credito
        $totalCredito += ( double ) $itemsPago[$i]['monto'];
      }
    }
    $continuar = true;
    if ($totalCredito > 0){
      $limite_credito = $limite_credito - $totalCredito;
      if ($limite_credito < 0) {
        $continuar = false;
        $respuesta = $app->json(resultArray('error', 'El cliente no tiene crédito disponible para registrar esta factura', null));
      }
    }
    if ($continuar == true && $totalFactura > 0 && $totalFactura > $totalPagado) {
      $continuar = false;
    }
    $hacerCommit = true;
    if ($continuar == true) {
      //obtener correlativo caja
      $sql = "select numero_factura + 1 numero_factura, serie from tc_caja where caja_id = ".$data['caja_id']." and estado = 1";
      $caja = $app['db']->fetchAll($sql, array());
      $app['db']->update( 'tc_caja', array('numero_factura' => $caja[0]['numero_factura']), array( 'caja_id' => $data['caja_id'], 'estado' => 1 ) );
      $totalSinIva = $totalFactura / 1.12;
      $totalIva = $totalFactura - $totalSinIva;
      // insert invoice
      $app['db']->insert('tt_factura', array(
        'fecha_inicio' => date('Y-m-d H:i:s'),
        'fecha_fin' => date('Y-m-d H:i:s'),
        'serie' => $caja[0]['serie'],
        'numero_factura' => $caja[0]['numero_factura'],
        'estado' => 1,
        'caja_id' => $data['caja_id'],
        'total_producto' => $totalProductos,
        'total' => $totalFactura,
        'iva' => $totalIva,
        'descuento' => 0,
        'total_sin_iva' => $totalSinIva,
        'cliente_id' => $data['cliente_id'],
        'usuario_id' => $data['usuario_id']
      ));
      $identificador = $app['db']->lastInsertId();
      // insert invoice details
      $nombreProducto = "";
      $continuar = true;
      for( $i = 0; $i < sizeof($items); $i++ ) {
        //calcular existencia
        $productoId = $items[$i]['producto_id'];
        $sql = "select producto_desc, existencia from tc_producto where producto_id = ".$productoId;
        $tmpdata = $app['db']->fetchAll($sql, array());
        $nombreProducto = $tmpdata[0]['producto_desc'];
        $cantidadDisp = $tmpdata[0]['existencia'];
        if ($cantidadDisp >= $items[$i]['cantidad']) {
          $totalItem = $items[$i]['total'];
          $totalSinIva = $totalItem / 1.12;
          $totalIva = $totalItem - $totalSinIva;
          $app['db']->insert('tt_detalle_factura', array(
            'fecha_registro' => date('Y-m-d H:i:s'),
            'estado' => 1,
            'precio_unidad' => $items[$i]['precio'],
            'total' => $items[$i]['total'],
            'iva' => $totalIva,
            'factura_id' => $identificador,
            'producto_id' => $items[$i]['producto_id'],
            'cantidad' => $items[$i]['cantidad'],
            'descuento' => 0.00,
            'total_sin_iva' => $totalSinIva,
            'usuario_id' => $data['usuario_id']
          ));
        } else {
          $continuar = false;
          $hacerCommit = false;
          $respuesta = $app->json(resultArray('error', 'Las unidades disponibles del producto '.$nombreProducto.' no son suficientes, favor verificar', null));
          break;
        }
      }
      if ($continuar) {
        $cuentaCobrarId = 0;
        if ($totalCredito > 0) {
          $app['db']->insert('tt_cuenta_cobrar', array(
            'cuenta_cobrar_desc' => 'Crédito al usuario '.$data['usuario_id'],
            'valor' => $totalCredito,
            'saldo' => $totalCredito,
            'estado' => 1,
            'fecha_registro' => date('Y-m-d H:i:s'),
            'cliente_id' => $data['cliente_id']
          ));
          $cuentaCobrarId = $app['db']->lastInsertId();
        }

        // insert payment
        for( $i = 0; $i < sizeof($itemsPago); $i++ ) {
          if ($itemsPago[$i]['tipo_pago_id'] == 2) { //si es al credito
            $_cuentaCobrarId = $cuentaCobrarId;
          } else {
            $_cuentaCobrarId = null;
          }
          $app['db']->insert('tc_pago', array(
            'monto' => $itemsPago[$i]['monto'],
            'cuenta_cobrar_id' => $_cuentaCobrarId,
            'tipo_pago_id' => $itemsPago[$i]['tipo_pago_id'],
            'factura_id' => $identificador
          ));
        }
        $respuesta = $app->json(resultArray('OK', 'Proceso completado con éxito', $identificador));
      } else {
        $respuesta = $app->json(resultArray('error', 'Las unidades disponibles del producto '.$nombreProducto.' no son suficientes, favor verificar', null));
      }
    } else {
      $respuesta = $app->json(resultArray('error', 'El monto pagado no cubre el total de la factura', null));
    }
    if ($hacerCommit) {
      $app['db']->commit();
    } else {
      $app['db']->rollBack();
    }
    return $respuesta;
  } catch (Exception $e) {
    $app['db']->rollBack();
    return $app->json(resultArray('error', 'Exception: '.$e->getMessage(), null));
  }
});

$factura->post('/proforma/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  try {
    $respuesta = null;
    //$app['db']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $app['db']->beginTransaction();
    //obtener total proforma con base al detalle
    $items = $data['detalle'];
    $totalProductos = 0;
    $totalproforma = 0.00;
    for( $i = 0; $i < sizeof($items); $i++ ) {
      $totalproforma += ( double ) $items[$i]['total'];
      $totalProductos++;
    }
    $continuar = true;
    $totalSinIva = $totalproforma / 1.12;
    $totalIva = $totalproforma - $totalSinIva;
    // insert invoice
    $app['db']->insert('tt_proforma', array(
      'fecha_inicio' => date('Y-m-d H:i:s'),
      'fecha_fin' => date('Y-m-d H:i:s'),
      'serie' => 'P001',
      'numero_proforma' => 0,
      'estado' => 1,
      'caja_id' => $data['caja_id'],
      'total_producto' => $totalProductos,
      'total' => $totalproforma,
      'iva' => $totalIva,
      'descuento' => 0,
      'total_sin_iva' => $totalSinIva,
      'cliente_id' => $data['cliente_id'],
      'usuario_id' => $data['usuario_id']
    ));
    $proformaId = $app['db']->lastInsertId();
    // insert invoice details
    for( $i = 0; $i < sizeof($items); $i++ ) {
      $totalItem = $items[$i]['total'];
      $totalSinIva = $totalItem / 1.12;
      $totalIva = $totalItem - $totalSinIva;
      $app['db']->insert('tt_detalle_proforma', array(
        'fecha_registro' => date('Y-m-d H:i:s'),
        'estado' => 1,
        'precio_unidad' => $items[$i]['precio'],
        'total' => $items[$i]['total'],
        'iva' => $totalIva,
        'proforma_id' => $proformaId,
        'producto_id' => $items[$i]['producto_id'],
        'cantidad' => $items[$i]['cantidad'],
        'descuento' => 0.00,
        'total_sin_iva' => $totalSinIva,
        'usuario_id' => $data['usuario_id']
      ));
    }
    $respuesta = $app->json(resultArray('OK', 'Proceso completado con éxito', $proformaId));
    $app['db']->commit();
    return $respuesta;
  } catch (Exception $e) {
    $app['db']->rollBack();
    return $app->json(resultArray('error', $e->getMessage(), null));
  }
});

return $factura;
