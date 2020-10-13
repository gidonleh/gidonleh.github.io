<?php
 
 $result = "";
 if(isset)($_POST['submit'])){
    require 'phpmailer/PHPMailerAutoload.php'
    $mail = new PHPMailer;

    $mail->Host='smtp.googlemail.com';
    $mail->Port=587;
    $mail->SMTPAuth=true;
    $mail->SMTPSecure='tls';
    $mail->Username='gadi.lehmann@gmail.com';
    $mail->password='arialeh3410';

    $mail->setForm($_POST['email'],$_POST['name']);
    $mail->addAddress('gadi.lehmann@gmail.com');
    $mail->addReplyTo($_POST['email'],$_POST['name']);

    $mail->isHTML(true);
    $mail->Subject='Form Submission: '.$_POST['subject'];
    $mail->Body='<h1 align=center>Name :'.$_POST['name'].'<br>Email: '.$_POST['email'].'<br>Message: '.$_POST['msg'].'</h1>';

    if(!$mail->send()){
        $result = "something went wrong. please try again.";

    }
    else {
        $result = "Thanks ".$_POST['name']." for contacting us. We'll get back to you soon!";
    }
  }
?>