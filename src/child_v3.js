'use strict';

var fs                          = require('fs');
var path                        = require('path');
var mkdirp                      = require('mkdirp')
var XLSX                        = require('xlsx');
var csv                         = require('fast-csv');
var mammoth                     = require("mammoth");
var postgresdb                  = require('pg');
var mysql                       = require('mysql');
const uuidv1                    = require('uuid/v1');
var crypto                      = require('crypto');
var diff                        = require('deep-diff').diff
var sqlite3                     = require('sqlite3');
var os                          = require('os')
var perf                        = require('./perf')
var db_helper                   = require("./db_helper")
var isBinaryFile                = require("isbinaryfile");
var pgeval
var sqliteeval
var tdeval
var toeval;
var userData
var childProcessName


var inProcessFilesFn                    = false;
var isWin                               = /^win/.test(process.platform);
var numberOfSecondsIndexFilesInterval   = 5;
var inScan                              = false;
var stmt2                               = null;
var stmt3                               = null;
var setIn                               = null;
var inGetRelatedDocumentHashes          = false;
var inIndexFileRelationshipsFn          = false;
var finishedFindingFolders              = false;
var username                            = "Unknown user";
var dbsearch;
var xdiff;
var lhs;
var rhs;
var stmtInsertIntoRelationships;
var stmtUpdateRelationships2;

var stmtUpdateFolder;
var stmtResetFolders;
var stmtInsertDriver;
var stmtUpdateDriver;
var stmtInsertIntoQueries;

var stmtResetFiles;
var stmtFileChanged;
var stmtInsertIntoMessages;
var stmtInsertIntoFiles;
var stmtInsertIntoFiles2;
var stmtUpdateFileStatus;
var stmtUpdateFileSizeAndShaAndConnectionId;
var stmtUpdateFileProperties;

var stmtInsertIntoContents;
var stmtInsertIntoFolders;
var stmtInsertIntoConnections;
var stmtInsertIntoConnections2;

var stmtInsertIntoIntranetClientConnects;

var stmtInsertInsertIntoQueries;
var stmtUpdateRelatedDocumentCount;
var stmtUpdateRelationships;
var in_when_queries_changes             = false;
var in_when_connections_change          = false;


username = os.userInfo().username.toLowerCase();
//console.log(username);

//dbsearch.run("PRAGMA synchronous=OFF;")
//dbsearch.run("PRAGMA count_changes=OFF;")
//dbsearch.run("PRAGMA journal_mode=MEMORY;")
//dbsearch.run("PRAGMA temp_store=MEMORY;")







processMessagesFromMainProcess();



function processMessagesFromMainProcess() {
    process.on('message', (msg) => {





    if  (msg.message_type == 'init') {
        //zzz
        console.log('-- Init v3');
        userData            = msg.user_data_path
        childProcessName    = msg.child_process_name

        //console.log("  Child recieved user data path: " + userData)
        var dbPath = path.join(userData, username + '.visi')

        //console.log("  DB path: " + dbPath)
        dbsearch = new sqlite3.Database(dbPath);
        dbsearch.run("PRAGMA journal_mode=WAL;")
        process.send({  message_type:       "database_setup_in_child" ,
                        child_process_name:  childProcessName
                        });
        console.log(" ---  Setting up drivers v3! --- ")
        driversFn(function(xx) {
            if (xx) {
                for (var i=0; i< xx.length; i++){
                    if (xx[i].initText) {
                        console.log(xx[i].name)
                        console.log("    " + xx[i].initText)

                    }
                }
            }

        })






                } else if (msg.message_type == 'setUpSql') {
                //zzz

                    setUpSql();





                } else if (msg.message_type == 'startDriverServices') {
                //zzz

                     console.log(" --- Started driver services --- ")
                     processDrivers();

                }






    });
}






//-----------------------------------------------------------------------------------------//
//                                                                                         //
//                                        setUpSql                                         //
//                                                                                         //
//   This sets up the SqlLite prepared statements                                          //
//                                                                                         //
//                                                                                         //
//                                                                                         //
//                                                                                         //
//                                                                                         //
//                                                                                         //
//-----------------------------------------------------------------------------------------//
function setUpSql() {
    stmtInsertIntoIntranetClientConnects = dbsearch.prepare(" insert  into  intranet_client_connects " +
                            "    ( id, internal_host, internal_port, public_ip, via, public_host, user_name, client_user_name, when_connected) " +
                            " values " +
                            "    (?,   ?,?,?,?,  ?,?,?,?);");

    stmtInsertIntoConnections2 = dbsearch.prepare(" insert into connections " +
                                "    ( id, name, driver, database, host, port, connectString, user, password, fileName, preview ) " +
                                " values " +
                                "    (?,  ?,?,?,?,?,?,?,?,?,?);");

    stmtInsertIntoQueries = dbsearch.prepare(" insert into data_states " +
                                "    ( id, name, connection, driver, definition, status, type ) " +
                                " values " +
                                "    (?,    ?, ?, ?, ?, ?, ?);");

    stmtInsertDriver = dbsearch.prepare(" insert or replace into drivers " +
                                "    (id,  name, type, code ) " +
                                " values " +
                                "    (?, ?,?,?);");

    stmtUpdateDriver = dbsearch.prepare(" update   drivers   set code = ? where id = ?");

    stmtResetFolders = dbsearch.prepare( " update   folders   set status = NULL ");

    stmtResetFiles   = dbsearch.prepare( " update   files   set status = 'INDEXED' where status = 'REINDEXED' ");

    stmtUpdateFolder = dbsearch.prepare( " update folders " +
                                                         "    set " +
                                                         "        status = ? " +
                                                         " where " +
                                                         "     id = ?");
    stmtInsertIntoRelationships = dbsearch.prepare( " insert into relationships " +
                                                        "    ( id, source_query_hash, target_query_hash, similar_row_count ) " +
                                                        " values " +
                                                        "    (?,  ?,?,  ?);");

    stmtUpdateRelationships2 = dbsearch.prepare( " update relationships " +
                                                         "    set " +
                                                         "        new_source = ?, new_target = ?, " +
                                                         "        edited_source = ?, edited_target = ?, " +
                                                         "        deleted_source = ?, deleted_target = ?, " +
                                                         "        array_source = ?, array_target = ? " +
                                                         " where " +
                                                         "     source_query_hash = ?    and     target_query_hash = ? ");


     stmtInsertIntoContents = dbsearch.prepare(  " insert into contents " +
                                                 "      ( id, content, content_type ) " +
                                                 " values " +
                                                 "      ( ?,  ?, ? );");


    stmtFileChanged = dbsearch.prepare( " update files " +
                                            "   set  contents_hash = ?,  size = ? " +
                                            " where  " +
                                            "     id = ? ;");

    stmtInsertIntoFiles = dbsearch.prepare( " insert into files " +
                                            "     ( id,  contents_hash ,  size,  path,  orig_name,    fk_connection_id) " +
                                            " values " +
                                            "     ( ?,  ?,  ?,  ?,  ?,   ? );");

    stmtInsertIntoMessages = dbsearch.prepare(  " insert into messages " +
                                                "     ( id,  source_id , path, source, status) " +
                                                " values " +
                                                "     ( ?,  ?,  ?,  ? , ? );");


    stmtInsertIntoFiles2 = dbsearch.prepare( " insert into files " +
                                            "     ( id,  path,  orig_name ) " +
                                            " values " +
                                            "     ( ?,  ?,  ?);");


    stmtUpdateFileStatus        = dbsearch.prepare(     " update files " +
                                                        "     set status = ? " +
                                                        " where " +
                                                        "     id = ? ;");


    stmtUpdateFileSizeAndShaAndConnectionId    = dbsearch.prepare(     " update files " +
                                                        "     set contents_hash = ? , size = ? , fk_connection_id = ? " +
                                                        " where " +
                                                        "     id = ? ;");

    stmtUpdateFileProperties    = dbsearch.prepare( " update files " +
                                                    "    set contents_hash = ?,  size = ? " +
                                                    " where " +
                                                    "    id = ? ;");



    stmtInsertIntoFolders = dbsearch.prepare(   " insert into folders " +
                                                "    ( id, name, path, changed_count ) " +
                                                " values " +
                                                "    (?, ?, ?, 0);");




    stmtInsertIntoConnections = dbsearch.prepare(" insert into connections " +
                                "    ( id, name, driver, type, fileName ) " +
                                " values " +
                                "    (?,  ?,  ?,?,?);");



    stmtInsertInsertIntoQueries = dbsearch.prepare(" insert into data_states " +
                                "    ( id, name, connection, driver, size, hash, fileName, type, definition, preview, similar_count , when_timestamp) " +
                                " values " +
                                "    (?,  ?,?,?,  ?,?,?, ?,?,?, 1,  ?);");

    stmtUpdateRelatedDocumentCount = dbsearch.prepare(" update data_states " +
                                "    set  similar_count = ?  " +
                                " where  " +
                                "    id = ? ;");

    stmtUpdateRelationships = dbsearch.prepare(" update data_states " +
                                "    set  related_status = ?  " +
                                " where  " +
                                "    hash = ? ;");
    stmt2 = dbsearch.prepare("INSERT INTO zfts_search_rows_hashed (row_hash, data) VALUES (?, ?)");

    stmt3 = dbsearch.prepare("INSERT INTO search_rows_hierarchy (document_binary_hash, parent_hash, child_hash) VALUES (?,?,?)");

    setIn =  dbsearch.prepare("UPDATE data_states SET index_status = ? WHERE id = ?");
}



function driversFn(callbackFn) {
    dbsearch.serialize(
        function() {
            var result = []
            var stmt = dbsearch.all(
                "SELECT * FROM drivers",

                function(err, results)
                {
                    if (results) {
                        for (var i =0 ; i< results.length; i ++) {
                            var obj = eval(results[i].code)
                            result.push(obj)
                        }
                        callbackFn( result);
                    } else {
                        callbackFn(null)
                    }

                })
    }, sqlite3.OPEN_READONLY)
}






function processDrivers() {
    console.log("Process drivers")
    var initFunctions = []
    driversFn(function(xx) {
        if (xx) {
            for (var i=0; i< xx.length; i ++) {
                if (xx[i].events) {
                    //console.log("    " + xx[i].events)
                    var fg =  Object.keys(xx[i].events)
                    if (fg.length > 0  ) {
                        //console.log(xx[i].name)
                        //console.log("    " + JSON.stringify(fg))
                        for (var e=0; e<fg.length; e++){
                            var thisEvent = xx[i].events[fg[e]]
                            //console.log("    " + JSON.stringify(Object.keys(thisEvent,null,2)))
                            if (thisEvent.on == "init") {
                                console.log("Created event " + xx[i].name + ":init")
                                initFunctions.push(thisEvent.do)
                            } else if (thisEvent.on == "call") {
                                console.log("Created event " + xx[i].name + ":call")
                                functions[xx[i].name] = thisEvent.do
                            }

                        }
                    }

                }
            }
            for (var rr = 0; rr < initFunctions.length ; rr ++) {
                initFunctions[rr]()
            }
        }
    })
}

var functions = new Object()




function callService(sn, cv, callbackFn) {
    console.log("2) called service '" + sn + "' with args: " + JSON.stringify(cv,null,2))
    if (functions[sn]) {
        functions[sn](cv, callbackFn)

    } else {
         console.log("3) '" + sn + "' is not defined as a service")
    }
}
