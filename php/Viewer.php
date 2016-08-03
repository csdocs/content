<?php
require_once 'Session.php';
require_once 'DataBase.php';
require_once 'XML.php';
require_once 'Log.php';
/**
 * Realiza las conversiones pertinentes de distintos documentos para poder 
 * observar su vista prevía en el visor de imágenes del cliente CSDocs.
 *
 * @author daniel
 */

$RoutFile = dirname(getcwd());        

class Viewer {
    public function __construct() {
        $this->Ajax();
    }

    private function Ajax()
    {
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "Viewer::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option"))
            {
                case 'imageProcessingToConvert': $this->imageProcessingToConvert($userData); break;
                case 'registerDocumentInLog': $this->registerDocumentInLog($userData); break;
                case 'registerViewerCloseEvent': $this->registerViewerCloseEvent($userData); break;
            }
        }
    }
    
    private function imageProcessingToConvert($userData){
        $functionToExecute = filter_input(INPUT_POST, "functionToExecute");
        $filePath = filter_input(INPUT_POST, "filePath");
        
        if(method_exists("Viewer", $functionToExecute))
            $this->$functionToExecute($userData, $filePath);
        else
            echo ("No existe la función para procesar el tipo de imagen. $functionToExecute()");
    }
    
    private function processTif($userData, $filePath){
        
        $dataBaseName = $userData['dataBaseName'];
        $userName = $userData['userName'];
        $RoutFile = dirname(getcwd());        
        $viewerType = 0;
        $exec = null;
        $tempExtension = null;
        
        $nameWithoutExt = pathinfo($filePath, PATHINFO_FILENAME);
        $tempPath = "$RoutFile/Estructuras/_TEMP_FILES_/$dataBaseName/$userName/$nameWithoutExt";
        $tempPathToClient = "../Estructuras/_TEMP_FILES_/$dataBaseName/$userName/$nameWithoutExt";

        $output = array();
        
        if(!file_exists(dirname($tempPath)))
            if(!($TempDirCreationResult = mkdir(dirname($tempPath), 0777, true)))
                    return XML::XMLReponse ("Error", 0, "<p><b>Error</b> no pudo "
                            . "ser creado el directorio temporal</p>Detalles:<br>$TempDirCreationResult");
        
        if(file_exists($tempPath))
            unlink ($tempPath);
        
        if(!file_exists($filePath))
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> no existe el documento a procesar</p>");
                
        $pagesNumber = $this->getPagesNumberOfTiff($filePath);

        if(count($pagesNumber) > 1){
            $tempExtension = ".pdf";
            $viewerType = "pdfViewer";
        }
        else{
            $viewerType = "imageViewer";
            $tempExtension = ".jpg";
        }
        
        $tempPath.= $tempExtension;
        
        if(strcasecmp($viewerType, "imageViewer") == 0)
            $exec = "convert ".str_replace(" ", "\\ ", $filePath)." ".str_replace(" ", "\\ ", $tempPath);
        else if(strcasecmp($viewerType, "pdfViewer") == 0)
                $exec = "convert ".str_replace(" ", "\\ ", $filePath)." ".str_replace(" ", "\\ ", $tempPath);
      
        exec($exec, $output);
        
        if(count($output) > 0)
            return XML::XMLReponse ("Error", 0, "Resultado del procesamiento del documento tif. ". implode(",",$output));
                    
        
        if(!file_exists($tempPath))
            return XML::XMLReponse ("Error", 0, "No se ha creado el documento temporal");
        
        $doc  = new DOMDocument('1.0','utf-8');
        libxml_use_internal_errors(true);
        $doc->formatOutput = true;
        $root = $doc->createElement("document");
        $doc->appendChild($root); 
        $tempPathXml = $doc->createElement("tempPath", $tempPathToClient.$tempExtension);
        $root->appendChild($tempPathXml);
        $viewerTypeXml = $doc->createElement("viewerType", $viewerType);
        $root->appendChild($viewerTypeXml);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();

    }
    
    private function getPagesNumberOfTiff($tiffPath){
   
        $tiffPathEscaped = str_replace(" ", "\\ ", $tiffPath);
        
        $command = 'convert '.$tiffPathEscaped.' -identify -format %p '.$tiffPathEscaped;
        
        $pagesNumber = array();
        exec($command, $pagesNumber);
        
        return $pagesNumber;
    }
    
    private function registerDocumentInLog($userData){
        $idUser = $userData['idUser'];
        $userName = $userData['userName'];
        $instanceName = $userData['dataBaseName'];
        $documentName = filter_input(INPUT_POST, "documentName");
        $log = Log::WriteEvent(46, $idUser, $userName, " $documentName", $instanceName);
        XML::XMLReponse("registered", 1, $log);
    }
    
    private function registerViewerCloseEvent($userData){
        $idUser = $userData['idUser'];
        $userName = $userData['userName'];
        $instanceName = $userData['dataBaseName'];
        $documentName = filter_input(INPUT_POST, "documentName");
        $log = Log::WriteEvent(47, $idUser, $userName, " $documentName", $instanceName);
        XML::XMLReponse("registered", 1, $log);
    }
    
}

$Viewer = new Viewer();