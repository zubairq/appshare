{
    pipelineCode: async function() {
        methods:
        {
            //*** gen_start ***//
            loadControls:                           async function  () {
                /*
                ________________________________________
                |                                      |
                |             loadControls             |
                |                                      |
                |______________________________________|

                This loads the controls for the control palette, which allows the user
                to add buttons, labels, and other controls to their app

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm  = this
                let sql =    "select  base_component_id,  app_icon_data as logo_url  from  yz_cache_released_components  " +
                    " inner JOIN " +
                    "     icon_images ON yz_cache_released_components.icon_image_id = icon_images.id " +
                    "where " +
                    "    icon_image_id is not null and component_type = 'component'"

                let results = await callComponent({ base_component_id:    "readFromInternalSqliteDatabase"},
                    {   sql: sql  })

                mm.available_components = results
                let itemsToLoad = []
                for (let thiscc of results) {
                    let cbase = thiscc.base_component_id
                    //console.log("Component: " + JSON.stringify(cbase))
                    itemsToLoad.push(cbase)
                }
                await loadUiComponentsV4(itemsToLoad)
                //console.log("Time " + (ttq++) + ": " + (new Date().getTime()- startTime))
            },
            addCodeChange:                          function        (changeText) {
                /*
                ________________________________________
                |                                      |
                |             addCodeChange            |
                |                                      |
                |______________________________________|

                This is called to try to keep a log of changes that has occurred on a commit

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                if (!mm.code_changes) {
                    mm.code_changes = []
                }

                mm.code_changes.push(
                    {
                        code_change_text: changeText
                        ,
                        timestamp: new Date().getTime()
                    })
            },
            updateComponentMethods:                 function        () {
                /*
               ________________________________________
               |                                      |
               |         updateComponentMethods       |
               |                                      |
               |______________________________________|

               I'm not entirely sure what this method does

               __________
               | Params |
               |        |______________________________________________________________
               |
               |     NONE
               |________________________________________________________________________ */
                let mm = this

                // ---------------------------------------------------------
                // ... Set up all the form methods
                // ---------------------------------------------------------
                let forms = mm.getForms()
                for (let formIndex = 0; formIndex < forms.length; formIndex ++) {
                    let formName = forms[formIndex].name

                    // ---------------------------------------------------------
                    // For each component in the form ...
                    // ---------------------------------------------------------
                    for (let compenentInFormIndex = 0; compenentInFormIndex < mm.model.forms[formName].components.length ; compenentInFormIndex++ )
                    {
                        // ---------------------------------------------------------
                        // ... Make sure that the component is added as a
                        //     dependency of this app (Useful for
                        //     when we compile the app as standalone HTML)
                        // ---------------------------------------------------------

                        let componentConfig = mm.model.forms[formName].components[compenentInFormIndex]
                        if (mm.edited_app_component_id) {
                            mm.components_used_in_this_app[  componentConfig.base_component_id  ] = true
                        }



                        // ---------------------------------------------------------
                        // ...
                        //
                        //
                        // ---------------------------------------------------------

                        let componentId = mm.model.forms[formName].components[compenentInFormIndex].base_component_id

                        if (GLOBALS.isComponentTypeCached(componentId)) {
                            let cachedComponentPropertiesDefinition = mm.getControlProperties(mm.model.forms[formName].components[compenentInFormIndex].base_component_id)
                            if (isValidObject(cachedComponentPropertiesDefinition)) {
                                for (let cpp = 0 ; cpp< cachedComponentPropertiesDefinition.length; cpp ++) {
                                    let prop = cachedComponentPropertiesDefinition[cpp].id
                                    let compId = mm.model.forms[formName].components[compenentInFormIndex].base_component_id

                                    if (cachedComponentPropertiesDefinition[cpp].type == "Action") {
                                        mm.model.forms[formName].components[compenentInFormIndex][prop] =
                                            mm.getControlMethod(cachedComponentPropertiesDefinition[cpp],
                                                mm.model.forms[formName].components[compenentInFormIndex])

                                    } else if (!isValidObject(mm.model.forms[formName].components[compenentInFormIndex][prop])){
                                        mm.model.forms[formName].components[compenentInFormIndex][prop] = ""
                                    }
                                }
                            }
                        }
                    }
                }
            },
            getIncomingToPropertyName:              function        (currentWatch) {
                /*
                ________________________________________
                |                                      |
                |   getIncomingToPropertyName          |
                |                                      |
                |______________________________________|

                I'm not entirely sure what this method does

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let ret
                if (this.model.forms[this.active_form].components[this.active_component_links_index]) {
                    ret = this.model.forms[this.active_form].components[this.active_component_links_index].name
                        +
                        "."
                        +
                        currentWatch.to_component_property_name
                } else {
                    ret = "<Invalid>"
                }

                return ret
            },
            getEditor:                              function        () {
                /*
                ________________________________________
                |                                      |
                |   getEditor                          |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                return this
            },
            changeComponentBaseId                                   (args) {
                /*
                ________________________________________
                |                                      |
                |   changeComponentBaseId              |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                //alert("Hi from the editor" + JSON.stringify(args,null,2))
                //evm_contract_control_114

                //debugger
                let ccc = mm.model.forms[mm.active_form].components
                for (   let ytr = ccc.length - 1;    ytr >= 0;    ytr--   ) {
                    let component = ccc[ytr]
                    let fg=component.name
                    if (fg == args.componentName) {
                        ccc[ytr].base_component_id = args.newComponentBaseId
                    }

                }
                let currentTime = new Date().getTime();
                if (mm.model_changed_time != -1) {
                    mm.model_changed_time = currentTime
                }
                // replace("evm_contract_control_114", "")

                setTimeout(async function() {
                    mm.updateAllFormCaches()
                    //mm.updatePropertySelector()
                    mm.selectComponentByName(args.componentName)
                    mm.refresh ++


                },100)
            },
            changePropertyValue                                     (args) {
            /*
            ________________________________________
            |                                      |
            |   changePropertyValue                |
            |                                      |
            |______________________________________|

            TO BE FILLED IN

            __________
            | Params |
            |        |______________________________________________________________
            |
            |        {
            |                componentName - The name, such as "aaa" of the control
            |                -------------
            |
            |                propertyName - Which property to change
            |                ------------
            |
            |                propertyValue - The property value
            |                -------------
            |        }
            |________________________________________________________________________ */
            let mm = this
            //alert("Hi from the editor" + JSON.stringify(args,null,2))
            //evm_contract_control_114

            //debugger
            let ccc = mm.model.forms[mm.active_form].components
            for (   let ytr = ccc.length - 1;    ytr >= 0;    ytr--   ) {
                let component = ccc[ytr]
                let fg=component.name
                if (fg == args.componentName) {
                    ccc[ytr][args.propertyName] = args.propertyValue
                }

            }
            let currentTime = new Date().getTime();
            if (mm.model_changed_time != -1) {
                mm.model_changed_time = currentTime
            }
            // replace("evm_contract_control_114", "")

            setTimeout(async function() {
                mm.updateAllFormCaches()
                //mm.updatePropertySelector()
                mm.selectComponentByName(args.componentName)
                mm.refresh ++


            },100)
        },
            lookupComponent:                        function        (componentName) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let component  = null
                let mm         = this

                if (mm.form_runtime_info) {
                    if (mm.form_runtime_info[mm.active_form]) {
                        if (mm.form_runtime_info[mm.active_form].component_lookup_by_name) {
                            if (mm.form_runtime_info[mm.active_form].component_lookup_by_name[componentName]) {
                                component = mm.form_runtime_info[mm.active_form].component_lookup_by_name[componentName]
                            }
                        }
                    }
                }

                return component
            },
            lookupComponentOnForm:                  function        (lookupArgs) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                //debugger
                let component  = null
                let mm         = this

                if (lookupArgs.componentName) {
                    let componentName = lookupArgs.componentName
                    if (mm.form_runtime_info) {
                        if (mm.form_runtime_info[mm.active_form]) {
                            if (mm.form_runtime_info[mm.active_form].component_lookup_by_name) {
                                if (mm.form_runtime_info[mm.active_form].component_lookup_by_name[componentName]) {
                                    component = mm.form_runtime_info[mm.active_form].component_lookup_by_name[componentName]
                                }
                            }
                        }
                    }

                    return component


                } else if (lookupArgs.base_component_id && lookupArgs.first_only) {

                    let base_component_id = lookupArgs.base_component_id
                    if (mm.model.forms[mm.active_form].components) {
                        let ccc = mm.model.forms[mm.active_form].components
                        for (let ytr = 0;ytr < ccc.length;ytr++) {
                            if (ccc[ytr].base_component_id == base_component_id) {
                                return ccc[ytr]
                            }
                        }
                    }

                    return component

                }
                return null

            },
            getIncomingFromPropertyName:            function        (currentWatch) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let ret
                if (this.form_runtime_info[this.active_form].component_lookup_by_uuid[currentWatch.from_component_uuid]) {
                    ret = this.form_runtime_info[this.active_form].component_lookup_by_uuid[currentWatch.from_component_uuid].name
                        +
                        "."
                        +
                        currentWatch.from_component_property_name
                } else {
                    ret = "<Invalid>"
                }

                return ret
            },
            getIncomingTransformFn:                 function        (currentWatch) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let ret
                //debugger
                if (currentWatch.transform_fn && (currentWatch.transform_fn.length > 0)) {
                    ret = currentWatch.transform_fn
                } else {
                    ret = "None"
                }

                return ret
            },
            getOutgoingTransformFn:                 function        (currentPush) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let ret
                //debugger
                if (currentPush.transform_fn && (currentPush.transform_fn.length > 0)) {
                    ret = currentPush.transform_fn
                } else {
                    ret = "None"
                }

                return ret
            },
            getOutgoingFromPropertyName:            function        (currentPush) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let ret
                if (this.form_runtime_info[this.active_form].component_lookup_by_uuid[currentPush.from_component_uuid]) {
                    ret = this.form_runtime_info[this.active_form].component_lookup_by_uuid[currentPush.from_component_uuid].name
                        +
                        "."
                        +
                        currentPush.from_component_property_name
                } else {
                    ret = "<Invalid>"
                }

                return ret
            },
            getOutgoingToPropertyName:              function        (currentPush) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let ret
                if (this.form_runtime_info[this.active_form].component_lookup_by_uuid[currentPush.to_component_uuid]) {
                    ret = this.form_runtime_info[this.active_form].component_lookup_by_uuid[currentPush.to_component_uuid].name
                        +
                        "."
                        +
                        currentPush.to_component_property_name
                } else {
                    ret = "<Invalid>"
                }

                return ret
            },
            addPush:                                function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                //debugger
                let mm = this

                if ( mm.selectedPushComponentUuid == null) {
                    return
                }
                mm.old_model = JSON.parse(JSON.stringify( mm.model ));
                if (! mm.model.forms[mm.active_form].components[mm.active_component_index].push) {
                    mm.model.forms[mm.active_form].components[mm.active_component_index].push = []
                }
                mm.model.forms[mm.active_form].components[mm.active_component_index].push.push(
                    {
                        "uuid": mm.selectedPushComponentUuid,
                        "property": mm.selectedPushFromProperty,
                        "send_to": mm.selectedPushToProperty,
                        "transform_fn": mm.selectedPushTransformFn
                    }
                )
                mm.selectedPushComponentUuid     = null
                mm.selectedPushFromProperty      = null
                mm.selectedPushToProperty        = null
                mm.selectedPushTransformFn        = null

                mm.refresh ++
                mm.updateAllFormCaches()
                mm.showSaveButton()



            },
            clearLinks:                             async function  () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                mm.selectedWatchComponentUuid = null
                mm.selectedWatchFromProperty = null
                mm.selectedWatchToProperty = null
                mm.selectedWatchFromProperties = []
                mm.linkSideSelected = "none"
                mm.selectedPushComponentUuid     = null
                mm.selectedPushFromProperty      = null
                mm.selectedPushToProperty        = null
                mm.selectedPushTransformFn        = null
                mm.selectedPushComponentType = null
                await mm.recalcComponentLinks()
            },
            addWatch:                               function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                //debugger
                let mm = this

                if ( mm.selectedWatchComponentUuid == null) {
                    return
                }
                mm.old_model = JSON.parse(JSON.stringify( mm.model ));
                if (! mm.model.forms[mm.active_form].components[mm.active_component_index].watch) {
                    mm.model.forms[mm.active_form].components[mm.active_component_index].watch = []
                }
                mm.model.forms[mm.active_form].components[mm.active_component_index].watch.push(
                    {
                        "uuid": mm.selectedWatchComponentUuid,
                        "property": mm.selectedWatchFromProperty,
                        "send_to": mm.selectedWatchToProperty,
                        "transform_fn": mm.selectedWatchTransformFn
                    }
                )
                mm.selectedWatchComponentUuid     = null
                mm.selectedWatchFromProperty      = null
                mm.selectedWatchToProperty        = null
                mm.selectedWatchTransformFn        = null

                mm.refresh ++
                mm.updateAllFormCaches()
                mm.showSaveButton()

                mm.clearLinks()

            },
            getNextComponentid:                     function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                return this.model.next_component_id++
            },
            addNewComponentPush:                    async function  () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                //debugger
                //debugger
                let mm = this
                let activeComponent = mm.model.forms[mm.active_form].components[mm.active_component_index]
                let old_active_component_index = mm.active_component_index


                let componentToCreateType = mm.selectedPushComponentType


                let newName = componentToCreateType + "_" + this.model.next_component_id++
                //
                // create the component
                //
                await mm.addControl(
                    {
                        "leftX": 310,
                        "topY": 10,
                        "name": newName,
                        "base_component_id": componentToCreateType
                    })
                //mm.gotoDragDropEditor()
                //mm.selectComponentByName(newName)

                mm.linkComponents({
                    link_type:          "outgoing",

                    from_component:      activeComponent.name,
                    from_property:       mm.selectedPushFromProperty,

                    to_component:        newName,
                    to_property:         mm.selectedPushToProperty

                })
                mm.selectComponent(old_active_component_index, true)

            },
            addNewComponentWatch:                   async function  () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                //debugger
                let mm = this
                let activeComponent = mm.model.forms[mm.active_form].components[mm.active_component_index]
                let old_active_component_index = mm.active_component_index
                let componentToCreateType = mm.selectedWatchComponentType


                let newName = componentToCreateType + "_" + this.model.next_component_id++
                //
                // create the component
                //
                await mm.addControl(
                    {
                        "leftX": 310,
                        "topY": 10,
                        "name": newName,
                        "base_component_id": componentToCreateType
                    }

                )
                //mm.gotoDragDropEditor()
                //mm.selectComponentByName(newName)

                mm.linkComponents({
                    link_type:          "incoming",

                    from_component:      newName,
                    from_property:       mm.selectedWatchFromProperty,

                    to_component:        activeComponent.name,
                    to_property:         mm.selectedWatchToProperty

                })
                mm.selectComponent(old_active_component_index, true)

            },
            showSaveButton:                         function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                this.$root.$emit('message', {
                    type:   "pending"
                })
            },
            setWatchComponent:                      function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */

                let mm      = this
                let val     = null
                let type    = null

//debugger
                this.selectedWatchComponentUuid = event.target.value
                this.selectedWatchFromProperties = []
                let ccomp =  this.form_runtime_info[mm.active_form].component_lookup_by_uuid[this.selectedWatchComponentUuid]
                let ccomkeys = Object.keys(ccomp)
                for (let aaa =0; aaa<ccomkeys.length;aaa++) {
                    this.selectedWatchFromProperties.push(ccomkeys[aaa])
                }
            },
            setIncomingFormWatchComponent:          function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm      = this
                let val     = null
                let type    = null


                //
                // if nothing is selected then set it all up
                //
                if (mm.linkSideSelected == "none") {
                    mm.linkSideSelected = "from";

                } else {

                }
                this.selectedWatchComponentUuid = event.target.value
                this.selectedWatchFromProperties = []
                let ccomp =  this.form_runtime_info[mm.active_form].component_lookup_by_uuid[this.selectedWatchComponentUuid]
                let Acttyoe = mm.model.forms[mm.active_form].components[mm.active_component_index].base_component_id
                let ccomkeys = Object.keys(GLOBALS.linkedProperties[Acttyoe].incoming.them[ccomp.base_component_id])
                for (let aaa =0; aaa<ccomkeys.length;aaa++) {
                    this.selectedWatchFromProperties.push(ccomkeys[aaa])
                }

//debugger



            },
            setWatchToProperty:                     function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                this.selectedWatchToProperty = event.target.value
                this.toLinkPropertySelected = true

                if (mm.linkSideSelected == "none") {
                    mm.linkSideSelected = "to";

                } else {

                }

                //debugger
                if (mm.design_mode_pane.links_type == "form") {
                    if (mm.linkSideSelected == "to") {

                        mm.incoming_link_objects = []

                        let ccc = mm.model.forms[mm.active_form].components
                        for (   let ytr = ccc.length - 1;    ytr >= 0;    ytr--   ) {
                            let component = ccc[ytr]
                            let foundComponentType = component.base_component_id
                            if (GLOBALS.linkedProperties[mm.selected_link_component_type]) {
                                if (GLOBALS.linkedProperties[mm.selected_link_component_type].incoming.me) {
                                    if (GLOBALS.linkedProperties[mm.selected_link_component_type].incoming.me[this.selectedWatchToProperty]) {
                                        let foundComponentIncomingTree = GLOBALS.linkedProperties[mm.selected_link_component_type].incoming.me[this.selectedWatchToProperty][foundComponentType]

                                        if (foundComponentIncomingTree) {
                                            let incomingCount = Object.keys(foundComponentIncomingTree).length
                                            if (incomingCount > 0) {
                                                mm.incoming_link_objects.push(
                                                    {name: component.name, type: foundComponentType, uuid: component.uuid}
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                } else if (mm.design_mode_pane.links_type == "create_new_component") {
//debugger

                    if (mm.linkSideSelected == "to") {
                        mm.incoming_link_component_types = []
                        let selectedObject = mm.model.forms[mm.active_form].components[mm.active_component_index]
                        let inTypes = GLOBALS.linkedProperties[selectedObject.base_component_id].incoming.them
                        //debugger
                        if (inTypes) {
                            let ooo = Object.keys(inTypes)
                            for (let ooobb of ooo) {

                                mm.incoming_link_component_types.push(ooobb)
                            }

                        }




                    }
                }
            },
            setWatchTransformFn:                    function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                this.selectedWatchTransformFn = event.target.value
            },
            setPushTransformFn:                     function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                this.selectedPushTransformFn = event.target.value
            },
            setWatchFromProperty:                   function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                this.selectedWatchFromProperty = event.target.value


                if (mm.design_mode_pane.links_type == "form") {
                    this.fromLinkPropertySelected = true

                    if (mm.linkSideSelected == "from") {
                        this.selectedWatchToProperties = []
                        let ccomp2 =  mm.model.forms[mm.active_form].components[mm.active_component_index]
                        let activeComponenttype = ccomp2.base_component_id
                        if (  GLOBALS.linkedProperties[  activeComponenttype  ]  ) {
                            if (  GLOBALS.linkedProperties[  activeComponenttype  ].incoming  ) {
                                if (  GLOBALS.linkedProperties[  activeComponenttype  ].incoming.them  ) {
                                    let them =  this.form_runtime_info[mm.active_form].component_lookup_by_uuid[this.selectedWatchComponentUuid]
                                    if (  GLOBALS.linkedProperties[  activeComponenttype  ].incoming.them[  them.base_component_id  ]  ) {
                                        let ccomkeys2 = Object.keys(GLOBALS.linkedProperties[  activeComponenttype  ].incoming.them[  them.base_component_id  ][mm.selectedWatchFromProperty] )

                                        for (let aaa =0; aaa<ccomkeys2.length;aaa++) {
                                            this.selectedWatchToProperties.push(ccomkeys2[aaa])
                                        }
                                    }
                                }
                            }
                        }

                    }


                }
            },
            setPushComponentType:                   function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm      = this

                let ComponentType = event.target.value
                mm.selectedPushToProperties = []
                mm.selectedPushComponentType = ComponentType
                //
                let activecomp = mm.model.forms[mm.active_form].components[mm.active_component_index]


                if (mm.linkSideSelected == "from") {
                    if (GLOBALS.linkedProperties){
                        if (GLOBALS.linkedProperties[activecomp.base_component_id]){
                            if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing){
                                if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.me){
                                    if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.me[mm.selectedPushFromProperty] ) {
                                        if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.me[mm.selectedPushFromProperty][ComponentType]) {
                                            let ccomkeys = Object.keys(GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.me[mm.selectedPushFromProperty][ComponentType])
                                            for (let aaa =0; aaa<ccomkeys.length;aaa++) {
                                                this.selectedPushToProperties.push(ccomkeys[aaa])
                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }
                }

            },
            setWatchComponentType:                  function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm      = this

                let ComponentType = event.target.value
                mm.selectedWatchFromProperties = []
                mm.selectedWatchComponentType = ComponentType
                //
                let activecomp = mm.model.forms[mm.active_form].components[mm.active_component_index]


                if (mm.linkSideSelected == "to") {
                    if (GLOBALS.linkedProperties){
                        if (GLOBALS.linkedProperties[activecomp.base_component_id]){
                            if (GLOBALS.linkedProperties[activecomp.base_component_id].incoming){
                                if (GLOBALS.linkedProperties[activecomp.base_component_id].incoming.me){
                                    if (GLOBALS.linkedProperties[activecomp.base_component_id].incoming.me[mm.selectedWatchToProperty] ) {
                                        if (GLOBALS.linkedProperties[activecomp.base_component_id].incoming.me[mm.selectedWatchToProperty][ComponentType]) {
                                            let ccomkeys = Object.keys(GLOBALS.linkedProperties[activecomp.base_component_id].incoming.me[mm.selectedWatchToProperty][ComponentType])
                                            for (let aaa =0; aaa<ccomkeys.length;aaa++) {
                                                this.selectedWatchFromProperties.push(ccomkeys[aaa])
                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }
                }

            },
            setPushComponent:                       function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm      = this
                let val     = null
                let type    = null


                this.selectedPushComponentUuid = event.target.value
                let ccomp =  this.form_runtime_info[mm.active_form].component_lookup_by_uuid[this.selectedPushComponentUuid]
                let activecomp = mm.model.forms[mm.active_form].components[mm.active_component_index]
                this.selectedPushToProperties = []
                mm.linkSideSelected = "to"

                //
                if (mm.design_mode_pane.links_type == "form") {

                    if (mm.linkSideSelected == "from") {
                        if (GLOBALS.linkedProperties){
                            if (GLOBALS.linkedProperties[activecomp.base_component_id]){
                                if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing){
                                    if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.me){
                                        if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.me[mm.selectedPushFromProperty] ) {
                                            if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.me[mm.selectedPushFromProperty][ccomp.base_component_id]) {
                                                let ccomkeys = Object.keys(GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.me[mm.selectedPushFromProperty][ccomp.base_component_id])
                                                for (let aaa =0; aaa<ccomkeys.length;aaa++) {
                                                    this.selectedPushToProperties.push(ccomkeys[aaa])
                                                }
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    } else if (mm.linkSideSelected == "to") {
                        if (GLOBALS.linkedProperties){
                            if (GLOBALS.linkedProperties[activecomp.base_component_id]){
                                if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing){
                                    if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.them){
                                        if (GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.them[ccomp.base_component_id]){
                                            let ccomkeys = Object.keys(GLOBALS.linkedProperties[activecomp.base_component_id].outgoing.them[ccomp.base_component_id])
                                            for (let aaa =0; aaa<ccomkeys.length;aaa++) {
                                                this.selectedPushToProperties.push(ccomkeys[aaa])
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }


                    // else just get all the components on the form
                } else {

                    let ccomkeys = Object.keys(ccomp)
                    for (let aaa =0; aaa<ccomkeys.length;aaa++) {
                        this.selectedPushToProperties.push(ccomkeys[aaa])
                    }

                }
//debugger
            },
            linkComponents:                         function        (options) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm      = this
                //alert(JSON.stringify(options,null,2))

                //debugger

                if (options.link_type == "outgoing") {
                    let fromComponent =   mm.form_runtime_info[mm.active_form].component_lookup_by_name[options.from_component]
                    let toComponent =     mm.form_runtime_info[mm.active_form].component_lookup_by_name[options.to_component]

                    mm.old_model = JSON.parse(JSON.stringify( mm.model ));
                    if (! fromComponent.push) {
                        fromComponent.push = []
                    }
                    fromComponent.push.push(
                        {
                            "uuid": toComponent.uuid,
                            "property": options.from_property,
                            "send_to": options.to_property,
                            "transform_fn": null
                        }
                    )
                    mm.selectedPushComponentUuid     = null
                    mm.selectedPushFromProperty      = null
                    mm.selectedPushToProperty        = null
                    mm.selectedPushTransformFn        = null

                    mm.refresh ++
                    mm.updateAllFormCaches()
                    mm.showSaveButton()

                } else if (options.link_type == "incoming") {
                    //debugger
                    let fromComponent =   mm.form_runtime_info[mm.active_form].component_lookup_by_name[options.from_component]
                    let toComponent =     mm.form_runtime_info[mm.active_form].component_lookup_by_name[options.to_component]

                    mm.old_model = JSON.parse(JSON.stringify( mm.model ));
                    if (! toComponent.watch) {
                        toComponent.watch = []
                    }
                    toComponent.watch.push(
                        {
                            "uuid": fromComponent.uuid,
                            "property": options.from_property,
                            "send_to": options.to_property,
                            "transform_fn": null
                        }
                    )
                    mm.selectedPushComponentUuid     = null
                    mm.selectedPushFromProperty      = null
                    mm.selectedPushToProperty        = null
                    mm.selectedPushTransformFn        = null
                    mm.incoming_link_component_types = []
                    mm.selectedWatchComponentUuid = null
                    mm.selectedWatchFromProperty = null
                    mm.selectedWatchFromProperties = []
                    mm.selectedWatchToProperty = null
                    mm.linkSideSelected = "none"
                    mm.selectedWatchComponentType = null



                    mm.refresh ++
                    mm.updateAllFormCaches()
                    mm.showSaveButton()

                }



            },
            setPushToProperty:                      function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                this.selectedPushToProperty = event.target.value
            },
            setPushFromProperty:                    function        (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                this.selectedPushFromProperty = event.target.value
                this.linkSideSelected = "from"

//
                if (this.design_mode_pane.links_type == "create_new_component") {
                    this.outgoing_link_component_types = []
                    let selectedObject = mm.model.forms[mm.active_form].components[mm.active_component_index]
                    if (GLOBALS.linkedProperties) {
                        if (GLOBALS.linkedProperties[selectedObject.base_component_id]) {
                            let outTypes = GLOBALS.linkedProperties[selectedObject.base_component_id].outgoing.them
                            //debugger
                            if (outTypes) {
                                let ooo = Object.keys(outTypes)
                                for (let ooobb of ooo) {
                                    mm.outgoing_link_component_types.push(ooobb)
                                }

                            }
                        }
                    }
                }
            },
            deleteLinkedProperty:                   function        (watchListItem ) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                //debugger
                let currentWatchIndex
                let mm                     = this
                let currentComponentCurrentWatch
                let componentIndex
                let currentComponent       = null
                let allComponentsonForm    = mm.model.forms[mm.active_form].components

                for (  componentIndex = 0 ;  componentIndex < allComponentsonForm.length  ;  componentIndex++  ) {

                    currentComponent = allComponentsonForm[  componentIndex  ]
                    if (currentComponent.uuid == watchListItem.to_component_uuid) {
                        if (currentComponent.watch){
                            for (let currentWatchIndex = 0;currentWatchIndex < currentComponent.watch.length;currentWatchIndex++) {
                                currentComponentCurrentWatch = currentComponent.watch[currentWatchIndex]
                                if (currentComponentCurrentWatch.uuid == watchListItem.from_component_uuid) {
                                    if (currentComponentCurrentWatch.send_to == watchListItem.to_component_property_name) {
                                        if (currentComponentCurrentWatch.property == watchListItem.from_component_property_name) {
                                            mm.old_model = JSON.parse(JSON.stringify( mm.model ));
                                            mm.model.forms[mm.active_form].components[  componentIndex  ].watch.splice(currentWatchIndex, 1);
                                            mm.refresh ++
                                            mm.updateAllFormCaches()
                                            break
                                        }
                                    }

                                }
                            }
                        }
                    }
                }

                let pushListItem = watchListItem
                //debugger
                let currentPushIndex
                //let mm                     = this
                let currentComponentCurrentPush
                currentComponent       = null
                allComponentsonForm    = mm.model.forms[mm.active_form].components

                for (  componentIndex = 0 ;  componentIndex < allComponentsonForm.length  ;  componentIndex++  ) {

                    currentComponent = allComponentsonForm[  componentIndex  ]
                    if (currentComponent.uuid == pushListItem.from_component_uuid) {
                        if (currentComponent.push){
                            for (let currentPushIndex = 0;currentPushIndex < currentComponent.push.length;currentPushIndex++) {
                                currentComponentCurrentPush = currentComponent.push[currentPushIndex]
                                if (currentComponentCurrentPush.uuid == pushListItem.to_component_uuid) {
                                    if (currentComponentCurrentPush.send_to == pushListItem.to_component_property_name) {
                                        if (currentComponentCurrentPush.property == pushListItem.from_component_property_name) {
                                            mm.old_model = JSON.parse(JSON.stringify( mm.model ));
                                            mm.model.forms[mm.active_form].components[  componentIndex  ].push.splice(currentPushIndex, 1);
                                            mm.refresh ++
                                            mm.updateAllFormCaches()
                                            break
                                        }
                                    }

                                }
                            }
                        }
                    }
                }
                mm.showSaveButton()

            },
            getControlNonAsyncMethod:               function        (componentDetails, isComponentInDesignMode, methodId) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                return function(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10) {
                    let me = componentDetails
                    let parent = null
                    if (me.parent) {
                        parent = mm.form_runtime_info[mm.active_form].component_lookup_by_name[me.parent]
                    }

                    let retv =  null
                    let fnDetails       = null
                    let controlDetails = null
                    if (isComponentInDesignMode) {
                        controlDetails = GLOBALS.designModeUiControlNameReturnsVueInstance[componentDetails.name]
                    } else {
                        controlDetails = GLOBALS.runtimeUiControlNameReturnsVueInstance[componentDetails.name]
                    }
                    fnDetails = controlDetails[methodId]
                    retv =  fnDetails(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10)


                    return retv
                }
            },
            getControlAsyncMethod:                  function        (componentDetails) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                return async function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
                    let me = componentDetails
                    let parent = null
                    if (me.parent) {
                        parent = mm.form_runtime_info[mm.active_form].component_lookup_by_name[me.parent]
                    }

                    let fnDetails = null
                    if (isValidObject(methodFn)) {
                        let thecode =
                            `(async function(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10) {
                    ${methodFn}
                    })`

                        fnDetails = eval(thecode)

                    } else {
                        let controlDetails = null
                        if (isComponentInDesignMode) {
                            controlDetails = GLOBALS.designModeUiControlNameReturnsVueInstance[componentDetails.name]
                        } else {
                            controlDetails = GLOBALS.runtimeUiControlNameReturnsVueInstance[componentDetails.name]
                        }
                        fnDetails = controlDetails[methodId]
                    }
                    let retv = await fnDetails(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)


                    return retv
                }
            },
            getControlMethod:                       function        (  componentDefn  ,  componentDetails  ) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm                      = this
                let methodId                = componentDefn.id
                let methodFn                = componentDefn.fn
                let isAsync                 = true
                let isComponentInDesignMode = mm.design_mode



                if (!isValidObject(methodFn)) {
                    let allProps = GLOBALS.getControlPropertyDefns({baseComponentId: componentDetails.base_component_id})
                    if (allProps) {
                        for (let i=0;i<allProps.length;i++) {
                            let thisProp = allProps[i]
                            if (thisProp.id == methodId) {
                                if (thisProp.async) {
                                    isAsync = true
                                } else {
                                    isAsync = false
                                }
                            }
                        }
                    }
                }

                //   async
                if (isAsync || isValidObject(methodFn)){

                    return mm.getControlAsyncMethod(componentDetails, isComponentInDesignMode, methodId)

                    //   NOT async
                } else {

                    return mm.getControlNonAsyncMethod(componentDetails, isComponentInDesignMode, methodId)

                }

            },
            getFormMethod:                          function        (formName, formprop) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                return async function(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10) {
                    let formDetails = mm.model.forms[formName]
                    let thecode =
                        `(async function(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10) {
${formprop.fn}
})`

                    fnDetails = eval(thecode)
                    let retv = await fnDetails(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10)

                    return retv
                }

            },
            getAppMethod:                           function        (propDetailsId) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                return async function(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10) {

                    let origCode = mm.model[propDetailsId]
                    let thecode =
                        `(async function(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10) {
${origCode}
})`

                    fnDetails = eval(thecode)
                    let retv = await fnDetails(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10)


                    return retv
                }

            },
            deleteCursor:                           function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                document.getElementById(this.vb_grid_element_id).style.cursor = "crosshair"
                document.getElementById("grid_container").style.cursor = "default"
                if (this.oldCursor) {
                    this.cursorSource.style.cursor = this.oldCursor
                    this.oldCursor = null
                    this.cursorSource = null
                    this.newCursor = null
                }
            },
            switchCursor:                           function        (event, oldCursor, newCursor) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this

                mm.cursorSource              = event.target
                mm.cursorSource.style.cursor = newCursor
                mm.newCursor                 = newCursor
                mm.oldCursor                 = oldCursor

                document.getElementById(mm.vb_grid_element_id).style.cursor = newCursor
                document.getElementById("grid_container").style.cursor = newCursor


            },
            clickOnMainGrid:                        async function  (event) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                if (this.design_mode)
                {
                    event.stopPropagation();
                    if (this.highlighted_control)
                    {
                        let doc = document.documentElement;
                        let left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
                        let top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
                        let rrr = event.target.getBoundingClientRect()
                        let offsetX = (event.clientX - rrr.left )
                        let offsetY = (event.clientY - rrr.top )
                        let parentType = null
                        let parentName = null
                        let parentOffsetX = 0
                        let parentOffsetY = 0
                        let newItem2 = new Object()
                        let data = {
                            type:       "add_component",
                            base_component_id:        this.highlighted_control,
                            offsetX:     offsetX,
                            offsetY:     offsetY
                        }

                        let parentContainer = this.getContainerForPoint(  offsetX,  offsetY  )
                        if (parentContainer) {
                            parentOffsetX = parentContainer.x
                            parentOffsetY = parentContainer.y
                            parentType      = parentContainer.base_component_id
                            parentName    = parentContainer.name
                        }

                        //debugger
                        await this.addComponentV2(  offsetX,
                            offsetY,
                            data,
                            parentType,
                            parentName,
                            [])

                        this.highlighted_control = null

                    } else {
                        this.selectForm(this.active_form, true);
                    }
                }

            },
            getContainerForPoint:                   function        (leftX,topY) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */

                let ccc = this.model.forms[this.active_form].components
                for (let ytr = 0;ytr < ccc.length;ytr++){
                    let baseId =    ccc[ytr].base_component_id
                    let controlNmae =    ccc[ytr].name
                    let x1 =        ccc[ytr].leftX
                    let x2 =        ccc[ytr].leftX + ccc[ytr].width
                    let y1 =        ccc[ytr].topY
                    let y2 =        ccc[ytr].topY + ccc[ytr].height
                    let isContainer = ccc[ytr].is_container
                    if (isContainer && (x1 <= leftX) && (leftX <= x2) && (y1 <= topY) && (topY <= y2)) {
                        return {
                            x:                  x1,
                            y:                  y1,
                            base_component_id:  ccc[ytr].base_component_id,
                            name:               ccc[ytr].name
                        }
                    }
                }
                return null
            },
            addComponent:                           async function  (leftX,topY,data, parentType, parentName, parentOffsetX, parentOffsetY,defProps) {
                /*
     ________________________________________
     |                                      |
     |                   |
     |                                      |
     |______________________________________|

     TO BE FILLED IN

     __________
     | Params |
     |        |______________________________________________________________
     |
     |     NONE
     |________________________________________________________________________ */
                //debugger
                await this.addComponentV2(leftX,topY,data, parentType, parentName, defProps)
            },
            addComponentV2:                         async function  (leftX,topY,data, parentType, parentName, defProps) {
                /*
    ________________________________________
    |           addComponentV2             |
    |______________________________________|
    Adds a component to the form
    __________
    | PARAMS |______________________________________________________________
    |
    |     leftX   where to place this control
    |     -----
    |
    |     topY   where to place this control
    |     ----
    |
    |     data    {
    |     ----       base_component_id:  ...
    |     ----       code_id:            ...
    |                control:            controlDetails
    |             }
    |
    |
    |     parentType   Only used when adding a component to a container
    |     ----------
    |
    |     parentName   Only used when adding a component to a container
    |     ----------
    |
    |     defProps   Only used when adding a component to a container
    |     --------
    |
    |________________________________________________________________________ */
                let mm = this

                let promise = new Promise(async function(returnfn) {
                    let newItem = new Object()

                    /*
         _______________________________________
         |    addComponentV2                    |
         |_________________                     |____________
                          | Calculate the x,y coordinates of
                          | the new component to be added.
                          |__________________________________
         */
                    newItem.leftX = Math.floor(leftX)
                    newItem.topY = Math.floor(topY)
                    if (newItem.leftX < 0) {
                        newItem.leftX = 0
                    }
                    if (newItem.topY < 0) {
                        newItem.topY = 0
                    }



                    /*
             _______________________________________
             |    addComponentV2                    |
             |_________________                     |____________
                              | Calculate the name of
                              | the new component
                              |__________________________________
            */
                    if (parentType) {
                        newItem.parent = parentName
                    }

                    if (data.control) {
                        newItem.name = data.control.name

                    } else {
                        newItem.name = data.base_component_id + "_" + mm.model.next_component_id++
                    }
                    newItem.base_component_id = data.base_component_id
                    newItem.code_id = data.code_id





                    /*
         _______________________________________
         |    addComponentV2                    |
         |_________________                     |____________
                          | If the component isn't loaded
                          | then load it
                          |__________________________________
         */
                    mm.refresh++
                    if (!GLOBALS.isComponentTypeCached(newItem.base_component_id)) {
                        if (newItem.code_id) {
                            await loadUiComponentsV4([{codeId: newItem.code_id}])
                        } else {
                            await loadUiComponentsV4([newItem.base_component_id])
                        }
                        mm.components_used_in_this_app[newItem.base_component_id] = true
                    }

                    //qqqDONE
                    //if (GLOBALS.isComponentTypeCached(newItem.base_component_id)) {
                    //    newItem.code_id = GLOBALS.getCommitIdForBaseComponentId( newItem.base_component_id )

                    //    let compEvaled = GLOBALS.getControlPropertyDefns({baseComponentId: newItem.base_component_id})
                    //if (isValidObject(compEvaled1)) {
                    if (GLOBALS.isComponentTypeCached(newItem.base_component_id)) {
                        //newItem.code_id = compEvaled1.code_id
                        newItem.code_id = GLOBALS.getCommitIdForBaseComponentId( newItem.base_component_id )
                        //let compEvaled = compEvaled1.properties
                        let compEvaled = GLOBALS.getControlPropertyDefns({baseComponentId: newItem.base_component_id})
                        if (isValidObject(compEvaled)) {
                            for (let cpp = 0 ; cpp < compEvaled.length; cpp ++){
                                let prop = compEvaled[cpp].id

                                if (!isValidObject(newItem[prop])){
                                    if (isValidObject(compEvaled[cpp].default)) {
                                        newItem[prop] = JSON.parse(JSON.stringify(compEvaled[cpp].default))
                                    } else if (isValidObject(compEvaled[cpp].default_expression)){
                                        newItem[prop]  = eval("(" + compEvaled[cpp].default_expression + ")")
                                    } else {
                                        newItem[prop] = ""
                                    }
                                }
                            }
                        }
                    }


                    if (data.control) {
                        let allKeys = Object.keys(data.control)
                        for (let tt=0;tt<allKeys.length;tt++) {
                            let propName  = allKeys[tt]
                            let propValue = data.control[propName]
                            newItem[propName] = propValue
                        }
                    }



                    if (!isValidObject(newItem.width)) {
                        newItem.width = 100
                    }
                    if (!isValidObject(newItem.height)) {
                        newItem.height = 100
                    }

                    if ((newItem.leftX + newItem.width)
                        > mm.model.forms[mm.active_form].width) {
                        newItem.leftX = Math.floor(mm.model.forms[mm.active_form].width - newItem.width)
                    }
                    if ((newItem.topY + newItem.height)
                        > mm.model.forms[mm.active_form].height) {
                        newItem.topY = Math.floor(mm.model.forms[mm.active_form].height - newItem.height)
                    }


                    if (isValidObject(   defProps   )) {
                        let oo = Object.keys(defProps)
                        for (  let ee = 0  ;  ee < oo.length ;  ee++  ) {
                            let propName = oo[ee]
                            let propValue = defProps[propName]
                            newItem[propName] = propValue
                        }
                    }

                    mm.model.forms[mm.active_form].components.push(newItem)
                    mm.active_component_index = mm.model.forms[mm.active_form].components.length - 1

//debugger
                    //qqqDONE
                    let compCode = GLOBALS.getCodeForComponent({baseComponentId: newItem.base_component_id})
                    let childrenCode  = yz.getValueOfCodeString(compCode, "children",")//children")
                    if (isValidObject(childrenCode)) {
                        for (  let ee = 0  ;  ee < childrenCode.length ;  ee++  ) {
                            let childBaseId = childrenCode[ee].base_component_id
                            let childDefProps = childrenCode[ee].properties
                            await mm.addComponentV2(    0 ,
                                0 ,
                                {base_component_id: childBaseId} ,
                                newItem.base_component_id ,
                                newItem.name ,
                                childDefProps )
                        }
                    }


                    setTimeout(async function() {

                        mm.updateAllFormCaches()
                        let selectParent = false
                        let parentItemIndex = null
                        if (isValidObject(newItem.parent)) {
                            let parentItem = mm.form_runtime_info[mm.active_form].component_lookup_by_name[newItem.parent]

                            if (isValidObject(parentItem.select_parent_when_child_added) &&
                                (parentItem.select_parent_when_child_added == true)) {

                                selectParent = true
                                let ccc = mm.model.forms[mm.active_form].components
                                for (let ytr = 0;ytr < ccc.length;ytr++) {
                                    if (parentItem.name == ccc[ytr].name) {
                                        parentItemIndex = ytr
                                        break
                                    }
                                }
                            }
                        }



                        if (selectParent) {
                            mm.selectComponent(parentItemIndex, true)
                        } else {
                            mm.selectComponent(mm.active_component_index, true)
                        }
                        mm.refresh ++

//debugger
                        let newComponent = await mm.lookupComponentOnForm({componentName: newItem.name})
                        mm.addCodeChange("Add component: " + newItem.name + "(" + newItem.base_component_id + ")")
                        returnfn(newComponent)
                        //returnfn(null)
                    },100)

                })
                let ret = await promise
                return ret
            },
            selectComponentByName:                  function        (compName) {
                /*
                ________________________________________
                |                                      |
                |           selectComponentByName      |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                let parentItemIndex = -1;
                let ccc = mm.model.forms[mm.active_form].components
                for (let ytr = 0;ytr < ccc.length;ytr++) {
                    if (compName == ccc[ytr].name) {
                        parentItemIndex = ytr
                        break
                    }
                }
                if (parentItemIndex != -1) {
                    mm.selectComponent(parentItemIndex, true)
                }
                return null
            },
            addControl:                             async function  (controlDetails) {
                /*
                ________________________________________
                |              addControl              |
                |______________________________________|
                Adds a control to the page. eg:

                await mm.addControl(
                {
                    "leftX": 310,
                    "topY": 10,
                    "name": "mycontrol",
                    "base_component_id": "button_control"
                })

                This function really seems to be a helper function for the more complex
                "addComponentV2" function

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     controlDetails:
                |________________________________________________________________________ */
                let mm = this
                let newControl = await mm.addComponentV2( 10,
                    10,
                    {
                        base_component_id: controlDetails.base_component_id
                        ,
                        control: controlDetails
                    },
                    controlDetails.parent_base_component_id,
                    controlDetails.parent_name,
                    [])
                mm.highlighted_control = null
                mm.updateAllFormCaches()
                mm.refresh ++

                return newControl
            },
            getControlByName:                       function        (controlName) {
                /*
                ________________________________________
                |                                      |
                |          getControlByName            |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                let control = mm.model.forms.Form_1.components[controlName]
                for (let tt=0;tt<mm.model.forms.Form_1.components.length;tt++) {
                    if (mm.model.forms.Form_1.components[tt].name == controlName) {
                        return mm.model.forms.Form_1.components[tt]
                    }
                }
                return null
            },
            refreshControlIndexes:                  function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                if (mm.active_component_detail_name) {

                    let ccc = mm.model.forms[this.active_form].components
                    for (let ytr = 0;ytr < ccc.length;ytr++) {
                        if (this.active_component_detail_name == ccc[ytr].name) {
                            this.active_component_detail_name = ytr
                            break
                        }
                    }

                } else {
                    this.active_component_detail_name = null

                }

            },
            hasMoreDetailsUi:                       function        (formName, componentIndex) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                let component = mm.model.forms[formName].components[componentIndex]
                if (isValidObject(component.parent)) {
                    let ccc = mm.model.forms[formName].components
                    for (let ytr = 0;ytr < ccc.length;ytr++) {
                        if (component.parent == ccc[ytr].name) {
                            if (ccc[ytr].hide_children) {
                                return false
                            }
                            break
                        }
                    }
                }

                if (component.has_details_ui) {
                    return true
                }


                return false
            },
            isVisible:                              function        (formName, componentIndex) {
                /*
     ________________________________________
     |                                      |
     |                   |
     |                                      |
     |______________________________________|

     TO BE FILLED IN

     __________
     | Params |
     |        |______________________________________________________________
     |
     |     NONE
     |________________________________________________________________________ */
                let mm = this
                let component = mm.model.forms[formName].components[componentIndex]
                if (!component) {
                    return false
                }
                if (component.hidden) {
                    return false
                }

                if (isValidObject(component.parent)) {
                    let ccc = mm.model.forms[formName].components
                    for (let ytr = 0;ytr < ccc.length;ytr++) {
                        if (ccc[ytr]) {
                            if (component.parent == ccc[ytr].name) {
                                if (ccc[ytr].hide_children) {
                                    return false
                                }
                                break
                            }
                        }
                    }
                }

                return true
            },
            getLeft:                                function        (formName, componentIndex) {
                /*
     ________________________________________
     |                                      |
     |                   |
     |                                      |
     |______________________________________|

     TO BE FILLED IN

     __________
     | Params |
     |        |______________________________________________________________
     |
     |     NONE
     |________________________________________________________________________ */
                let mm = this
                let component = mm.model.forms[formName].components[componentIndex]
                if (!component) {
                    return 0
                }
                let left = component.leftX

                if (isValidObject(component.parent)) {
                    let ccc = mm.model.forms[formName].components
                    for (let ytr = 0;ytr < ccc.length;ytr++){
                        if (component.parent == ccc[ytr].name) {
                            left = left + ccc[ytr].leftX
                            break
                        }
                    }
                }


                return left
            },
            getTop:                                 function        (formName, componentIndex) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                let component = mm.model.forms[formName].components[componentIndex]
                if (!component) {
                    return 0
                }
                let top = component.topY
                if (isValidObject(component.parent)) {
                    let ccc = mm.model.forms[formName].components
                    for (let ytr = 0;ytr < ccc.length;ytr++){
                        if (component.parent == ccc[ytr].name) {
                            top = top + ccc[ytr].topY
                            break
                        }
                    }
                }
                return top
            },
            getChildren:                            function        ( itemName ) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */

                let mm = this
                let ccc = mm.model.forms[mm.active_form].components
                let chh = []
                for (let ytr = 0;ytr < ccc.length;ytr++){
                    if (ccc[ytr].parent == itemName) {
                        ccc[ytr].index_in_parent_array = ytr
                        chh.push(ccc[ytr])
                    }
                }
                return chh
            },
            previewUpload:                          function        (property) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this;
                let file    = document.getElementById('image_file').files[0];
                let reader  = new FileReader();

                reader.addEventListener("load", function () {
                    mm.model.forms[mm.active_form].components[mm.active_component_index][property.id] = reader.result
                    mm.refresh ++
                }, false);

                if (file) {
                    reader.readAsDataURL(file);
                }
            },
            previewFileUpload:                      function        (property) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this;
                let file    = document.getElementById('upload_file').files[0];
                let reader  = new FileReader();

                reader.addEventListener("load", function () {
                    mm.model.forms[mm.active_form].components[mm.active_component_index][property.id] = reader.result
                    mm.refresh ++
                }, false);

                if (file) {
                    reader.readAsDataURL(file);
                }
            },
            showHelp:                               async function  (aa) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this


                if (this.ui_code_editor) {
                    if (mm.ui_code_editor.completer) {
                        mm.ui_code_editor.completer.detach()
                    }
                    mm.ui_code_editor.destroy()
                    mm.ui_code_editor = null

                    // ------------------ HACK CITY! -------------------------
                    // we need this line as otherwise the ace editor isnt always destroyed
                    // properly (related to deletion of the Ace editor parent nodes in Vue)
                    mm.design_mode_pane.type = null
                    // -------------------------------------------------------
                }

                setTimeout(function(){
                    mm.active_component_detail_name = null
                    mm.active_component_detail_index = null
                    mm.active_component_links_name = null
                    mm.active_component_links_index = null
                    mm.design_mode_pane.type = "help"
                    mm.design_mode_pane.help = aa.help
                    mm.refresh++
                },200)
            },
            selectFilePath:                         async function  (aa) {
                // -----------------------------------------------------
                //                     selectFilePath
                //
                // This is called when the "..." button is pressed for
                // a File Path property in the property inspector
                //
                // -----------------------------------------------------
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */

                //
                // if the code editor is already open then close it
                //

                let mm = this
                mm.gotoDragDropEditor()

                if (mm.ui_code_editor) {
                    if (mm.ui_code_editor.completer) {
                        mm.ui_code_editor.completer.detach()
                    }
                    mm.ui_code_editor.destroy()
                    mm.ui_code_editor = null
                }




                //
                // Set up the new code editor
                //

                setTimeout(function(){
                    mm.design_mode_pane.type                   = "file_path_selector"
                    mm.design_mode_pane.app_selected           = aa.app_selected
                    mm.design_mode_pane.active_form            = aa.active_form
                    mm.design_mode_pane.active_component_index = aa.active_component_index
                    mm.design_mode_pane.property_id            = aa.property_id
                    mm.file_exts                               = aa.file_exts

                    setTimeout(function(){
                        mm.openFile()
                    },100)
                },100)


            },
            editAsCode:                             async function  (aa) {
                // -----------------------------------------------------
                //                      editAsCode
                //
                // This is called when the "..." button is pressed for
                // a property in the property inspector
                //
                // This can show code for the app, a form, and for
                // controls
                //
                // -----------------------------------------------------
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */

                //
                // if the code editor is already open then close it
                //

                let mm = this
                if (mm.ui_code_editor) {
                    if (mm.ui_code_editor.completer) {
                        mm.ui_code_editor.completer.detach()
                    }
                    mm.ui_code_editor.destroy()
                    mm.ui_code_editor = null
                }




                //
                // Set up the new code editor
                //

                setTimeout(function(){
                    mm.design_mode_pane.type                   = "event_editor"
                    mm.design_mode_pane.app_selected           = aa.app_selected
                    mm.design_mode_pane.active_form            = aa.active_form
                    mm.design_mode_pane.active_component_index = aa.active_component_index
                    mm.design_mode_pane.property_id            = aa.property_id

                    setTimeout(function(){
                        if (document.getElementById('ui_code_editor') && (mm.ui_code_editor == null)) {

                            //
                            //set up the ace editor for the timeline view
                            //

                            ace.config.set('basePath', '/');
                            mm.ui_code_editor = ace.edit( "ui_code_editor",
                                {
                                    selectionStyle:  "text",
                                    mode:            "ace/mode/javascript"
                                })

                            //
                            //Hack city! Need a delay when setting theme or view is corrupted
                            //

                            setTimeout(function(){
                                mm.ui_code_editor.setTheme("ace/theme/sqlserver");
                            },100)



                            //
                            // Stylize the code editor
                            //

                            document.getElementById("ui_code_editor").style["font-size"]    = "16px"
                            document.getElementById("ui_code_editor").style.width           = "100%"
                            document.getElementById("ui_code_editor").style.border          = "0px solid #2C2828"
                            document.getElementById("ui_code_editor").style.height          = "55vh"



                            //
                            // Get the code and store it in "ccode"
                            //
                            // The code is obtained from the VueJS model, depending on whether
                            // it is a control, a form, or application code
                            //


                            let ccode = ""

                            // application code (THIS MUST BE FIST IN THE IF STATEMENT)
                            if (aa.property_id && mm.model[aa.property_id] && isValidObject(mm.model[aa.property_id].fn)) {
                                ccode = mm.model[aa.property_id].fn
                            } else if (mm.model.app_selected) {
                                ccode = mm.model[aa.property_id]


                                // form code
                            } else if ((mm.active_component_index == null) && (mm.active_form != null)) {
                                ccode = mm.model.forms[mm.active_form][aa.property_id]

                                // component code
                            } else if ((mm.active_component_index != null) && (mm.active_form != null)) {
                                ccode = mm.model.forms[mm.active_form].components[mm.active_component_index][aa.property_id]
                            }



                            if (!isValidObject(ccode)) {
                                ccode = ""
                            }


                            mm.ui_code_editor.getSession().setValue(ccode);
                            mm.ui_code_editor.getSession().setUseWorker(false);

                            mm.ui_code_editor.on("change", function(e) {
                                let newC = mm.ui_code_editor.getValue()
                                try {
                                    //
                                    // whack city: we add the new line as o0therwise an error on the last
                                    // line generates an error  during code entry time, which we can detect
                                    // below by only flagging an error if the line exists within the typed
                                    // code
                                    //
                                    let newNode = esprima.parse("(async function(){" + newC + "\n})", { tolerant: true })
                                    //alert(JSON.stringify(newNode.errors, null, 2))
                                    mm.errors = newNode.errors
                                    if (mm.errors) {
                                        if (mm.errors.length == 0) {
                                            mm.errors = null
                                        } else {
                                            mm.errors = mm.errors[0]
                                        }
                                    }

                                } catch (e) {
                                    if (e.lineNumber) {
                                        let newC = mm.ui_code_editor.getValue()
                                        let lineCount =  newC.split(/\r\n|\r|\n/).length
                                        if (e.lineNumber > lineCount) {
                                            mm.errors = null
                                        } else {
                                            mm.errors = e
                                        }
                                    } else {
                                        mm.errors = null
                                    }

                                } finally {

                                }



                                if (aa.property_id && mm.model[aa.property_id] && isValidObject(mm.model[aa.property_id].fn)) {
                                    mm.model[aa.property_id].fn = newC
                                } else if (aa.app_selected) {
                                    mm.model[aa.property_id] = newC
                                } else if ((mm.active_component_index == null) && (mm.active_form != null)) {
                                    mm.model.forms[mm.active_form][aa.property_id] = newC

                                } else if ((mm.active_component_index != null) && (mm.active_form != null)) {
                                    mm.model.forms[mm.active_form].components[mm.active_component_index][aa.property_id] = newC
                                }
                                mm.$root.$emit('message', {
                                    type:   "pending"
                                })
                            })

                            mm.updateAllFormCaches()
                            mm.setupCodeAutocompletions()

                            mm.ui_code_editor.focus();
                        }
                    },100)
                },100)


                mm.setupCodeEditorSelectors(aa.property_id)

            },
            gotoLine:                               function        (line) {
                this.ui_code_editor.gotoLine(line , 10, true);
            },
            setupCodeAutocompletions:               function        () {
                // -----------------------------------------------------
                //                  setupCodeAutocompletions
                //
                // This is called when editing event code to autocomplete
                // form names, control names, and methods
                //
                //
                //
                // -----------------------------------------------------
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */

                let mm          = this
                let langTools   = ace.require("ace/ext/language_tools");

                //
                // Clear any default autocompleters that have been set
                //

                langTools.setCompleters([]);



                //
                // Create the autocompleter
                //

                let autocompleterFunction = {
                    identifierRegexps: [/[a-zA-Z_0-9.]/]
                    ,
                    getCompletions: function(editor, session, pos, prefix, callback) {
                        //console.log("Called autocompleterFunction: " + pos + " : " + prefix)

                        //
                        // If no text entered then do nothing
                        //

                        if (prefix.length === 0) {
                            callback(null, []);
                            return
                        }




                        //
                        // Get the first part of the text to autocomplete
                        //

                        let firstObjectToAutocomplete = null
                        if (prefix.indexOf(".") != -1) {
                            firstObjectToAutocomplete = prefix.substring(0,prefix.indexOf("."))
                            //console.log("firstObjectToAutocomplete: " + firstObjectToAutocomplete)
                        }


                        let wordList = []

                        //
                        // Create the list of initial objects to complete:
                        // app, forms, controls
                        //

                        if (firstObjectToAutocomplete == null) {

                            wordList.push(  {"word":    "app",
                                "freq":     24,
                                "score":    300,
                                "flags":    "bc",
                                "syllables":"1",
                                meta:      "Main application"
                            })

                            wordList.push(  {"word":    "forms",
                                "freq":     24,
                                "score":    300,
                                "flags":    "bc",
                                "syllables":"1",
                                meta:      "List of forms"
                            })

                            if (mm.design_mode_pane.app_selected) {
                                wordList.push(  {"word":    "me",
                                    "freq":     24,
                                    "score":    300,
                                    "flags":    "bc",
                                    "syllables":"1",
                                    meta:      "The current app"
                                })

                            } else if (mm.design_mode_pane.active_component_index == null) {
                                wordList.push(  {"word":    "me",
                                    "freq":     24,
                                    "score":    300,
                                    "flags":    "bc",
                                    "syllables":"1",
                                    meta:      "The current form"
                                })

                            } else {
                                wordList.push(  {"word":    "me",
                                    "freq":     24,
                                    "score":    300,
                                    "flags":    "bc",
                                    "syllables":"1",
                                    meta:      "The current control"
                                })
                                wordList.push(  {"word":    "myForm",
                                    "freq":     24,
                                    "score":    300,
                                    "flags":    "bc",
                                    "syllables":"1",
                                    meta:      "The current form"
                                })
                            }

                            wordList.push(  {"word":    "parent",
                                "freq":     24,
                                "score":    300,
                                "flags":    "bc",
                                "syllables":"1",
                                meta:      "The parent/container control of this"
                            })

                            let ccc = mm.model.forms[mm.active_form].components
                            for (   let ytr = ccc.length - 1;    ytr >= 0;    ytr--   ) {
                                let component = ccc[ytr]
                                wordList.push(  {"word":    component.name,
                                    "freq":     24,
                                    "score":    300,
                                    "flags":    "bc",
                                    "syllables":"1",
                                    meta:      "Control"
                                })
                            }

                            ccc = Object.keys(mm.model.forms)
                            for (   let ytr = ccc.length - 1;    ytr >= 0;    ytr--   ) {
                                wordList.push(  {"word":    ccc[ytr],
                                    "freq":     24,
                                    "score":    300,
                                    "flags":    "bc",
                                    "syllables":"1",
                                    meta:      "Form"
                                })
                            }



                            //
                            // If we have ented an object and pressed "." (period)
                            // then we need to add the method that comes after the
                            // period, eg:
                            //
                            // my_label.set|
                            //         .setText()
                            //         .setWidth()    <- choose one
                            //         .setHeight()
                            //

                        } else {

                            //
                            // Find out what the left hand side of the "." represents. Is
                            // it a component, a form, or the app?
                            //

                            let componentId = null
                            let formName    = null
                            let isApp       = false



                            if (firstObjectToAutocomplete == "me") {

                                if (mm.design_mode_pane.app_selected) {

                                } else if (isValidObject(mm.design_mode_pane.active_component_index)) {
                                    componentId = mm.model.forms[mm.active_form].components[ mm.design_mode_pane.active_component_index ].base_component_id

                                } else if (isValidObject(mm.design_mode_pane.active_form)) {
                                    formName = mm.active_form
                                }

                            } else if (firstObjectToAutocomplete == "myForm") {

                                formName = mm.active_form

                            } else if (firstObjectToAutocomplete == "parent") {

                                if (mm.design_mode_pane.app_selected) {

                                } else if (isValidObject(mm.design_mode_pane.active_component_index)) {
                                    let parentId = mm.model.forms[mm.active_form].components[ mm.design_mode_pane.active_component_index ].parent
                                    if (isValidObject(parentId)) {
                                        componentId = mm.form_runtime_info[mm.active_form].component_lookup_by_name[parentId].base_component_id
                                    }

                                } else if (isValidObject(mm.design_mode_pane.active_form)) {
                                }

                            } else if (firstObjectToAutocomplete == "app") {

                                isApp = true

                            } else {

                                //
                                // see if the word is a component
                                //

                                let comps       = mm.model.forms[mm.active_form].components

                                for (let rt=0; rt < comps.length; rt++) {
                                    if (comps[rt].name == firstObjectToAutocomplete) {
                                        componentId = comps[rt].base_component_id
                                    }
                                }


                                //
                                // see if the word is a form
                                //

                                let formNames       = Object.keys(mm.model.forms)

                                for (let rt=0; rt < formNames.length; rt++) {
                                    let formName1 = formNames[rt]
                                    if (formName1 == firstObjectToAutocomplete) {
                                        formName = formName1
                                    }
                                }


                            }



                            //
                            // if a component was entered
                            //

                            if (componentId) {
                                let controlProperties = mm.getControlProperties(componentId)
                                for (let fg=0;fg < controlProperties.length;fg++){
                                    let comm = controlProperties[fg]
                                    let propName = firstObjectToAutocomplete + "." + comm.id
                                    let meta = "Property"
                                    if (isValidObject(comm.snippet)) {
                                        propName = firstObjectToAutocomplete + "." + comm.snippet
                                    }
                                    if (isValidObject(comm.pre_snippet)) {
                                        propName = comm.pre_snippet + propName
                                    }
                                    if (comm.type == "Action") {
                                        meta = "Method"
                                    }

                                    let addProp = true
                                    if (comm.type == "Event") {
                                        addProp = false
                                    }

                                    if (addProp) {
                                        wordList.push({ "word":         propName ,
                                            "freq":         24,
                                            "score":        300,
                                            "flags":        "bc",
                                            "syllables":    "1",
                                            "meta":         meta
                                        })
                                    }
                                }




                                //
                                // if a form was entered
                                //

                            } else if (formName) {

                                let formProps = mm.getFormProperties(formName)
                                for (let formPropIndex = 0 ; formPropIndex < formProps.length ; formPropIndex++ ) {

                                    let propDetails = formProps[formPropIndex]
                                    let propName    = firstObjectToAutocomplete + "." + propDetails.id
                                    let meta        = "Property"

                                    if (isValidObject(propDetails.snippet)) {
                                        propName = firstObjectToAutocomplete + "." + propDetails.snippet
                                    }
                                    if (isValidObject(propDetails.pre_snippet)) {
                                        propName = propDetails.pre_snippet + propName
                                    }
                                    if (propDetails.type == "Action") {
                                        meta = "Method"
                                    }
                                    if (propDetails.type == "Event") {
                                        meta = "Event"
                                    }

                                    wordList.push({ "word":         propName ,
                                        "freq":         24,
                                        "score":        300,
                                        "flags":        "bc",
                                        "syllables":    "1",
                                        "meta":         meta
                                    })
                                }


                                //
                                // if the main object is the VB app
                                //

                            } else if (isApp) {

                                let appProps = mm.getAllAppPropeties()
                                for (let formPropIndex = 0 ; formPropIndex < appProps.length ; formPropIndex++ ) {

                                    let propDetails = appProps[formPropIndex]
                                    let propName    = firstObjectToAutocomplete + "." + propDetails.id
                                    let meta        = "Property"

                                    if (isValidObject(propDetails.snippet)) {
                                        propName = firstObjectToAutocomplete + "." + propDetails.snippet
                                    }
                                    if (isValidObject(propDetails.snippet)) {
                                        propName = propDetails.snippet + propName
                                    }
                                    if (propDetails.type == "Action") {
                                        meta = "Method"
                                    }
                                    if (propDetails.type == "Event") {
                                        meta = "Event"
                                    }

                                    wordList.push({ "word":         propName ,
                                        "freq":         24,
                                        "score":        300,
                                        "flags":        "bc",
                                        "syllables":    "1",
                                        "meta":         meta
                                    })
                                }

                            }
                        }

                        callback(null, wordList.map(function(ea) {
                            return {name: ea.word, value: ea.word, score: ea.score, meta: ea.meta}
                        }));


                    }
                }
                langTools.addCompleter(autocompleterFunction);



                mm.ui_code_editor.commands.addCommand({
                    name: "showOtherCompletions",
                    bindKey: ".",
                    exec: function(editor) {
                        mm.ui_code_editor.session.insert(mm.ui_code_editor.getCursorPosition(), ".")
                        mm.ui_code_editor.completer.updateCompletions()
                    }
                })

                mm.ui_code_editor.setOptions({
                    enableBasicAutocompletion: false,
                    enableSnippets: false,
                    enableLiveAutocompletion: true
                });
            },
            setupCodeEditorSelectors:               function        (   property_id   ) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this

                setTimeout( function() {

                    //
                    // Add the selectors using the SelectR library
                    //

                    if (!document.getElementById("select_code_object_parent")) {
                        return; }
                    document.getElementById("select_code_object_parent").innerHTML=' <select id=select_code_object ></select>'
                    if (!document.getElementById("select_code_action_parent")) {
                        return; }
                    document.getElementById("select_code_action_parent").innerHTML=' <select id=select_code_action ></select>'



                    //
                    //   initialise vars
                    //

                    let objectListForSelector  = []
                    let methodListForSelector  = []
                    let indexObjectSelector    = 0
                    let indexActionSelector    = 0
                    let selectedCodeObject     = null
                    let selectedCodeAction     = null



                    //
                    // if we selected the app or a form
                    //

                    if (mm.model.app_selected || (!isValidObject(mm.active_component_index))) {

                        if (mm.edited_app_component_id) {
                            objectListForSelector.push(
                                {
                                    value:      "" + indexObjectSelector,
                                    app:        mm.edited_app_component_id,
                                    form:       null,
                                    component:  null
                                })
                        }

                        if (mm.model.app_selected) {
                            selectedCodeObject = indexObjectSelector
                        }
                        indexObjectSelector++

                        let forms = mm.getForms()
                        for (  let ere7 = 0; ere7 < forms.length; ere7++  ) {
                            let form = forms[ ere7 ]
                            objectListForSelector.push(
                                {
                                    value:      "" + indexObjectSelector,
                                    app:        null,
                                    form:       form.name,
                                    component:  null
                                }
                            )
                            if ((!mm.model.app_selected) && (form.name == mm.active_form)) {
                                selectedCodeObject = indexObjectSelector
                            }
                            indexObjectSelector++


                            //
                            // show the sub controls of this form if it is the current form
                            //

                            if ((!mm.model.app_selected) && (form.name == mm.active_form)) {
                                let components = mm.getActiveFormComponents()
                                for (  let ere1 = 0; ere1 < components.length; ere1++  ) {
                                    let component = components[ ere1 ]
                                    objectListForSelector.push(
                                        {
                                            value:              "" + indexObjectSelector,
                                            app:                null,
                                            form:               mm.active_form,
                                            component:          "  -  " + component.name,
                                            component_scope:     component.base_component_id,
                                            component_index:    ere1
                                        }
                                    )
                                    if (mm.active_component_index == ere1) {
                                        selectedCodeObject = indexObjectSelector
                                    }
                                    indexObjectSelector++
                                }
                            }
                        }

                        //
                        // if we selected a component
                        //
                    } else if (isValidObject(mm.active_component_index)) {

                        objectListForSelector.push(
                            {
                                value:      "" + indexObjectSelector,
                                app:        null,
                                form:       mm.active_form,
                                component:  null
                            }
                        )
                        indexObjectSelector++

                        let components = mm.getActiveFormComponents()
                        for (  let ere8 = 0; ere8 < components.length; ere8++  ) {
                            let component = components[ ere8 ]
                            objectListForSelector.push(
                                {
                                    value:              "" + indexObjectSelector,
                                    app:                null,
                                    form:               mm.active_form,
                                    component:          "  -  " + component.name,
                                    component_scope:     component.base_component_id,
                                    component_index:    ere8
                                }
                            )
                            if (mm.active_component_index == ere8) {
                                selectedCodeObject = indexObjectSelector
                            }
                            indexObjectSelector++
                        }
                    }



                    //
                    //   get the list of properties
                    //


                    //
                    // get the app methods
                    //
                    if (mm.model.app_selected) {
                        let allProperties = mm.getAllAppPropeties()
                        for (let ui=0;ui < allProperties.length; ui ++) {
                            let prop = allProperties[ui]
                            if ((prop.type == "Event") || (prop.type == "Action")) {
                                methodListForSelector.push(
                                    {
                                        value:              "" + indexActionSelector,
                                        app:                mm.edited_app_component_id,
                                        form:               mm.active_form,
                                        component:          null,
                                        action_id:          prop.id,
                                        action_name:        prop.name,
                                        action_type:        prop.type
                                    }
                                )
                                if (prop.id == property_id) {
                                    selectedCodeAction = indexActionSelector
                                }
                                indexActionSelector++
                            }
                        }


                    } else if (  isValidObject(mm.active_component_index)  ) {
                        let ccc        = mm.model.forms[mm.active_form].components[mm.active_component_index]
                        let properties = mm.getComponentProperties(  ccc.base_component_id  )

                        for (  let ere9 = 0;  ere9 < properties.length;  ere9++  ) {
                            let property = properties[ ere9 ]
                            if (property.type == "Event") {
                                methodListForSelector.push(
                                    {
                                        value:              "" + indexActionSelector,
                                        app:                null,
                                        form:               mm.active_form,
                                        component:          ccc.name,
                                        action_id:          property.id,
                                        action_name:        property.name,
                                        action_type:        property.type,
                                        action_index:       ere9
                                    }
                                )
                                if (property.id == property_id) {
                                    selectedCodeAction = indexActionSelector
                                }
                                indexActionSelector++
                            }
                        }

                        methodListForSelector.push(
                            {
                                value:              "" + indexActionSelector,
                                app:                null,
                                form:               mm.active_form,
                                component:          ccc.name,
                                action_id:          "load",
                                action_name:        "Load event",
                                action_type:        "Event",
                                action_index:       null
                            })
                        if ( property_id == "load" ) {
                            selectedCodeAction = indexActionSelector
                        }
                        indexActionSelector++


                        methodListForSelector.push(
                            {
                                value:              "" + indexActionSelector,
                                app:                null,
                                form:               mm.active_form,
                                component:          ccc.name,
                                action_id:          "on_property_in",
                                action_name:        "On Property In",
                                action_type:        "Event",
                                action_index:       null
                            })
                        if ( property_id == "on_property_in" ) {
                            selectedCodeAction = indexActionSelector
                        }
                        indexActionSelector++





                        methodListForSelector.push(
                            {
                                value:              "" + indexActionSelector,
                                app:                null,
                                form:               mm.active_form,
                                component:          ccc.name,
                                action_id:          "on_property_changed",
                                action_name:        "On Property Changed",
                                action_type:        "Event",
                                action_index:       null
                            })
                        if ( property_id == "on_property_changed" ) {
                            selectedCodeAction = indexActionSelector
                        }
                        indexActionSelector++




                        methodListForSelector.push(
                            {
                                value:              "" + indexActionSelector,
                                app:                null,
                                form:               mm.active_form,
                                component:          ccc.name,
                                action_id:          "on_property_out",
                                action_name:        "On Property Out",
                                action_type:        "Event",
                                action_index:       null
                            })
                        if ( property_id == "on_property_out" ) {
                            selectedCodeAction = indexActionSelector
                        }
                        indexActionSelector++




                        // get the actions for the forms
                    } else if (  isValidObject(mm.active_form)  ) {
                        let ccc        = mm.model.forms[mm.active_form]

                        let properties = mm.getComponentProperties(  ccc.base_component_id  )


                        methodListForSelector.push(
                            {
                                value:              "" + indexActionSelector,
                                app:                null,
                                form:               mm.active_form,
                                component:          ccc.name,
                                action_id:          "form_activate",
                                action_name:        "Activate Event",
                                action_type:        "Event",
                                action_index:       null
                            })
                        if ( property_id == "form_activate" ) {
                            selectedCodeAction = indexActionSelector
                        }
                        indexActionSelector++
                    }





                    selectCodeObject = new Selectr(
                        document.getElementById('select_code_object'),
                        {
                            renderOption:       mm.myDataRenderFunction,
                            renderSelection:    mm.myDataRenderFunction,
                            selectedValue:      selectedCodeObject,
                            data:               objectListForSelector,
                            customClass:       'my-custom-selectr',
                            searchable:         false
                        });

                    selectCodeAction = new Selectr(
                        document.getElementById('select_code_action'),
                        {
                            renderOption:       mm.actionRenderFunction,
                            renderSelection:    mm.actionRenderFunction,
                            selectedValue:      selectedCodeAction,
                            data:               methodListForSelector,
                            customClass:       'my-custom-selectr',
                            searchable:         false
                        });

                    document.getElementsByClassName("selectr-selected")[0].style.padding = "1px"
                    document.getElementsByClassName("selectr-selected")[0].style["border-top"] = "2px solid gray"
                    document.getElementsByClassName("selectr-selected")[0].style["border-left"] = "2px solid gray"

                    document.getElementsByClassName("selectr-selected")[1].style.padding = "1px"
                    document.getElementsByClassName("selectr-selected")[1].style["border-top"] = "2px solid gray"
                    document.getElementsByClassName("selectr-selected")[1].style["border-left"] = "2px solid gray"

                    document.getElementsByClassName("selectr-selected")[2].style.padding = "1px"
                    document.getElementsByClassName("selectr-selected")[2].style["border-top"] = "2px solid gray"
                    document.getElementsByClassName("selectr-selected")[2].style["border-left"] = "2px solid gray"

                    selectCodeObject.on('selectr.select', function(option) {
                        let dd = objectListForSelector[option.idx]
                        if (dd.component) {
                            mm.selectComponent(dd.component_index)
                            mm.editAsCode({
                                app_selected:           false,
                                active_form:            mm.active_form,
                                active_component_index: mm.active_component_index,
                                property_id:            "load"
                            })
                        } else if (dd.form) {
                            mm.selectForm(dd.form)
                            mm.editAsCode({
                                app_selected:           false,
                                active_form:            dd.form,
                                active_component_index: null,
                                property_id:            "form_activate"
                            })
                        } else if (dd.app) {
                            mm.select_app()
                            mm.editAsCode({
                                app_selected:           true,
                                active_form:            mm.active_form,
                                active_component_index: null,
                                property_id:            "app_started_event"

                            })
                        }
                    });

                    selectCodeAction.on('selectr.select', function(option) {
                        let dd = methodListForSelector[option.idx]
                        mm.editAsCode({
                            app_selected:           mm.app_selected,
                            active_form:            mm.active_form,
                            active_component_index: mm.active_component_index,
                            property_id:            dd.action_id
                        })
                    });


                },100)
            },
            getActiveFormComponents:                function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                return this.model.forms[this.active_form].components
            },
            updateAllFormCaches:                    function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                if (typeof (this.inUpdateAllFormCaches) == 'undefined') {
                    this["inUpdateAllFormCaches"] = false
                }
                if (this.inUpdateAllFormCaches) {
                    return
                }
                this.inUpdateAllFormCaches = true

                this.watchList = []
                //console.log( "1: " + this.unique_app_dom_element_id  + ": " + JSON.stringify(this.watchList,null,2))

                let llf = Object.keys(this.model.forms)
                for (let ii = 0; ii < llf.length ; ii ++) {
                    let formqq = this.model.forms[llf[ii]]
                    if (formqq != null) {
                        this.updateFormCache(formqq.name)
                    }
                }

                this.inUpdateAllFormCaches = false
            },
            gotoDragDropEditor:                     function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                this.design_mode_pane.type = "drag_drop";
                if (this.ui_code_editor) {
                    if (this.ui_code_editor.completer) {
                        this.ui_code_editor.completer.detach()
                    }
                    this.ui_code_editor.destroy()
                    this.ui_code_editor = null
                }
                this.active_component_detail_name = null
                this.active_component_detail_index = null
                this.active_component_links_name = null
                this.active_component_links_index = null

            },
            updateFormCache:                        function        (formName) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                //debugger
                let mm = this
                let form = this.model.forms[formName]
                let components = form.components
                if (!isValidObject(this.form_runtime_info[formName])) {
                    this.form_runtime_info[formName] = new Object()
                }
                this.form_runtime_info[formName].component_lookup_by_name = {}
                this.form_runtime_info[formName].component_lookup_by_uuid = {}
                this.form_runtime_info[formName].component_incoming_count_by_uuid = {}
                this.form_runtime_info[formName].component_outgoing_count_by_uuid = {}

                for (let gjh = 0; gjh < components.length; gjh ++) {
                    let cc = components[gjh]
                    if (isValidObject(cc)) {
                        this.form_runtime_info[formName].component_lookup_by_name[cc.name] = cc
                    }
                    if (!cc.uuid) {
                        cc.uuid = uuidv4()
                        this.refresh ++
                    }
                    this.form_runtime_info[formName].component_lookup_by_uuid[cc.uuid] = cc


                    if (!this.watchList) {
                        this.watchList = []
                        //console.log( "2: " + this.unique_app_dom_element_id  + ": " + JSON.stringify(this.watchList,null,2))
                    }
                    if (this.watchList) {
                        //debugger
                        if (cc.watch) {
                            //debugger
                            for (let ff=0;ff<cc.watch.length;ff++){
                                this.watchList.push(
                                    {
                                        form_name:                      formName
                                        ,
                                        to_component_name:              cc.name
                                        ,
                                        to_component_uuid:              cc.uuid
                                        ,
                                        to_component_property_name:     cc.watch[ff].send_to
                                        ,
                                        from_component_uuid:            cc.watch[ff].uuid
                                        ,
                                        from_component_property_name:   cc.watch[ff].property
                                        ,
                                        type:                           "watch"
                                        ,
                                        transform_fn:                   cc.watch[ff].transform_fn
                                    })


                                if (this.form_runtime_info[formName].component_incoming_count_by_uuid[cc.uuid]) {
                                    this.form_runtime_info[formName].component_incoming_count_by_uuid[cc.uuid] ++
                                } else {
                                    this.form_runtime_info[formName].component_incoming_count_by_uuid[cc.uuid] = 1
                                }

                                if (this.form_runtime_info[formName].component_outgoing_count_by_uuid[cc.watch[ff].uuid]) {
                                    this.form_runtime_info[formName].component_outgoing_count_by_uuid[cc.watch[ff].uuid] ++
                                } else {
                                    this.form_runtime_info[formName].component_outgoing_count_by_uuid[cc.watch[ff].uuid] = 1
                                }

                                //console.log( "3: " + this.unique_app_dom_element_id  + ": " + JSON.stringify(this.watchList,null,2))
                            }
                        }
                        //console.log("Watch list setup")
                        //console.log(JSON.stringify(this.watchList,null,2))
                        if (cc.push) {
                            //debugger
                            for (let ff=0;ff<cc.push.length;ff++){
                                this.watchList.push(
                                    {
                                        form_name:                      formName
                                        ,
                                        from_component_name:              cc.name
                                        ,
                                        from_component_uuid:            cc.uuid
                                        ,
                                        from_component_property_name:   cc.push[ff].property
                                        ,
                                        to_component_uuid:              cc.push[ff].uuid
                                        ,
                                        to_component_property_name:     cc.push[ff].send_to
                                        ,
                                        type:                           "push"
                                        ,
                                        transform_fn:                   cc.push[ff].transform_fn
                                    })
                                if (this.form_runtime_info[formName].component_incoming_count_by_uuid[cc.push[ff].uuid]) {
                                    this.form_runtime_info[formName].component_incoming_count_by_uuid[cc.push[ff].uuid] ++
                                } else {
                                    this.form_runtime_info[formName].component_incoming_count_by_uuid[cc.push[ff].uuid] = 1
                                }

                                if (this.form_runtime_info[formName].component_outgoing_count_by_uuid[cc.uuid]) {
                                    this.form_runtime_info[formName].component_outgoing_count_by_uuid[cc.uuid] ++
                                } else {
                                    this.form_runtime_info[formName].component_outgoing_count_by_uuid[cc.uuid] = 1
                                }

                                //console.log( "3: " + this.unique_app_dom_element_id  + ": " + JSON.stringify(this.watchList,null,2))
                            }
                        }

                    }
                }
                mm.updateComponentMethods()


            },
            chooseRight:                            function        (ff) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                this.right_mode = ff
            },
            getForms:                               function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let forms = []
                let llf = Object.keys(this.model.forms)
                for (let ii = 0; ii < llf.length ; ii ++) {
                    let form = this.model.forms[llf[ii]]
                    if (form != null) {
                        forms.push(form)
                    }
                }
                return forms
            },
            getFormProperties:                      function        (    formName    ) {
                //-------------------------------------------------------------------
                //                        getFormProperties
                //
                //                          event, property
                //-------------------------------------------------------------------
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let props = []
                props.push({   id:     "name",   name:   "Name",   type:   "String"    })
                props.push({   id:     "width",   name:   "Width",   type:   "Number"    })
                props.push({   id:     "height",   name:   "Height",   type:   "Number"    })
                props.push({   id:     "form_activate",   name:   "Activate Event",   type:   "Event"    })


                props.push({   id:         "add_control",
                    name:       "Add Control()",
                    type:       "Action"  ,
                    snippet:    `add_control({name: "name_of_new_control"})`,
                    help:       `<div>Help text for
                                            <b>addControl</b> method
                                            <br/><br/>
                                            Call <b>form.addControl({ })</b> to add a new control to this form
                                         </div>`,
                    fn:
                        `mm.addControl(  arg1  )
return {}
`                       })



//alert(formName)

                props.push({    id:     "show",
                    name:   "Show form()",
                    type:   "Action"  ,
                    snippet:    `show()`,
                    help:       `<div>Help text for
                                           <b>show</b> method
                                           <br/><br/>
                                           Call <b>form.show()</b> to show this form
                                        </div>`,
                    fn:
                        `mm.selectForm(formName)
return {}
`                       })




                return props
            },
            setVBEditorPropertyValue:               function        (property, val ) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm      = this
                let type    = null

                mm.showSaveButton()


                //
                // determine if this is a control, form or app
                //
                if (this.active_component_index != null) {
                    type = "component"
                } else if ((this.active_component_index == null) && (this.active_form != null) && (!this.model.app_selected)) {
                    type = "form"
                } else if (this.model.app_selected) {
                    type = "app"
                }


                if (type == 'component') {
                    let componentTochange = mm.model.forms[this.active_form].components[this.active_component_index]
                    let oldContainerName = componentTochange.name

                    //hack city!!!!
                    // why do we need a timeout just so that the FilePath property gets
                    // handled properly??
                    setTimeout(function() {
                        componentTochange[property.id]  = val

                        if ((property.id == "name") && (componentTochange.is_container == true)) {
                            //alert("renaming container")

                            let allC = mm.model.forms[mm.active_form].components
                            for (let xi =0; xi< allC.length ; xi ++) {
                                let comp = allC[xi]
                                if (comp.parent == oldContainerName) {
                                    comp.parent = componentTochange.name
                                }
                            }
                        }
                        //this.generateCodeFromModel(   )
                        mm.refresh ++

                    },100)

                } else if (type == 'form') {
                    if (property.id == "name" ) {
                        this.properties = []

                        let oldval = this.active_form
                        //alert("Rename form "  + oldval + " to " + val)

                        this.model.forms[val] = this.model.forms[oldval]
                        this.model.forms[val]["name"] = val

                        this.form_runtime_info[val] = this.form_runtime_info[oldval]


                        if (this.model.default_form == oldval) {
                            this.model.default_form = val
                        }
                        //this.active_form = val


                        mm.form_runtime_info[oldval] = null
                        mm.model.forms[oldval] = null
                        //alert(this.active_form)

                        //mm.refresh ++
                        //mm.updateAllFormCaches()
                        mm.selectForm(val)

                    } else {
                        this.model.forms[this.active_form][property.id] = val
                    }

                } else if (type == 'app') {
                    this.model[property.id] = val
                }

            },
            setVBEditorProperty:                    function        (event, property) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm      = this
                let val     = null

                if (property.type == "Number") {
                    val     = JSON.parse(event.target.value)
                } else {
                    val     = event.target.value
                }
                mm.setVBEditorPropertyValue(property, val)
            },
            getVBEditorProperty:                    function        (property) {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let val = ""
                let type
                if (this.active_component_index != null) {
                    type = "component"
                } else if ((this.active_component_index == null) && (this.active_form != null) && (!this.model.app_selected)) {
                    type = "form"
                } else if (this.model.app_selected) {
                    type = "app"
                }

                if (type == 'component') {
                    val = this.model.forms[this.active_form].components[this.active_component_index][property.id]


                } else if (type == 'form') {
                    val = this.model.forms[this.active_form][property.id]



                } else if (type == 'app') {
                    val = this.model[property.id]
                }

                return val
            },
            addProperty:                            function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                mm.add_property = true
                mm.new_property_id = ""
                mm.new_property_name = ""
                mm.new_property_type = "String"


                setTimeout(function(){
                    let objDiv = document.getElementById("property_scroll_region");
                    objDiv.scrollTop = objDiv.scrollHeight;
                },200)
            },
            addPropertySave:                        function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                if ((mm.new_property_name.length == 0) || (mm.new_property_id.length == 0)) {
                    alert("You must enter a property name and ID")
                    return;
                }
                mm.add_property = false

                let fnText = null
                if (mm.new_property_type == "Action") {
                    fnText = ""
                }

                let defaultVal = null
                if (mm.new_property_type == "Object") {
                    defaultVal = new Object()
                }

                if (mm.new_property_type == "Array") {
                    defaultVal = []
                }

                mm.model.app_properties.push({
                    id:         mm.new_property_id,
                    name:       mm.new_property_name,
                    type:       mm.new_property_type,
                    fn:         fnText,
                    default:    defaultVal
                })

                mm.generateCodeFromModel( )

                setTimeout(function() {
                        mm.refresh ++
                        mm.select_app()
                    }
                    ,100)

            },
            addPropertyCancel:                      function        () {
                /*
                ________________________________________
                |                                      |
                |                   |
                |                                      |
                |______________________________________|

                TO BE FILLED IN

                __________
                | Params |
                |        |______________________________________________________________
                |
                |     NONE
                |________________________________________________________________________ */
                let mm = this
                mm.add_property = false
            },
            getComponentProperties:                 function        (componentType) {
                /*
    ________________________________________
    |                                      |
    |        getComponentProperties        |
    |                                      |
    |______________________________________|

    TO BE FILLED IN
    __________
    | Params |
    |        |______________________________________________________________
    |
    |     componentName     The component type
    |     -------------
    |________________________________________________________________________ */
//qqq
                let compEvaled = GLOBALS.getControlPropertyDefns({baseComponentId: componentType})
                if (isValidObject(compEvaled)) {
                    return compEvaled
                }
                return []
            },
            //*** gen_end ***//

        }
    }
}
