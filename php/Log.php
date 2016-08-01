<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Log
 *
 * @author daniel
 */

require_once 'XML.php';

class Log {        
    
    public function __construct() {
        $this->ajax();
    }
    private function ajax()
    {  
        switch (filter_input(INPUT_POST, "opcion"))
        {
            case 'LogQuery': $this->LogQuery(); break;   
        }
    }
    
    function Write($key, $IdUser, $user, $Extra_Description, $DataBaseName = null)
    {
        $RoutFile = dirname(getcwd());           
        
        $Route_Log = "../Log/".date('Y')."/".date('m')."/".date('d');
        if($DataBaseName!=null)
            $Route_Log = "$RoutFile/Log/$DataBaseName/".date('Y')."/".date('m')."/".date('d');
        
        if(!file_exists($Route_Log))
            if(!($mkdir = mkdir ($Route_Log,0777,true)))
            {
                echo "No fué posible crear el directorio de almacenamiento de registros. $mkdir";
                return 0;
            }
        
        if(!$Dictionary = parse_ini_file("../Configuracion/DictionaryLog/Dictionary.ini"))
            return 0;
        
        $ClientIp = Log::getRealIP();
        
        if(isset($Dictionary[$key]))
        {
            $Description = $Dictionary[$key];
            $date = date("Y-m-d H:i:s");
            $Log = fopen($Route_Log."/Log.ini", "a+");
            fwrite($Log,"Log[]=$date###$key###$IdUser###$user###$Description$Extra_Description###$ClientIp;".PHP_EOL);
            fclose($Log);            
        }        
    }
    
    public static function WriteEvent($key, $IdUser, $user, $Extra_Description, $DataBaseName = null)
    {
        $RoutFile = dirname(getcwd());           
        
        $Route_Log = "$RoutFile/Log/".date('Y')."/".date('m')."/".date('d');
        if($DataBaseName!=null)
            $Route_Log = "$RoutFile/Log/$DataBaseName/".date('Y')."/".date('m')."/".date('d');
        
        if(!file_exists($Route_Log))
            mkdir ($Route_Log,0777,true);
        
        if(!$Dictionary = parse_ini_file("../Configuracion/DictionaryLog/Dictionary.ini"))
            return "No fue posible abrir el diccionario";
        
        $ClientIp = Log::getRealIP();
        
        if(isset($Dictionary[$key]))
        {
            $Description = $Dictionary[$key].$Extra_Description;
            $date = date("Y-m-d H:i:s");
            $Log = fopen($Route_Log."/Log.ini", "a+");
            fwrite($Log,"Log[]=$date###$key###$IdUser###$user###$Description###$ClientIp;".PHP_EOL);
            fclose($Log);      
            return "<p>Evento: $Description.... Registrado </p>";
        }    
        else
            return "<p>No existe el evento solicitado a registrar en Log</p>";
    }
    
    private function LogQuery()
    {
        $RoutFile = dirname(getcwd());           
        
        $Date = filter_input(INPUT_POST, "Date");
        
        $NombreUsuario=  filter_input(INPUT_POST, "nombre_usuario");
        $IdUsuario=filter_input(INPUT_POST, "IdUsuario");
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        
        $ArrayDate = explode("-", $Date);
        
        $yyy = $ArrayDate[0];
        $mm = $ArrayDate[1];
        $dd = $ArrayDate[2];
        
        $Route_Log = "$RoutFile/Log/$DataBaseName/$yyy/$mm/$dd/Log.ini";
        
        
        if(!file_exists($Route_Log))
        {
            XML::XMLReponse("Error", 0, "No existe el registro del día seleccionado");
            return 0;
        }
        
        
        if(!($Log = parse_ini_file($Route_Log)))
            XML::XMLReponse("Error", 0, "No fué posible abrir el registro del sistema es posible que se encuentre dañado");    

        
        
        /*  Devolución de repuesta en XML */
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("Log");
        $doc->appendChild($root); 
        for($cont = 0; $cont < count($Log['Log']); $cont++)
        {
            $ArrayRegister = explode("###", $Log['Log'][$cont]);
            $Register = $doc->createElement("Register");
            $Hh = $doc->createElement("Date", $ArrayRegister[0]);
            $Register ->appendChild($Hh);
            $LogKey = $doc->createElement("LogKey",$ArrayRegister[1]);
            $Register->appendChild($LogKey);
            $IdUser = $doc->createElement("IdUser",$ArrayRegister[2]);
            $Register->appendChild($IdUser);
            $User = $doc->createElement("User",$ArrayRegister[3]);
            $Register->appendChild($User);
            $Description = $doc->createElement("Description",$ArrayRegister[4]);
            $Register->appendChild($Description);
            $ClientIp = $doc->createElement("ClientIp", $ArrayRegister[5]);
            $Register->appendChild($ClientIp);
            $root->appendChild($Register);            
        }
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
    }
    
    static function getRealIP()
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP']))
            return $_SERVER['HTTP_CLIENT_IP'];
           
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
            
        if(isset($_SERVER['REMOTE_ADDR']))
            return $_SERVER['REMOTE_ADDR'];
    }
}

$Log = new Log();
