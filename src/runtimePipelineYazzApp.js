{
    pipelineCode: async function() {
        //*** gen_start ***//
        {
            let texti       = null
            let designMode  = false
            let runtimeMode = true

            Vue.component('_REPLACE_THIS_WITH_BASE_COMPONENT_ID_', {
                props:      [ "args"],
                template:   /* ** *** insert_ui_template_start *** ** */
                            /* ** *** insert_ui_template_end *** ** */,
                mounted:    //*** paste_mounted_start ***//
                            //*** paste_mounted_end ***//
                            ,
                watch:      //*** paste_watch_start ***//
                            //*** paste_watch_end ***//
                            ,
                methods:    {
                    /* ** *** insert_ui_methods_start *** ** */
                    /* ** *** insert_ui_methods_end *** ** */
                },
                data:       function () {
                    return {
                        code_changes:                        [],
                        showFilePicker:                      false,
                        editor_locked:                       false,
                        open_file_path:                      "/",
                        open_file_list:                      [],
                        open_file_name:                      "",
                        file_exts:                           [],
                        errors:                              null,
                        inUpdateAllFormCaches:               false,
                        newCursor:                           null,
                        watchList:                           [],
                        selectedWatchComponentUuid:          null,
                        selectedWatchFromProperty:           null,
                        selectedWatchTransformFn:            null,
                        selectedWatchToProperty:             null,
                        selectedWatchFromProperties:         [],
                        selectedWatchToProperties:           [],
                        linkSideSelected:                    "none",
                        fromLinkPropertySelected:            false,
                        toLinkPropertySelected:              false,
                        selected_link_component_type:        null,
                        incoming_link_objects:               [],
                        outgoing_link_objects:               [],
                        incoming_link_component_types:       [],
                        outgoing_link_component_types:       [],
                        selectedWatchComponentType:          null,
                        selectedPushComponentType:           null,
                        selectedPushComponentUuid:           null,
                        selectedPushFromProperty:            null,
                        selectedPushTransformFn:             null,
                        selectedPushToProperty:              null,
                        selectedPushFromProperties:          [],
                        selectedPushToProperties:            [],
                        oldCursor:                           null,
                        cursorSource:                        null,
                        unique_app_dom_element_id:           null,
                        vb_grid_element_id:                  null,
                        vb_editor_element_id:                null,
                        debug_component:                     null,
                        in_generate_code_from_model:         false,
                        design_mode:                         designMode,
                        runtime_mode:                        runtimeMode,
                        highlighted_control:                 null,
                        edited_app_component_id:             null,
                        event_code:                          null,
                        text:                                texti,
                        leftHandWidth:                       130,
                        right_mode:                          "project",
                        add_property:                        false,
                        new_property_name:                   "",
                        new_property_id:                     "",
                        new_property_type:                   "",
                        local_app:                           false,
                        refresh:                             0,
                        properties:                          [],
                        read_only:                           false,
                        selected_pane:                       null,
                        active_property_index:               null,
                        design_mode_pane:                    {type: "drag_drop"},
                        show_advanced_transform:             false,
                        available_components:                [],
                        components_used_in_this_app:         new Object(),
                        ui_code_editor:                      null,
                        form_runtime_info:                   {},
                        active_form:                         "Form_1",
                        old_model:                           {},
                        model_changed_time:                  -1,
                        in_change_model:                     false,
                        active_component_index:              null,
                        active_component_detail_index:       null,
                        active_component_detail_name:        null,
                        active_component_links_index:        null,
                        active_component_links_name:         null,
                        model:
                        /* ** insert_app_model_start ** */
                        {
                        }
                        /* ** insert_app_model_end ** */
                    }
                }
            })
        }
        //*** gen_end ***//
    }
}
