<?php

/*
 * Copyright 2016 daniel.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Description of Carga
 *
 * @author daniel
 */
include_once 'XML.php';
include_once 'DataBase.php';
include_once 'DesignerForms.php';
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
class Carga {
    private $db;
    private $prefix;
    private $filesPath = "/home/conocer/Escritorio/Carga";
    public function __construct() {
        $this->db = new DataBase();
        $this->prefix = "COL ";
    }
    public function start(){
        $conocerData = $this->getConocerDocuments();
        $columnNames = $this->getColumnNames($conocerData);
        $this->buildDirectoriesStructure($columnNames, $conocerData);
    }
    
    private function getColumnNames($arrayDatos){
        $columnNames = array();
        if(!isset($arrayDatos[0]))
            return null;
        
        $columns = $arrayDatos[0];
        foreach ($columns as $key => $value){
            $columnNames[$key] = $value;
        }
        return $columnNames;
    }
    
    private function getConocerDocuments(){
        $select = "SELECT *FROM ConocerDocuments";
        $data = $this->db->ConsultaSelect("CONOCER", $select);
        
        if($data['Estado'] != 1)
            return $data['Estado'];
        return $data['ArrayDatos'];
    }
    /*
     * Fin de iteracion en 1481
     * 5EC
     */
    private function buildDirectoriesStructure($columnNames, $conocerData){
        $routFile = dirname(getcwd());
        $prefix = $this->prefix;
        
        for($cont = 2; $cont < count($conocerData); $cont++){
            echo "<pre>";
//            foreach ($conocerData[$cont] as $key => $value){
//                echo "<p>$key: $columnNames[$key] = $value || </p>";
//            }
            if(!isset($conocerData[$cont]))
                die();
            echo "------------------ ITERACION $cont ----------------------";
            $consecutivo = $conocerData[$cont]["COL 7"];
//            echo "<p>consecutivo: $consecutivo</p>";
            $fondo = $conocerData[$cont]["$prefix"."1"];     
            $idFondo = $this->getIdDirectory($fondo, "$fondo.", "", 1, "fondo", "/", $conocerData[$cont]);
        
            $subFondo = $conocerData[$cont]["$prefix"."2"];
            $idSubFondo = $this->getIdDirectory($subFondo, "$fondo.$subFondo/", "$fondo", $idFondo, "fondo", "/$idFondo/", $conocerData[$cont]);
//            echo "<p>idSubFondo: $idSubFondo</p>";
            $seccion = $conocerData[$cont]["$prefix"."3"];
            $idSection = $this->getIdDirectory($subFondo.".".$seccion, $fondo.".".$subFondo."/".$seccion."/", "$fondo.$subFondo/", $idSubFondo, "section", "/$idFondo/$idSubFondo/", $conocerData[$cont]);
//            echo "</p>idSection: $idSection</p>";
            $serie = $conocerData[$cont]["$prefix"."4"];
            if(!strlen($serie) > 0){
                echo "$fondo.$subFondo/$seccion/$serie";
                continue;
            }
            $idSerie = $this->getIdDirectory($subFondo.".".$seccion.".".$serie, $fondo.".".$subFondo."/".$seccion."/$serie/", $fondo.".".$subFondo."/".$seccion."/",  $idSection, "serie", "/$idFondo/$idSubFondo/$idSection/", $conocerData[$cont]);
            $subserie = $conocerData[$cont]["$prefix"."5"];
            $idSubserie = "";
            $keyPath = "/$idFondo/$idSubFondo/$idSection/$idSerie/";
            if(strlen($subserie) > 0){
                echo "<p>Subserie: $subserie</p>";
                $idSerie = $this->getIdDirectory($subFondo.".".$seccion.".".$serie.".".$subserie, $fondo.".".$subFondo."/".$seccion."/$serie/", $fondo.".".$subFondo."/".$seccion."/$serie.$subserie/", $idSerie, "serie", "/$idFondo/$idSubFondo/$idSection/$idSerie/", $conocerData[$cont]);
                echo "<p>idSubserie: $idSubserie</p>";
                $keyPath.="$idSubserie/";
            }
                 
//            echo "<p>path: $keyPath</p>";
            $expediente = $conocerData[$cont]["$prefix"."19"];
            echo "Exp: $expediente ";
            $idExpedient = $this->getIdDirectory(null, $expediente, $fondo.".".$subFondo."/".$seccion."/$serie.$subserie/",  $idSerie, "0", $keyPath, $conocerData[$cont], 1, 0);
            
            $legajo = $conocerData[$cont]["$prefix"."8"];
            echo "<p>legajo: $legajo</p>";
            $idLegajo = $this->getIdDirectory(null, $legajo, $expediente,  $idExpedient, "0", $keyPath."$idExpedient/", $conocerData[$cont], 0, 1);
//            echo "</p>idLegajo: $idLegajo</p>";
            echo "$fondo.$subFondo/$seccion/$serie.$subserie = ";
            echo "$keyPath".$idExpedient."/".$idLegajo;
            $expedientPath = $routFile."/Estructuras/CONOCER/Repositorio/1".$keyPath.$idExpedient;
            $frontPage = $this->buildFrontPage($conocerData[$cont], $expedientPath."/Plantilla.xml");
            $expedientFullPath = "$expedientPath/Plantilla.xml";
            echo " carátula  $expedientFullPath";
            $idFrontPage = $this->insertDocument($conocerData, $expediente, 0, "Carátula $expediente", "", $frontPage, $idExpedient, $expedientFullPath);
            echo "<p>idFrontPage: $idFrontPage</p>"; 
            $legajoPath = "Estructuras/CONOCER/Repositorio/1$keyPath$idExpedient/$idLegajo";
            $fileNameWithExt = $consecutivo."_".$conocerData[$cont]["$prefix"."12"];
            $fileNameExt = pathinfo($fileNameWithExt, PATHINFO_EXTENSION);
//            $fileName = $consecutivo."_".$expediente.".".$fileNameExt;
            $fileName = $this->getFileName($conocerData[$cont]);
            $filePath = "$legajoPath/$fileName";
            echo "<p>Preparando documento $fileName</p>";
            $idDocument = $this->insertDocument($conocerData[$cont], $expediente, 1, $fileName, "pdf", $frontPage, $idLegajo, $filePath);
            echo "<p>idDocument: $idDocument</p>";
            echo "---------------------------------------------<br><br>";
        }
    }
  
    private function getIdDirectory($catalogKey, $catalogKeyPath,$parentCatalogKeyPath, $idParent, $catalogType, $path,$conocerData, $isFrontPage = 0, $isLegajo = 0){
        $select = "SELECT *FROM dir_Repositorio WHERE title = '$catalogKeyPath'";
        
        if((int)$isLegajo > 0)
            $select.=" AND parent_id = $idParent";
        
        $result = $this->db->ConsultaSelect("CONOCER", $select);
        
        if($result['Estado'] != 1)
            return $result['Estado'];
        if(count($result['ArrayDatos']) > 0)
            return $result['ArrayDatos'][0]['IdDirectory'];
        else
            return $this->addDirectory ($catalogKey, $catalogKeyPath, $parentCatalogKeyPath, $idParent, $catalogType, $path, $conocerData, $isFrontPage, $isLegajo);
    }
    
    private function addDirectory($catalogKey, $catalogKeyPath, $parentCatalogKeyPath, $idParent, $catalogType, $path, $conocerData, $isFrontPage, $isLegajo){
        $prefix = $this->prefix;
        $routFile = dirname(getcwd());
        $docDisposition = array();
        $idDocDisposition = 0;
        $autoincrement = $conocerData["$prefix"."7"];
        
        if($catalogKey != null)
            $docDisposition = $this->getIdDisposition($catalogKey);
        
        if(isset($docDisposition['idDocumentaryDisposition']))
            $idDocDisposition = $docDisposition['idDocumentaryDisposition'];
        
        echo "<p>idDocDisposition $catalogKey: $idDocDisposition</p>";
        
        $fields = "parent_id, title, path, idDocDisposition, catalogKey, 
                parentCatalogKey, catalogType, isFrontPage, isLegajo";
        $values = "$idParent, '$catalogKeyPath', '$path', $idDocDisposition, 
                '$catalogKeyPath', '$parentCatalogKeyPath', '$catalogType',
                $isFrontPage, $isLegajo";
        
        if((int)$isFrontPage > 0){
            $fields.=",templateName";
            $values.=", 'Template'";
            if((int)$autoincrement > 0){
                $fields.= ", autoincrement";
                $values.= ",$autoincrement";
            }
        }
        
        $insert = "INSERT INTO dir_Repositorio ($fields) VALUES ($values)";        
        $res = $this->db->ConsultaInsertReturnId("CONOCER", $insert);
        if(!(int)$res > 0)
            return $res;
        
        $folderPath = "$routFile/Estructuras/CONOCER/Repositorio/1"."$path".$res;
        if(!file_exists($folderPath)){
            if(($mkdir = mkdir($folderPath, 0777, true)))
                echo "<p>se ha creado el path $folderPath</p>";
            else
                echo "<p>Error al crear el path $folderPath. $mkdir</p>";
        }
        return $res;
    }
    
    private function getIdDisposition($catalog){
        $select = "SELECT *FROM CSDocs_DocumentaryDisposition WHERE NameKey = '$catalog'";
        $result = $this->db->ConsultaSelect("CONOCER", $select);
        if($result['Estado'] != 1)
            return $result['Estado'];
        if(count($result['ArrayDatos'] > 0))
            return $result['ArrayDatos'][0];
        return 0;
    }
    
    private function buildFrontPage($conocerData, $expedientPath){
        $prefix = $this->prefix;
        $routFile = dirname(getcwd());
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("template");
        $root->setAttribute("templateName", "Template");
        $root->setAttribute("enterpriseKey", "CONOCER");
        $root->setAttribute("repositoryName", "Repositorio");

        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."13"], "Fondo", "Fondo", "repository", "TEXT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."14"], "Seccion", "Seccion", "repository", "TEXT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."16"], "Serie", "Serie", "repository", "TEXT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."18"], "Subserie", "Subserie", "repository", "TEXT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."36"], "Fecha_Apertura", "Fecha_Apertura", "repository", "DATE", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."38"], "Fecha_Cierre", "Fecha_Cierre", "repository", "DATE", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."23"], "Fecha_Reserva", "Fecha_Reserva", "repository", "DATE", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."24"], "Anos_Reserva", "Anos_Reserva", "repository", "INT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."22"], "Funcionario_Reserva", "Funcionario_Reserva", "repository", "TEXT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."20"], "Asunto", "Asunto", "repository", "TEXT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."19"], "Numero_Expediente", "Numero_Expediente", "repository", "TEXT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."37"], "ArchivoTramite", "ArchivoTramite", "DocumentValidity", "INT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."40"], "Concentracion", "Concentracion", "DocumentValidity", "DATE", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, $conocerData["$prefix"."34"], "Confidencial", "Confidencial", "DocumentValidity", "INT", "", "false", 0));
        $root->appendChild($this->createXmlChild($doc, "", "Fundamento_Legal", "Fundamento_Legal", "Repositorio_Fundamento_Legal", "INT", "", "true", 0));
        $doc->appendChild($root);
        
//        foreach ($doc->getElementsByTagName("field") as $value){
//            echo "------------------------------------------";
//            foreach($value->childNodes as $field){
//                echo "<p>$field->nodeName $field->nodeValue</p>";
//            }
//        }
        if(!file_exists(dirname($expedientPath)))
            mkdir (dirname ($expedientPath));
        $doc->save($expedientPath);
        return $doc;
    }
    
    private function createXmlChild($doc, $fieldValue, $columnName, $fieldName,  $tableName,  $fieldType, $fieldLength, $isCatalog, $catalogOption){
        $child = $doc->createElement("field");
        $fieldValueXml  =     $doc->createElement("fieldValue", $fieldValue);
        $columnNameXml  =     $doc->createElement("columnName",$columnName);
        $fieldNameXml   =     $doc->createElement("fieldName", $fieldName);
        $tableNameXml   =     $doc->createElement("tableName", $tableName);
        $fieldTypeXml   =     $doc->createElement("fieldType", $fieldType);
        $fieldLengthXml =     $doc->createElement("fieldLength", $fieldLength);
        $isCatalogXml   =     $doc->createElement("isCatalog", $isCatalog);
        $catalogOptionXml = $doc->createElement("catalogOption", $catalogOption);
        $child->appendChild($fieldValueXml);
        $child->appendChild($columnNameXml);
        $child->appendChild($fieldNameXml);
        $child->appendChild($tableNameXml);
        $child->appendChild($fieldTypeXml);
        $child->appendChild($fieldLengthXml);
        $child->appendChild($isCatalogXml);
        $child->appendChild($catalogOptionXml);
        return $child;
    }
        
    private function insertDocument(array $conocerData, $expedient, $isDocument, $fileName, $fileType, DOMDocument $frontPage, $idDirectory, $filePath){
//        echo "<p>Insertando $fileName</p>";
        if($isDocument){    /* Cuando se va a insertar un documento */
            if(!$this->moveDocument($conocerData, $fileName, $filePath)){
                echo "<p>Ignorando carga de $fileName ......</p>";
                return 0;
            }
        }
        else{   /* Cuando se va a insertar una caratula */
        }
        $prefix = $this->prefix;
        $idFile = $this->getDocument($fileName, $expedient);
        
        if(is_numeric($idFile)){
            if((int)$idFile > 0){
                echo "<p>Existe el documento o plantilla $fileName</p>";
                return $idFile;
            }
        }
        else{
             echo "<p>Error al buscar el documento $fileName: $idFile</p>";       
             return 0;
        }
        
        $fechaIngreso   = date("Y-m-d");
        $queryBuilded = $this->getQueryInsert($frontPage);
        $full = $queryBuilded['full'];
        $fields = "IdDirectory, IdEmpresa, TipoArchivo, RutaArchivo, UsuarioPublicador, 
                FechaIngreso, NombreArchivo ".$queryBuilded['fields']. ", Full";
        $values = "$idDirectory, 1, '$fileType', '$filePath', 'root', 
                '$fechaIngreso', '$fileName'  ".$queryBuilded['values'].",  '$full'";
        $insert = "INSERT INTO Repositorio 
                ($fields) 
                VALUES 
                ($values)";        
//        echo "<p>$insert</p>";
        $newIdFile = $this->db->ConsultaInsertReturnId("CONOCER", $insert);
        
        if(!(int)$newIdFile > 0){
            echo "<p><b>Error</b> al insertar a $fileName</p> $newIdFile <br>";
            return 0;
        }
        
        $idGlobal = $this->insertToGlobal($frontPage, $newIdFile, $idDirectory, $fileName, $fileType, $filePath);
        echo "<p>idGlobal: $idGlobal</p>";                
        
        return $newIdFile;
    }
    
    private function moveDocument($conocerData, $fileName, $filePath){
        $prefix = $this->prefix;
        $serverRout = dirname(getcwd());        
        $consecutivo = $conocerData["$prefix"."7"];
        $disk = $conocerData["$prefix"."9"];
        $originPath = $conocerData["$prefix"."10"];
        $fileNameOnly = pathinfo($conocerData["$prefix"."12"], PATHINFO_FILENAME);
        $originFullPathWithoutExt = $disk."$originPath/$fileNameOnly";
        $originFullPathWithExt1 = $this->filesPath."/$originFullPathWithoutExt.pdf";
        $originFullPathWithExt2 = $this->filesPath."/$originFullPathWithoutExt.PDF";
//        echo "<p>origen: $originFullPathWithExt1</p>";
//        echo "<p>Preparando para mover documento $fileName</p>";
//        echo "<p>destino: $filePath</p>";
        
        if(!file_exists("$serverRout/".dirname($filePath)))
            mkdir ("$serverRout/".dirname($filePath), 0777, true);
        
        if(!file_exists($originFullPathWithExt1)){
            if(!file_exists($originFullPathWithExt2)){
                echo "<p>No existe $originFullPathWithExt1</p>";
                echo "<p>No existe2 $originFullPathWithExt2</p>";
                return 0;
            }
            else{
                echo "<p>Moviendo2 documento $originFullPathWithExt2</p>";
                $filePath = "$serverRout/".dirname($filePath)."/".$consecutivo."_".  basename($originFullPathWithExt2);
                echo "<p>Path destino : ".  $filePath."</p>";
                copy($originFullPathWithExt2, $filePath);
            }
        }
        else{
            echo "<p>Moviendo1 documento $originFullPathWithExt1</p>";
            $filePath = "$serverRout/".$filePath.dirname($filePath)."/$consecutivo"."_".  basename($originFullPathWithExt1);
            echo "<p>Path destino : ".  $filePath."</p>";
            copy($originFullPathWithExt1, $filePath);
        }
        return 1;
    }
    
    private function getFileName($conocerData){
        $prefix = $this->prefix;
        $consecutivo = $conocerData["$prefix"."7"];
        $disk = $conocerData["$prefix"."9"];
        $originPath = $conocerData["$prefix"."10"];
        $fileNameOnly = pathinfo($conocerData["$prefix"."12"], PATHINFO_FILENAME);
        $originFullPathWithoutExt = "$disk$originPath/$fileNameOnly";
        $originFullPathWithExt1 = $this->filesPath."/$originFullPathWithoutExt.pdf";
        $originFullPathWithExt2 = $this->filesPath."/$originFullPathWithoutExt.PDF";
        
        if(!file_exists($originFullPathWithExt1)){
            if(!file_exists($originFullPathWithExt2))
                return null;
            else
                return $consecutivo."_".  basename($originFullPathWithExt2);
        }
        else
            return $consecutivo."_".  basename($originFullPathWithExt1);
    }
    
    private function insertToGlobal($frontPage, $idFile, $idDirectory, $fileName, $fileType, $filePath){
        $queryBuilded = $this->buildQueryForGlobal($frontPage, $idFile, $idDirectory, $fileName, $fileType, $filePath);
//        echo "<p>".$queryBuilded['insert']."</p>";
        $result = $this->db->ConsultaInsertReturnId("CONOCER", $queryBuilded['insert']);
        return $result;
    }    
    
    private function getDocument($fileName, $expedient){
        $select = "SELECT *FROM Repositorio WHERE  NombreArchivo = '$fileName' AND Numero_Expediente = '$expedient'";
        $result = $this->db->ConsultaSelect("CONOCER", $select);
        if($result['Estado'] != 1)
            return $result['Estado'];
        if(count($result['ArrayDatos']) == 0)
            return 0;
        else
            return $result['ArrayDatos'][0]['IdRepositorio'];
    }
    
    private function getQueryInsert($frontPage){
        $fechaIngreso   = date("Y-m-d");
        $full = "root, $fechaIngreso, ";
        $fields = "";
        $values = "";
        $fieldValue = "";
        $fieldName = "";
        $fieldType = "";
        foreach ($frontPage->getElementsByTagName("field") as $value){
//            echo "------------------------------------------";
            foreach($value->childNodes as $field){
//                echo "<p>$field->nodeName $field->nodeValue</p>";
                
//                echo "<p> $field->nodeName</p>";
                if(strcasecmp($field->nodeName, "fieldValue")==0){
                        $fieldValue = $field->nodeValue;
                        $full.= " $field->nodeValue, ";
//                        echo "<p>fieldValue: $fieldValue</p>";
                }
                else if(strcasecmp($field->nodeName, "columnName")==0){
                    $fields.=", $field->nodeValue";
                    $fieldName = $field->nodeValue;
//                    echo "columnName $fieldName";
                }
                else if (strcasecmp($field->nodeName, "fieldType")==0){
                    $fieldType = $field->nodeValue;
//                    echo "<p>Obteniendo valor $fieldName:   $fieldType    $fieldValue</p>";
                    $fieldValue = DataBase::FieldFormat($fieldValue, $fieldType);
                    $values.=", $fieldValue";
                }
            }
        }
        
        return array("fields" => $fields, "values" => $values, "full" => $full);
    }   
    
    private function buildQueryForGlobal($frontPage, $idFile, $idDirectory, $fileName, $fileType, $filePath){
        $repositoryQuery    = $this->getQueryInsert($frontPage);
        $full               = $repositoryQuery['full'];
        $fechaIngreso       = date("Y-m-d");
        $fields = "IdFile, IdEmpresa, IdRepositorio, IdDirectory, NombreEmpresa,
                NombreRepositorio, NombreArchivo, TipoArchivo, RutaArchivo, UsuarioPublicador,
                FechaIngreso, Full";
        $values = "$idFile, 1, 2, $idDirectory, 'CONOCER', 
                'Repositorio', '$fileName', '$fileType', '$filePath', 'root',
                 '$fechaIngreso', '$full'";
        $insert = "INSERT INTO RepositorioGlobal ($fields) VALUES ($values)";
        
        return array("insert" => "$insert", "full" => $full);
    }
}

$carga = new Carga();
$carga->start();
