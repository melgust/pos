<?php

$productoproveedor = $app['controllers_factory'];

$productoproveedor->get('/lista', function () use ($app) {
  $sql = "select pp.*, pv.proveedor_desc, pr.producto_desc, pr.imagen_url from tc_proveedor_producto pp "
        ."inner join tc_proveedor pv on pp.proveedor_id = pv.proveedor_id "
        ."inner join tc_producto pr on pp.producto_id = pr.producto_id ";
  $rows = $app['db']->fetchAll( $sql, array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$productoproveedor->get('/{producto_id}/{proveedor_id}', function ($producto_id, $proveedor_id) use ($app) {
  $sql = "select pp.*, pv.proveedor_desc, pr.producto_desc, pr.imagen_url from tc_proveedor_producto pp "
        ."inner join tc_proveedor pv on pp.proveedor_id = pv.proveedor_id "
        ."inner join tc_producto pr on pp.producto_id = pr.producto_id "
        ."where pp.producto_id = ? and pp.proveedor_id = ?";
  $row = $app['db']->fetchAssoc( $sql, array($producto_id, $proveedor_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$productoproveedor->post('/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->insert('tc_proveedor_producto', $data);
  return $app->json( resultArray( 'OK', 'Datos guardados', null ) );
});

$productoproveedor->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_proveedor_producto', array(
    'minimo' => $data['minimo']
  ), array( 'producto_id' => $data['producto_id'], 'proveedor_id' => $data['proveedor_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $productoproveedor;
