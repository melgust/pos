<?php

$categoria = $app['controllers_factory'];

$categoria->get('/lista', function () use ($app) {
  $rows = $app['db']->fetchAll( "SELECT * FROM tc_categoria order by categoria_id desc", array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$categoria->get('/{categoria_id}', function ($categoria_id) use ($app) {
  $row = $app['db']->fetchAssoc( "SELECT * FROM tc_categoria where categoria_id = ?", array($categoria_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$categoria->post('/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->insert('tc_categoria', $data);
  return $app->json( resultArray( 'OK', 'Datos guardados', null ) );
});

$categoria->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_categoria', $data, array( 'categoria_id' => $data['categoria_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $categoria;
