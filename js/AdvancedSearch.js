/* 
 * Copyright 2017 daniel.
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

var AdvancedSearch = function () {
    this.init = function () {
        console.log("init Advance Search");
        setControls();
        setSearcherWordsTableContainer();
    }
    
    var setControls = function(){
        var container = $('<div>', {class: "col-xs-12 col-sm-12 col-md-12 col-lg-12"});
        var optionControls = searchOptionControls(container);
        
        container.append(optionControls);
        
        $('#controlsAdvanceSearchContainer').append(container);
    }
    
    var searchOptionControls = function(container){
        var formInline = $('<div>', {class: "form-inline"});
        var label = $('<label>').append("Filtro");
        var select = $('<select>', {class: "form-control", id: "advanceSarchOptions"});
        var formGroup = $('<div>', {class: "form-group"}).append(label).append(select);
        var textForm = $('<input>', {class: "form-control", id: "AdvancedSearchWord", placeholder: "Bucar..."});
        var button = $('<button>', {class: "btn btn-primary", id: ""}).append('<span class = "glyphicon glyphicon-plus" />');

        setSearchOptions(select);
        formInline.append(formGroup);
        container.append(formInline);

        formGroup = $('<div>', {class: "form-group"});
        formGroup.append(textForm);
        formGroup.append(button);
        formInline.append(formGroup);
        container.append(formInline);

        button.on("click", addWordAdvanceSearch);

        textForm.keydown(function (event) {
            console.log("keydown");
            if (event.which === 13)
                addWordAdvanceSearch();
        });

    };
    
    var getLogicOperator = function(){
        return [
            {text: "AND", value: "+", position: "begin", description: "Debe estar presente en cada resultado"},
            {text: "NOT", value: "-", position: "begin", description: "No debe estar presente en cada resultado"},
            {text: "*", value: "*", position: "last", description: "Todas las coincidencias"},
        ];
    }
    
    var setSearchOptions = function(select){
        var logicOperators = getLogicOperator();
        var dateFields = getDateFieldsByRepository();
        console.log(dateFields);
        $(logicOperators).each(function(){
            var option = $('<option>', {type: "logic" ,value: this.value, word: this.text}).append(this.text);
            select.append(option);
        });

        $(dateFields).each(function(){
            var option = $('<option>', {type: "date", value: this.name, repositoryName: this.repositoryName
                , idRepository: this.idRepository,  word: this.name}).append(this.name + " ("+this.repositoryName+")");
            select.append(option);
        });
    }

    var getDateFieldsByRepository = function(){
        var fields = getFieldList();

        return fields;
    };
    
    var getFieldList = function(){
        var repositories = getRepositoriesByCompany();
        var fields = [];

        $(repositories).find("repository").each(function(){
            var repositoryName = $(this).find("NombreRepositorio").text();
            var idRepository = $(this).find("IdRepositorio").text();
            var repositoryFields = GeStructure(repositoryName);
            var dateFields = filterFieldsByDate(idRepository, repositoryName, repositoryFields);

            if(dateFields.length > 0) {
                fields = fields.concat(dateFields);
            }
        });
        
        return fields;
    }

    var filterFieldsByDate = function(idRepository, repositoryName, repositoryFields){
        var dateFields = [];
        $(repositoryFields).find("Campo").each(function(){
            var type = $(this).find("type").text();
            var name = $(this).find("name").text();

            if(String(type) == "date"){
                dateFields.push({type: type, name: name, idRepository: idRepository, repositoryName: repositoryName});
            }

        });

        return dateFields;
    }

    var setSearcherWordsTableContainer = function(){
        var table = $('<div>', {id: "SearcherWordsTable",class: "col-xs-12 col-sm-12 col-md-12 col-lg-12"});
        $('#controlsAdvanceSearchContainer').append(table);
    }

    var addWordAdvanceSearch = function(){
        var word = $('#advanceSarchOptions :selected').attr("word") + " " +  $('#AdvancedSearchWord').val();
        var container = $('<div>', {class: "advance-serarch-word-container", type: $('#advanceSarchOptions').val(), position: $('#advanceSarchOptions :selected').attr("position"), word: $('#AdvancedSearchWord').val()});
        var buttonRemove = $('<button>', {class: "btn btn-danger"}).append("<span class = 'glyphicon glyphicon-remove'/>");

        container.append(word).append(buttonRemove);

        buttonRemove.on("click", function(){
            container.remove();
        });

        $('#SearcherWordsTable').append(container);

        $('#AdvancedSearchWord').val('');
    }
    
    var getRepositoriesByCompany = function(){
        var repositories = new ClassRepository();
        return repositories.getRepositoriesByCompany();
    }

    this.show = function () {
        $('#advanceSearchContainer').show();
    }

    this.hide = function () {
        $('#advanceSearchContainer').hide();
    }
};



