<?php

$precio = $app['controllers_factory'];

$precio->get('/producto/{tipo}/lista', function ($tipo) use ($app) {
  $sql = "select p.producto_id, p.producto_desc "
          ."from tc_producto p "
          ."where not exists ( "
          ."select * from tc_precio pr "
          ."where p.producto_id = pr.producto_id "
          ."and estado = 1 "
          ."and pr.tipo_cliente_id = ".$tipo." "
          .") "
          ."union "
          ."select 0 producto_id, 'Agregar todos' producto_desc";
  $rows = $app['db']->fetchAll( $sql, array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$precio->get('/{tipo}/lista', function ($tipo) use ($app) {
  $sql = "select pr.*, case pr.estado when 1 then 'Activo' else 'Inactivo' end estado_desc, p.producto_desc "
        ."from tc_precio pr "
        ."inner join tc_producto p on pr.producto_id = p.producto_id "
        ."where pr.estado = 1 and pr.tipo_cliente_id = ?";
  $rows = $app['db']->fetchAll( $sql, array($tipo) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$precio->get('/{precio_id}', function ($precio_id) use ($app) {
  $sql = "select pr.*, p.producto_desc, tc.tipo_cliente_desc "
        ."from tc_precio pr "
        ."inner join tc_producto p on pr.producto_id = p.producto_id "
        ."inner join tc_tipo_cliente tc on pr.tipo_cliente_id = tc.tipo_cliente_id "
        ."where pr.precio_id = ?";
  $rows = $app['db']->fetchAssoc( $sql, array($precio_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$precio->post('/todo/{tipo}', function ($tipo) use ($app) {
  try {
    $respuesta = null;
    //$app['db']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $app['db']->beginTransaction();
    $sql = "insert into tc_precio "
          ."select 0 precio_id, 0.00 precio, 1 estado, current_date fecha_inicio, "
          ."current_date fecha_fin, ".$tipo." tipo_cliente_id, p.producto_id "
          ."from tc_producto p "
          ."where not exists (select * from tc_precio pr "
          ."where p.producto_id = pr.producto_id and estado = 1 and pr.tipo_cliente_id = ".$tipo.")";
    $st = $app['db']->prepare($sql);
    $row = $st->execute();
    $app['db']->commit();
    if ($row == true) {
      $respuesta = $app->json(resultArray('OK', 'Proceso completado con éxito', null));
    } else {
      $respuesta = $app->json(resultArray('error', 'No se insertaron los registros, es posible que ya existan', null));
    }
    return $respuesta;
  } catch (Exception $e) {
    $app['db']->rollBack();
    return $app->json(resultArray('error', $e->getMessage(), null));
  }
});

$precio->post('/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->insert('tc_precio', $data);
  return $app->json( resultArray( 'OK', 'Datos guardados', $app['db']->lastInsertId() ) );
});

$precio->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_precio', $data, array( 'precio_id' => $data['precio_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $precio;
