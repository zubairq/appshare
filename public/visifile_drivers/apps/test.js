{
    doc_type: 'visifile'
    ,
    name: 'test'
    ,
    version: 1
    ,
    type: 'app'
    ,
    text: 'Test app'

    ,
    initText: 'Test is ALIVE!!!!'
    ,
    events: {
        "This will return the test app": {
            on: "app",
            do: function(args, returnfn) {
                returnfn(
                    new Moon({
                      el: "#" + args.root_element
                      ,
                      template: `<div>Okhay this is a test app: {{msg}} 2</div>
                       `
                      ,
                      data: {
                        msg: "some data"
                    },
                    methods: {
                    },
                      store: store
                    })
                )


            }, end: null
        }

    }

}
