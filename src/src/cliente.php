<?php

$cliente = $app['controllers_factory'];

$cliente->get('/lista', function () use ($app) {
  $rows = $app['db']->fetchAll( "SELECT * FROM tc_cliente order by cliente_id desc", array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$cliente->get('/{cliente_id}', function ($cliente_id) use ($app) {
  $row = $app['db']->fetchAssoc( "SELECT * FROM tc_cliente where cliente_id = ?", array($cliente_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$cliente->post('/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->insert('tc_cliente', $data);
  return $app->json( resultArray( 'OK', 'Datos guardados', null ) );
});

$cliente->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_cliente', $data, array( 'cliente_id' => $data['cliente_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $cliente;
