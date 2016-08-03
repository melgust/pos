<?php

$inventario = $app['controllers_factory'];

$inventario->get('/lista', function () use ($app) {
  $sql = "select pp.*, pv.proveedor_desc, pr.producto_desc, pr.imagen_url from tt_ingreso_inventario pp "
        ."inner join tc_proveedor pv on pp.proveedor_id = pv.proveedor_id "
        ."inner join tc_producto pr on pp.producto_id = pr.producto_id "
        ."where pp.estado = 1";
  $rows = $app['db']->fetchAll( $sql, array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$inventario->get('/{ingreso_inventario_id}', function ($ingreso_inventario_id) use ($app) {
  $sql = "select pp.*, pv.proveedor_desc, pr.producto_desc, pr.imagen_url from tt_ingreso_inventario pp "
        ."inner join tc_proveedor pv on pp.proveedor_id = pv.proveedor_id "
        ."inner join tc_producto pr on pp.producto_id = pr.producto_id "
        ."where pp.ingreso_inventario_id = ?";
  $row = $app['db']->fetchAssoc( $sql, array($ingreso_inventario_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$inventario->get('/producto/{producto_id}/proveedor/lista', function ($producto_id) use ($app) {
  $sql = "select pv.proveedor_id, pv.proveedor_desc from tc_proveedor_producto pp "
        ."inner join tc_proveedor pv on pp.proveedor_id = pv.proveedor_id "
        ."where pp.producto_id = ?";
  $row = $app['db']->fetchAll( $sql, array($producto_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$inventario->get('/proveedor/{proveedor_id}/producto/lista', function ($proveedor_id) use ($app) {
  $sql = "select pv.producto_id, pv.producto_desc from tc_proveedor_producto pp "
        ."inner join tc_producto pv on pp.producto_id = pv.producto_id "
        ."where pp.proveedor_id = ?";
  $row = $app['db']->fetchAll( $sql, array($proveedor_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$inventario->get('/productoproveedor/{producto_id}/{proveedor_id}', function ($producto_id, $proveedor_id) use ($app) {
  $sql = "select pp.*, pv.proveedor_desc, pr.producto_desc, pr.imagen_url, pr.existencia from tc_proveedor_producto pp "
        ."inner join tc_proveedor pv on pp.proveedor_id = pv.proveedor_id "
        ."inner join tc_producto pr on pp.producto_id = pr.producto_id "
        ."where pp.producto_id = ? and pp.proveedor_id = ?";
  $row = $app['db']->fetchAssoc( $sql, array($producto_id, $proveedor_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$inventario->post('/agregar', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  try {
    $respuesta = null;
    //$app['db']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $app['db']->beginTransaction();
    // insertar inventario
    $app['db']->insert('tt_ingreso_inventario', array(
      'producto_id' => $data['producto_id'],
      'proveedor_id' => $data['proveedor_id'],
      'cantidad' => $data['cantidad'],
      'usuario_ingresa_id' => $data['usuario_id'],
      'no_envio' => $data['no_envio'],
      'lote' => $data['lote'],
      'fecha_vencimiento' => $data['fecha_vencimiento']
    ));
    $ingresoId = $app['db']->lastInsertId();
    /*actualizar proveedor y producto*/
    $sql = "select cantidad from tc_proveedor_producto where producto_id = ".$data['producto_id']." and proveedor_id = ".$data['proveedor_id'];
    $tmpdata = $app['db']->fetchAll($sql, array());
    $cantidad = $tmpdata[0]['cantidad'];
    $cantidad = $cantidad + $data['cantidad'];
    $app['db']->update( 'tc_proveedor_producto', array(
      'cantidad' => $cantidad
    ), array( 'producto_id' => $data['producto_id'], 'proveedor_id' => $data['proveedor_id'] ) );
    /*actualizar existencia producto*/
    $sql = "select existencia from tc_producto where producto_id = ".$data['producto_id'];
    $tmpdata = $app['db']->fetchAll($sql, array());
    $cantidad = $tmpdata[0]['existencia'];
    $cantidad = $cantidad + $data['cantidad'];
    $app['db']->update( 'tc_producto', array(
      'existencia' => $cantidad,
      'fecha_vencimiento' => $data['fecha_vencimiento']
    ), array( 'producto_id' => $data['producto_id'] ) );
    $app['db']->commit();
    $respuesta = $app->json(resultArray('OK', 'Proceso completado con éxito', $ingresoId));
    return $respuesta;
  } catch (Exception $e) {
    $app['db']->rollBack();
    return $app->json(resultArray('error', $e->getMessage(), null));
  }
});

$inventario->put('/{ingreso_inventario_id}/anular', function ($ingreso_inventario_id) use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  try {
    $respuesta = null;
    //$app['db']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $app['db']->beginTransaction();
    /*Obtener datos del ingreso*/
    $sql = "select producto_id, cantidad from tt_ingreso_inventario where ingreso_inventario_id = ".$ingreso_inventario_id." and estado = 1";
    $tmpdata = $app['db']->fetchAll($sql, array());
    $productoId = $tmpdata[0]['producto_id'];
    $cantidadIng = $tmpdata[0]['cantidad'];
    /*actualizar existencia producto*/
    $sql = "select existencia from tc_producto where producto_id = ".$productoId;
    $tmpdata = $app['db']->fetchAll($sql, array());
    $cantidad = $tmpdata[0]['existencia'];
    if ($cantidad >= $cantidadIng) {
      $cantidad = $cantidad - $cantidadIng;
      $app['db']->update( 'tc_producto', array(
        'existencia' => $cantidad
      ), array( 'producto_id' => $productoId ) );
      $app['db']->update( 'tt_ingreso_inventario', array(
        'estado' => 0,
        'usuario_modifica_id' => $data['usuario_id'],
        'fecha_modifica' => date('Y-m-d H:i:s')
      ), array( 'ingreso_inventario_id' => $ingreso_inventario_id ) );
      $respuesta = $app->json(resultArray('OK', 'Ingreso anulado con éxito', null));
    } else {
      $respuesta = $app->json(resultArray('error', 'No es posible anular el ingreso debido a que la existencia es menor a lo que se quiere anular', null));
    }
    $app['db']->commit();
    return $respuesta;
  } catch (Exception $e) {
    $app['db']->rollBack();
    return $app->json(resultArray('error', $e->getMessage(), null));
  }
});

return $inventario;
