<?php

$usuario = $app['controllers_factory'];

$usuario->get('/lista', function () use ($app) {
  $rows = $app['db']->fetchAll( "SELECT * FROM tc_usuario order by usuario_id desc", array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $rows ) );
});

$usuario->get('/caja/lista', function () use ($app) {
  $row = $app['db']->fetchAll( "SELECT caja_id, caja_desc FROM tc_caja where estado = 1", array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$usuario->get('/menu/lista/{perfil_id}/perfil', function ($perfil_id) use ($app) {
  $sql = "SELECT m.menu_id, m.menu_desc, m.url, m.tooltip, m.icono, m.padre_id "
        ."FROM tc_menu m inner join tc_menu_perfil p on m.menu_id = p.menu_id "
        ."where m.estado = 1 and p.perfil_id = ".$perfil_id;
  $row = $app['db']->fetchAll( $sql, array() );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$usuario->get('/{usuario_id}', function ($usuario_id) use ($app) {
  $row = $app['db']->fetchAssoc( "SELECT * FROM tc_usuario where usuario_id = ?", array($usuario_id) );
  return $app->json( resultArray( 'OK', 'Datos cargados', $row ) );
});

$usuario->post('/validar', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $respuesta = null;
  $sql = "select u.*, p.perfil_id from tc_usuario u "
        ."inner join tc_usuario_perfil p on u.usuario_id = p.usuario_id "
        ."where lower(u.usuario) = '".strtolower($data['usuario'])."' and u.estado = 1";
  $row = $app['db']->fetchAll( $sql, array() );
  if (count($row) > 0) {
    $tmpPass = base64_decode($data["password"]);
    $tmpPass = md5($tmpPass);
    if ($tmpPass == $row[0]['password']) {
      $respuesta = resultArray( 'OK', 'Acceso correcto', $row[0] );
    } else {
      $respuesta = resultArray( 'error', 'Contraseña inválida', null );
    }
  } else {
    $respuesta = resultArray( 'error', 'Usuario no existe', null );
  }
  return $app->json( $respuesta );
});

$usuario->post('/add', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->insert('tc_usuario', $data);
  return $app->json( resultArray( 'OK', 'Datos guardados', null ) );
});

$usuario->put('/edit', function () use ($app) {
  $data = json_decode( file_get_contents("php://input"), true );
  $app['db']->update( 'tc_usuario', $data, array( 'usuario_id' => $data['usuario_id'] ) );
  return $app->json( resultArray( 'OK', 'Datos actualizados', null ) );
});

return $usuario;
