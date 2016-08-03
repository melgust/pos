<?php
    $tmpname = $_FILES["file"]["name"][0];
    $type = $_FILES['file']['type'][0];
    $size = $_FILES['file']['size'][0];
    $size = $size / 1024;
    $productos = $_POST['producto'];
    $directorio = "/home/chixot/public_html/pos/img/".date("Y")."/".date("M")."/".date("D");
    $base_url = "img/".date("Y")."/".date("M")."/".date("D");
    $continue = false;
    if (file_exists($directorio)) {
      $continue = true;
    } else {
      $continue = mkdir($directorio, 0755, true);
    }
    if ($continue == true) {
      $count = 1;
      $filename = $directorio."/".$tmpname;
      $imagen_url = $base_url."/".$tmpname;
      while (file_exists($filename)) {
        $filename = $directorio."/".$count."_".$tmpname;
        $imagen_url = $base_url."/".$count."_".$tmpname;
        $count++;
      }
      move_uploaded_file($_FILES['file']['tmp_name'][0], $filename);
      echo '{"status" : "success", "message" : "Archivo subido", "imagen_url" : "'.$imagen_url.'", "nombre" : "'.$tmpname.'", "extension" : "'.$type.'", "size" : "'.$size.'"}';
    } else {
      echo '{"status" : "error", "message" : "No se puede crear el directorio"}';
    }
 ?>
