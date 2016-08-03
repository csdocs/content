
/* global BotonesWindow, PDFJS, Wvisor, minWvisor, minHvisor, Hvisor */
var iv1;   /* Objeto que controla el api del visor de imágenes */

var Viewer = function(){
    /**
     * @description Se registra la consulta del documento en el log del sistema.
     * @returns {undefined}
     */
    this.registerDocumentInLog = function (documentName) {
        $.ajax({
            async: true,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Viewer.php",
            data: {option: "registerDocumentInLog",documentName: documentName},
            success: function (xml) {
                if ($.parseXML(xml) === null) {
                    return errorMessage(xml);
                } else
                    xml = $.parseXML(xml);

                $(xml).find("Error").each(function (){
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
    };
    
    this.registerViewerCloseEvent = function(documentName){
        $.ajax({
            async: true,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Viewer.php",
            data: {option: "registerViewerCloseEvent",documentName: documentName},
            success: function (xml) {
                if ($.parseXML(xml) === null) {
                    return errorMessage(xml);
                } else
                    xml = $.parseXML(xml);

                $(xml).find("Error").each(function (){
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
    }
}
/******************************************************************************
 * 
 * @param {type} tipo
 * @param {type} IdGlobal
 * @param {type} IdFile
 * @param {type} Source
 * @returns {undefined}
 */
function Preview(tipo, IdGlobal, IdFile,  Source)
{        
    switch (Source)
    {
        case 'Content':
            
            DocEnvironment = new ClassDocumentEnvironment(Source, IdGlobal, IdFile);         
            DocEnvironment.GetProperties();
            break;
            
        case 'Download':            
            DocEnvironment = new ClassDocumentEnvironment(Source, IdGlobal, IdFile);         
            DocEnvironment.GetProperties();
            break;
    }
    
    tipo = String(tipo.toLowerCase());
    
    var supportedImages = getSupportedImages();
    
    if(supportedImages[tipo] !== undefined){
        var functionToExecute = supportedImages[tipo];
        var documentData = imageProcessingToConvert(functionToExecute, DocEnvironment);
      
        if(documentData.viewerType !== undefined){
            DocEnvironment.FileRoute = documentData.tempPath;
            if(documentData.viewerType === 'imageViewer')
                imagePreview(DocEnvironment);
            else if(documentData.viewerType === 'pdfViewer')
                pdfViewer(DocEnvironment);
        }
    }
    
    if(tipo ==='jpg' || tipo==='png' || tipo==='jpge')
        imagePreview(DocEnvironment);
        
    if(tipo==='pdf')
        pdfViewer(DocEnvironment);
    
}
/*******************************************************************************
 * @description Obtiene los formatos de imagenes soportados para su conversión.
 * @returns {type} Retorna las imágenes que CSDocs puede procesar para su visualización;
 *******************************************************************************/
function getSupportedImages(){
    var supportedImages = {};
    
    supportedImages['tif'] = 'processTif';
    supportedImages['tiff'] = 'processTif';
    
    return supportedImages;
}

/*******************************************************************************
* 
*@param {type} functionToExecute Tipo de imagén recibida para ser procesada.
*@param {type} DocEnvironment Objeto que contiene los datos del documento.
* @returns {type viewerInfo Regresa un objeto con la ruta temporal del documento
*               y el tipo de visor que se debe utilizar.
********************************************************************************/
function imageProcessingToConvert(functionToExecute, DocEnvironment){
    var viewerInfo = {};
    
    $.ajax({
       async:false, 
       cache:false,
       dataType:'html', 
       type: 'POST',   
       url: "php/Viewer.php",
       data: {'option':'imageProcessingToConvert', 'filePath':DocEnvironment.FileRoute, functionToExecute:functionToExecute}, 
       success:  function(response)
       {   
           if($.parseXML( response )===null){ errorMessage(response); return 0;}else xml=$.parseXML( response );
           
           if($(xml).find("tempPath").length > 0){
                viewerInfo.tempPath = $(xml).find('tempPath').text();
                viewerInfo.viewerType = $(xml).find('viewerType').text();
           }

            $(xml).find("Error").each(function(){
                var mensaje = $(this).find('Mensaje').text();
                errorMessage(mensaje);
                return 0;
            });
       },
       beforeSend:function(){          },
       error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
       });
       
       return viewerInfo;
    
}


function imagePreview(DocEnvironment){
    console.log(DocEnvironment);
    var RutaArchivoServer = location.host+'/'+DocEnvironment.FileRoute;
    console.log(RutaArchivoServer);
    $('#div_vista_previa').remove();

    $('body').append('<div id = "div_vista_previa"></div>');
    $('#div_vista_previa').append('<div id = "viewerImageNavBar" class = "viewerImageNavBar"></div>');
    $('#div_vista_previa').append('<div id = "viewerImageBody" class = "viewerImageBody">\n\
        <div class ="NotesZone"></div>\n\
    </div>');
        
        
    $('#div_vista_previa').dialog({
        responsive:true, fluid:true ,width:Wvisor, 
        height:Hvisor, minWidth:380, minHeight:minHvisor, 
        title:"Vista Previa", 
        closeOnEscape:true,
        resize:function(){
            if($(this).width() <= 400){
//                    console.log("<= 400");
                if($('#viewerImageNavBar nav.responsive').length === 0){
                    $('#viewerImageNavBar').empty();
                    insertResponsiveMenuToImageViewer();
                    setActionToImageViewer(iv1);

                }
            }
            else if($(this).width() > 400){
//                    console.log("> 400");
                if($('#viewerImageNavBar nav.responsive').length > 0){
                        $('#viewerImageNavBar').empty();
                        insertMenuToImageViewer();
                        setActionToImageViewer(iv1);
                    }
            }
        },
        open:function(){
            $('#div_vista_previa.ui-dialog-content').css({"padding": "0em"});
            $('#div_vista_previa.ui-dialog').css({"padding": "0em"});

            /* Se define el tipo del menú: responsive ó ampliado */
            if($(this).width() <= 400)
                insertResponsiveMenuToImageViewer();
            else
                insertMenuToImageViewer();
        },
        close:function(){
            iv1 = undefined;
        }
    }).dialogExtend(BotonesWindow);
                
/****************   Inicio de API para mostrar las imágenes ********************/                
                
        iv1 = $("#viewerImageBody").iviewer({
            src: RutaArchivoServer,
            update_on_resize: true,
            zoom_animation: true,
            mousewheel: true,
//            onDrag: function(ev, coords) { },
            onZoom: function(ev, coords){ 
                var zoomPercent = $(this).iviewer("update_status"); 
                $('#viewerImageNavBar input.iviewer_zoom_status').val(zoomPercent+"%");   
            },
            onFinishLoad: function(){
                var zoomPercent = $(this).iviewer("update_status"); 
                $('#viewerImageNavBar input.iviewer_zoom_status').val(zoomPercent+"%");
            }
        });

        $('#viewerImageBody .iviewer_common').hide();       /* Se esconden iconos ingresados por el api */
        
        setActionToImageViewer();

        if($.type(DocEnvironment)==='object'){
            Notes = new ClassNotes('imageViewer',DocEnvironment.IdRepository, DocEnvironment.RepositoryName, DocEnvironment.IdFile, DocEnvironment.FileName, DocEnvironment.IdGlobal);
            Notes.registerPagesWithNotes();
            Notes.HideAndShowNoteIcon();
        }
            
}

function setActionToImageViewer(){
    $("#viewerImageNavBar .liPageUpIcon").click(function(){iv1.iviewer('angle', +90); });
    $("#viewerImageNavBar .liPageDown").click(function(){iv1.iviewer('angle', -90); });
    $("#viewerImageNavBar .liZoomDown").click(function(){ iv1.iviewer('zoom_by', 1); });
    $("#viewerImageNavBar .liZoomUp").click(function(){ iv1.iviewer('zoom_by', -1); });
    $("#viewerImageNavBar .liResizeFull").click(function(){
        iv1.iviewer('fit'); 
        var zoomPercent = iv1.iviewer("update_status"); 
        $('#viewerImageNavBar input.iviewer_zoom_status').val(zoomPercent+"%"); 
    });
    
    var zoomPercent = $(iv1).iviewer("update_status"); 
    
    $('#viewerImageNavBar input.iviewer_zoom_status').val(zoomPercent+"%");
    $('#viewerImageNavBar .liNotes').click(function(){
        Notes.ShowListOfNotes();
    });
        
//        $('#viewerImageNavBar .iviewer_zoom_status').click(function(){var zommObject = iv1.iviewer("update_status"); console.log(zommObject);});
//        $("#orig").click(function(){ iv1.iviewer('set_zoom', 100); });
//        $("#update").click(function(){ iv1.iviewer('update_container_info'); });
}

function insertResponsiveMenuToImageViewer(){
    $('#viewerImageNavBar').append('\n\
        <nav class="navbar navbar-inverse responsive">\n\
            <ul class="nav navbar-nav">\n\
                <li class = "liZoomDown"><a href="#"><span class = "zoomDown glyphicon glyphicon-zoom-in" /></a></li>\n\
                <li class = "liZoomUp"><a href="#"><span class = "zoomUp glyphicon glyphicon glyphicon-zoom-out" /></a></li>\n\
                <li class = "dropdown">\n\
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Más<span class="caret"></span></a>\n\
                    <ul class="dropdown-menu navbar-inverse">\n\
                        <li class = "liPageUpIcon"><a href="#">Izquierda<span class = "glyphicon pageUpIcon" /></a></li>\n\
                        <li class = "liPageDown"><a href="#">Derecha<span class = "glyphicon pageDownIcon" /></a></li>\n\
                        <li class = "liResizeFull"><a href="#">100%<span class = "glyphicon glyphicon-resize-full" /></a></li>\n\
                        <li class = "liNotes"><a href="#"><span class = "glyphicon notesIcon"></span>Nueva Nota</a></li>\n\
                    </ul>\n\
                </li>\n\
            </ul>\n\
            <div class="navbar-form navbar-left" role="search">\n\
                <div class="form-group">\n\
                    <input type="text" class="iviewer_zoom_status" disabled>\n\
                </div>\n\
            </div>\n\
        </nav>\n\
    ');
    
}

/* Menú ampliado */
function insertMenuToImageViewer(){
    $('#viewerImageNavBar').append('\n\
        <nav class="navbar navbar-inverse">\n\
            <ul class="nav navbar-nav">\n\
                <li class="liPageUpIcon"><a href="#"><span class = "glyphicon pageUpIcon" /></a></li>\n\
                <li class="liPageDown"><a href="#"><span class = "glyphicon pageDownIcon" /></a></li>\n\
                <li class="liZoomDown"><a href="#"><span class = "zoomDown glyphicon glyphicon-zoom-in" /></a></li>\n\
                <li class="liZoomUp"><a href="#"><span class = "zoomUp glyphicon glyphicon glyphicon-zoom-out" /></a></li>\n\
                <li class="liResizeFull"><a href="#"><span class = "glyphicon glyphicon-resize-full" /></a></li>\n\
                <li class="liNotes"><a href="#"><span class = "glyphicon notesIcon"></span></li>\n\
            </ul>\n\
            <div class="navbar-form navbar-left" role="search">\n\
                <div class="form-group">\n\
                    <input type="text" class="iviewer_zoom_status" disabled>\n\
                </div>\n\
            </div>\n\
        </nav>\n\
    ');
    
}

function pdfViewer(DocEnvironment){
//    PDFJS.workerSrc = 'apis/pdf.js-master/src/worker_loader.js';
    var preview = new Viewer();
    ArrayNotes=new Array();
    PaginaActual=0;
    ArrayObteinNotes=0;
//            alert(DocumentEnvironment+DocumentEnvironment.FileRoute+tipo+IdGlobal+IdFile+Source);
    DEFAULT_URL = DocEnvironment.FileRoute;
    PDFView.open(DocEnvironment.FileRoute, 0);     
    preview.registerDocumentInLog(DocEnvironment.FileName)
    if($.type(DocEnvironment)==='object');
        Notes = new ClassNotes('pdfViewer', DocEnvironment.IdRepository, DocEnvironment.RepositoryName, DocEnvironment.IdFile, DocEnvironment.FileName, DocEnvironment.IdGlobal);

    $('#DivPdfViewer').dialog({width:Wvisor, height:Hvisor, minWidth:minWvisor, 
        minHeight:minHvisor, title:"Vista Previa", 
        open:function(){
            Notes.registerPagesWithNotes();
        },
        close: function(){
           var viewer = new Viewer();
           viewer.registerViewerCloseEvent(DocEnvironment.FileName)
        }
    }).dialogExtend(BotonesWindow);
}

