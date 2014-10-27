'use strict';
module ec.ui {

    interface InputFileScope extends ng.IScope {
        onloaded: (data: { file: File }) => void;
    }
    interface InputFileEventTarget extends EventTarget {
        files: FileList;
    }
    interface InputFileEvent extends JQueryEventObject {
        target: InputFileEventTarget;
    }

    function ecInputFileDirective() {
        return {
            restrict: 'EA',
            //replace: true,
            templateUrl: 'template/inputFile.html',
            transclude: true,    //implies a new scope
            scope: {
                onloaded: '&'
            },
            link: function postLink(scope: InputFileScope, elm: JQuery, attrs: any) {
                elm.css({ position: 'relative' });
                elm.find('input').on('change', (event: InputFileEvent) => {
                    scope.onloaded({ file: event.target.files[0] });
                });
            }
        };
    }

    function templateCache($templateCache: ng.ITemplateCacheService) {
        $templateCache.put("template/inputFile.html",
            //"<span style='position: relative;'>"
            "<input type='file' accept='application/json,text/plain'"
            + " style='position: relative; text-align: right; -moz-opacity:0; filter: alpha(opacity: 0); opacity: 0; z-index: 2; width: 80px;'>"
            + "<button style='position:absolute; left:0px; width:100%; z-index:1;' class='btn' ng-transclude></button>"
        //+ "<span style='position:absolute; left:0px; width:100%; z-index:1;' ng-transclude></span>"
        //+ "</span>"
            );

        /*
        <span class="fileinputs">
           <input type="file" id="inputFile" accept="text/plain,application/json">
            <button class="fakefile">Load</button>
        </span>
        */
    }

    angular.module('ec.inputFile', [])
    //.controller('PanelController', PanelController)
        .directive('ecInputFile', ecInputFileDirective)
        .run(["$templateCache", templateCache])
    ;

}

/*
<!DOCTYPE html>
<html>
    <head>
        <title>Test upload</title>
        <style>
            .dropable {
                background-color: lightgreen;
                cursor: move;
            }
            .fileinputs {
                position: relative;
            }
            .fakefile {
                position: absolute;
                left: 0px;
                width: 100%;
                z-index: 1;
            }

            input[type="file"] {
                position: relative;
                text-align: right;
                -moz-opacity:0 ;
                filter:alpha(opacity: 0);
                opacity: 0;
                z-index: 2;
				
                width: 56px;
            }
        </style>
    </head>
    <body>
        .<span class="fileinputs"><input type="file" id="inputFile" accept="text/plain,application/json"><button class="fakefile">Load</button></span>.<br/>
        <textarea id="fileContent" rows="5" cols="60"></textarea><br/>
        <input id="filename" type="text" value="myfile.txt"><button id="btnSave">Save</button>
        <script>
            (function() {
                'use strict';

                var fi = document.getElementById('inputFile');
                var fc = document.getElementById('fileContent');

                fi.addEventListener('change', function(event) {
                    loadFile(event.target.files[0]);
                });
                fi.addEventListener("dragenter", dragover, false);
                fi.addEventListener("dragover", dragover, false);
                document.addEventListener("dragleave", dragover, false);
                fi.addEventListener("drop", drop, false);
                fc.addEventListener("dragenter", dragover, false);
                fc.addEventListener("dragover", dragover, false);
                fc.addEventListener("drop", drop, false);

                function dragover(event) {
                    event.stopPropagation();
                    event.preventDefault();
                    var target = event.target;
                    target.className = /enter|over/.test(event.type) ? 'dropable' : '';
                }
                function drop(event) {
                    dragover(event);
                    loadFile(event.dataTransfer.files[0]);
                }

                function loadFile(file) {
                    console && console.info(file);

                    var reader = new FileReader();
                    reader.addEventListener("loadend", function() {
                        console && console.info(reader.result);
                        fileContent.value = reader.result;
                    });
                    reader.readAsText(file);
                }

                var bSave = document.getElementById('btnSave');
                var filename = document.getElementById('filename');
                bSave.addEventListener('click', function(event) {
                    var blob = new Blob([fc.value], {type: 'text/plain'});
                    saveAs(blob, filename.value);
                });

                var saveAs = saveAs || function(blob, filename) {
                    var a = document.createElement('a');
                    a.download = filename;
                    a.href = URL.createObjectURL(blob);
                    a.textContent = filename;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    a = null;
                    //document.body.appendChild(a);
                }

            })();
        </script>
    </body>
</html>
*/