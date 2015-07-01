/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global EnvironmentData, BotonesWindow, ConsoleSettings, LanguajeDataTable */

var EnterprisedT, EnterpriseDT;

$(document).ready(function(){
    $('.LinkEnterprise').click(function(){
        var Enterprise = new ClassEnterprise();
        Enterprise.BuildConsole();
    });
});
var ClassEnterprise = function()
{
    var self = this;
    
    _DisplayWindowFields = function()
    {
        var fieldsManager = new FieldsManager();
        fieldsManager.BuildWindow();
        
        var buttons = {"Cancelar": function(){$(this).remove();},
        "Agregar":{text:"Agregar", click:function(){_ValidateNewField();}}};
        
        $('#DivFormsNewField').dialog('option','buttons', buttons);
    };
    
    _ValidateNewField = function()
    {        
        var fieldsManager = new FieldsManager();
        var FieldsValues = fieldsManager.GetFieldsValues(EnterprisedT, EnterpriseDT);
        if(!$.isPlainObject(FieldsValues))    
            return 0;
        
        _AddNewField(FieldsValues);
        
    };
    
    _AddNewField = function(FieldsValues)
    {
        var data = {option:'NewField', DataBaseName:EnvironmentData.DataBaseName, IdUser:EnvironmentData.IdUsuario, UserName:EnvironmentData.NombreUsuario, FieldName:FieldsValues.FieldName, FieldType: FieldsValues.FieldType, FieldLength:FieldsValues.FieldLength, RequiredField:FieldsValues.RequiredField};
                
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Enterprise.php",
        data: data, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

        if($(xml).find('AddedField').length>0)
        {
            var Mensaje = $(xml).find('Mensaje').text();
            Notificacion(Mensaje);
            
            /*  Se reconstruye la ventana para agregar un nuevo campo y se selecciona el campo agregado sobre la tabla */
            var fieldsManager = new FieldsManager();
            fieldsManager.BuildWindow();

            var buttons = {"Cancelar": function(){$(this).remove();},   "Agregar":{text:"Agregar", click:function(){_ValidateNewField();}}};

            $('#DivFormsNewField').dialog('option','buttons', buttons);

            $('#TableEnterpriseDetail tr').removeClass('selected');

            var FieldProperties = [FieldsValues.FieldName, FieldsValues.FieldType, FieldsValues.FieldLength, FieldsValues.RequiredField];

            var ai = EnterpriseDT.row.add(FieldProperties).draw();
            var n = EnterprisedT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('class',"selected");
                
        }
            
        $(xml).find("Error").each(function()
        {
            var $Error=$(this);
            var mensaje=$Error.find("Mensaje").text();
            Error(mensaje);
        });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown) {Error(textStatus +"<br>"+ errorThrown);}
        });           
        
    };
    
    _DeleteField = function()
    {
        console.log("_DeleteField");
        
        var FieldSelected = $('#TableEnterpriseDetail tr.selected');
        var FieldName, data;
        
        if(FieldSelected.length!==1)
            return Advertencia("Debe seleccionar un campo");
        
        
        
         EnterprisedT.$('tr.selected').each(function()
        {
            var position = EnterprisedT.fnGetPosition(this); // getting the clicked row position
            FieldName = EnterprisedT.fnGetData(position)[0];
        });
        
        data = {option:"DeleteField",DataBaseName:EnvironmentData.DataBaseName, IdUser:EnvironmentData.IdUsuario, UserName: EnvironmentData.NombreUsuario, IdGroup : EnvironmentData.IdGrupo, GroupName : EnvironmentData.NombreGrupo, FieldName:FieldName};
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Enterprise.php",
        data: data, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

            if($(xml).find('DeletedField').length>0)
            {
                var Mensaje = $(xml).find('Mensaje').text();
                Notificacion(Mensaje);
                EnterpriseDT.row('tr.selected').remove().draw( false );  
                EnterprisedT.$('tbody tr:first').click();
            }
            
            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var mensaje=$Error.find("Mensaje").text();
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown) {Error(textStatus +"<br>"+ errorThrown);}
        });           
    };
    
};



ClassEnterprise.prototype.BuildConsole = function()
{
    var self = this;
    
    $('#DivEnterprisesManager').remove();
    $('body').append('\n\
        <div id="DivEnterprisesManager">\n\
        <div class="menu_lateral">\n\
                <div id="AccorEnterpriseManager">\n\
                    <div>\n\
                      <h3><a href="#">Empresas</a></h3>\n\
                      <div id = "ConsoleEnterpriseManager">\n\
                          <table class="TableInsideAccordion">\n\
                          <tr class = "tr_EnterpriseStructure" title="Administracion de Empresas">\n\
                                  <td><img src="img/enterprise.png" ></td>\n\
                                  <td>Estructura</td>\n\
                              </tr>\n\
                              <tr class = "tr_EnterpriseList" title="Empresas">\n\
                                  <td><img src="img/AddEnterprise.png" ></td>\n\
                                  <td>Empresas</td>\n\
                              </tr>\n\
                          </table>\n\
                      </div>\n\
                    </div>\n\
                </div>\n\
        </div>\n\
        <div class="work_space" id="EnterpriseWS"></div>\n\
    </div>');
    
    $("#AccorEnterpriseManager").accordion({ header: "h3", collapsible: true,heightStyle: "content" });
    
    $('#DivEnterprisesManager').dialog({title:"Consola de Empresas"},ConsoleSettings).dialogExtend(BotonesWindow);
    
     /********* Efectos sobre tabla dentro de acordeÃ³n ***********/
    $('#DivEnterprisesManager table').on( 'click', 'tr', function ()
    {
        var active = $('#DivEnterprisesManager table tr.TableInsideAccordionFocus');                
        $('#DivEnterprisesManager table tr').removeClass('TableInsideAccordionFocus');
        $('#DivEnterprisesManager table tr').removeClass('TableInsideAccordionActive');
        $(active).addClass('TableInsideAccordionFocus');
        $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        $(this).addClass('TableInsideAccordionActive');     
    });
    $('#DivEnterprisesManager table tr').hover(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).addClass('TableInsideAccordionHoverWithClass');
        else
            $(this).addClass('TableInsideAccordionHoverWithoutClass');
    });
    $('#DivEnterprisesManager table tr').mouseout(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).removeClass('TableInsideAccordionHoverWithClass');
        else
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
    });
    
    /* Fin de Efectos  */
    
    $('.tr_EnterpriseStructure').click(function()
    {
        self.AdminStructure();
    });
    $('.tr_EnterpriseList').click(function()
    {
        self.DisplayEnterprises();
    });
    
    $('.tr_EnterpriseStructure').click();
};

ClassEnterprise.prototype.AdminStructure = function()
{
    var self = this;
    
    $('#EnterpriseWS').empty();
    $('#EnterpriseWS').append('<div class="titulo_ventana">Estructura de Empresas</div>');
    $('#EnterpriseWS').append('<div class="Loading" id = "IconWaitingEnterprise"><img src="../img/loadinfologin.gif"></div>');      

    var EnterpriseDetail = GeStructure('Empresa');
    
    $('#EnterpriseWS').append('<table id = "TableEnterpriseDetail" class = "display hover"></table>');
    $('#TableEnterpriseDetail').append('<thead><tr><th>Campo</th><th>Tipo</th><th>Longitud</th><th>Requerido</th></tr></thead>');

    EnterprisedT = $('#TableEnterpriseDetail').dataTable(
    {
       'bPaginate':false, 'bInfo':false, bFilter: false, "bSort": false, "autoWidth" : false, "oLanguage":LanguajeDataTable,"dom": 'lfTrtip',
        "tableTools": {
            "aButtons": [
                {"sExtends":"text", "sButtonText": "Agregar Campo", "fnClick" :function(){_DisplayWindowFields();}},
                {"sExtends":"text", "sButtonText": "Eliminar Campo", "fnClick" :function(){_DeleteField();}},
                {"sExtends": "copy","sButtonText": "Copiar al portapapeles"},
                {
                    "sExtends":    "collection",
                    "sButtonText": "Guardar como...",
                    "aButtons":    [ "csv", "xls", "pdf" ]
                }                          
            ]
        }                              
    });  

    $('div.DTTT_container').css({"margin-top":"1em"});
    $('div.DTTT_container').css({"float":"left"});

    EnterpriseDT = new $.fn.dataTable.Api('#TableEnterpriseDetail');

    $('#TableEnterpriseDetail tbody').on( 'click', 'tr', function ()
        {
            EnterpriseDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        } );  

    /* Llenado de la tabla con los campos del repositorio */
    $(EnterpriseDetail).find('Campo').each(function()
    {
        var FieldName = $(this).find('name').text();
        var FieldType = $(this).find('type').text();
        var FieldLength = $(this).find('long').text();
        var RequiredField = $(this).find('required').text();

        if(RequiredField==='' || RequiredField==='false')
            RequiredField = "No";
        else
            if(RequiredField==='true')
                RequiredField = "Si";

        var data = [FieldName, FieldType, FieldLength, RequiredField];

        var ai = EnterpriseDT.row.add(data).draw();
        var n = EnterprisedT.fnSettings().aoData[ ai[0] ].nTr;
//        n.setAttribute('id',self.AutoincrementId);

    });
        
    EnterprisedT.$('tbody tr:first').click();

    $('#IconWaitingEnterprise').remove();
    
};

ClassEnterprise.prototype.DisplayEnterprises = function()
{
    console.log("DisplayEnterprises");
    var self = this;
    
    $('#EnterpriseWS').empty();
    $('#EnterpriseWS').append('<div class="titulo_ventana">Empresas del Sistema</div>');
    $('#EnterpriseWS').append('<div class="Loading" id = "IconWaitingEnterprises"><img src="../img/loadinfologin.gif"></div>');
    
    var th = '<th>Clave</th><th>Nombre</th>';  /* Campos de default */
    var EnterpriseStructure = GeStructure('Empresa');    

    $(EnterpriseStructure).find('Campo').each(function()
    {
        console.log(this);
        var FieldName = $(this).find('name').text();
        var FieldType = $(this).find('type').text();
        var FieldLength = $(this).find('long').text();
        var RequiredField = $(this).find('required').text();
        
        th+="<th>"+FieldName+"</th>";
    });
    
    $('#EnterpriseWS').append('<table id = "EnterprisesTable" class = "display hover"><thead>'+th+'</thead></table>');
    
    EnterprisedT = $('#EnterprisesTable').dataTable(
    {
       'bPaginate':false, 'bInfo':false, bFilter: false, "bSort": false, "autoWidth" : false, "oLanguage":LanguajeDataTable,"dom": 'lfTrtip',
        "tableTools": {
            "aButtons": [
                {"sExtends":"text", "sButtonText": "Nuevo", "fnClick" :function(){}},
                {"sExtends":"text", "sButtonText": "Editar", "fnClick" :function(){}},
                {"sExtends":"text", "sButtonText": "Eliminar", "fnClick" :function(){}},
                {"sExtends": "copy","sButtonText": "Copiar al portapapeles"},
                {
                    "sExtends":    "collection",
                    "sButtonText": "Guardar como...",
                    "aButtons":    [ "csv", "xls", "pdf" ]
                }                          
            ]
        }                              
    });  

    $('div.DTTT_container').css({"margin-top":"1em"});
    $('div.DTTT_container').css({"float":"left"});

    EnterpriseDT = new $.fn.dataTable.Api('#EnterprisesTable');
    
    $('#EnterprisesTable tbody').on( 'click', 'tr', function ()
    {
        EnterpriseDT.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');
    } );  
            
    /* Se obtiene el listado de empresas y la estructura para ser agregadas a la tabla */
    
    var Enterprises = self.GetEnterprises();
        
    $(Enterprises).find('Enterprise').each(function()
    {
        var Enterprise = $(this);
        
        var IdEnterprise = $(this).find('IdEmpresa').text();
        var EnterpriseKey = $(this).find('ClaveEmpresa').text();
        var EnterpriseName = $(this).find('NombreEmpresa').text();
        
        var data =  [EnterpriseKey, EnterpriseName];
        
        /* Campos definidos por el usuario */
        $(EnterpriseStructure).find('Campo').each(function()
        {
            var FieldName = $(this).find('name').text();
            var FieldType = $(this).find('type').text();
            var FieldLength = $(this).find('long').text();
            var RequiredField = $(this).find('required').text(); 
            var FieldValue = $(Enterprise).find(FieldName).text();
            
            data[data.length] = [FieldValue];
        });
        
        var ai = EnterpriseDT.row.add(data).draw();
        var n = EnterprisedT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('id', IdEnterprise);
        
    });   
    
    EnterprisedT.$('tbody tr:first').click();
    
    $('#IconWaitingEnterprises').remove();
};



ClassEnterprise.prototype.GetEnterprises = function()
{
    var RepositoriesXml = 0;
    var data = {option:"GetEnterprises", DataBaseName:EnvironmentData.DataBaseName, IdUser:EnvironmentData.IdUsuario, UserName:EnvironmentData.NombreUsuario};
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Enterprise.php",
    data: data, 
    success:  function(xml)
    {            
        if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

        RepositoriesXml = xml;

        $(xml).find("Error").each(function()
        {
            var $Error=$(this);
            var estado=$Error.find("Estado").text();
            var mensaje=$Error.find("Mensaje").text();
            Error(mensaje);
        });                 

    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown) {Error(textStatus +"<br>"+ errorThrown);}
    });             

    return RepositoriesXml;
};