// @ts-ignore
const vscode = acquireVsCodeApi();

Blockly.Blocks['modbusclient'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("modbusClient:")
            .appendField(new Blockly.FieldTextInput("c1"), "name")
            .appendField("ip:")
            .appendField(new Blockly.FieldTextInput("127.0.0.1"), "ip")
            .appendField("port:")
            .appendField(new Blockly.FieldTextInput("502"), "port");
        this.appendStatementInput("cmd")
            .setCheck(null)
            .appendField("id:")
            .appendField(new Blockly.FieldTextInput("1"), "id")
            .appendField("scan:")
            .appendField(new Blockly.FieldNumber(5, 0), "scan")
            .appendField("x10ms");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(212);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.JavaScript['modbusclient'] = function (block) {
    var text_name = block.getFieldValue('name');
    var text_ip = block.getFieldValue('ip');
    var text_port = block.getFieldValue('port');
    var text_id = block.getFieldValue('id');
    var text_scan = block.getFieldValue('scan');
    var statements_cmd = Blockly.JavaScript.statementToCode(block, 'cmd');

    statements_cmd = statements_cmd.replace(/clientreplace/g, `client_${text_name}`);

    // TODO: Assemble JavaScript into code variable.

    var code = `var socket_${text_name} = new net.Socket();
    var client_${text_name} = new modbus.client.TCP(socket_${text_name}, ${text_id});
    socket_${text_name}.connect({ "host": "${text_ip}", "port": ${text_port} });

    //startplccyclecode
    if(vsplcWholeCounter%${text_scan}==0){
        ${statements_cmd}
    }
    //endplccyclecode
    `;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

Blockly.Blocks['modbusread'] = {
    init: function () {
        this.appendValueInput("list")
            .setCheck("Array")
            .appendField("modbusRead")
            .appendField(new Blockly.FieldDropdown([["01 readCoils", "01"], ["02readDiscreteInputs", "02"], ["03readHoldingRegisters", "03"], ["04readInputRegisters", "04"]]), "cmd")
            .appendField("address:")
            .appendField(new Blockly.FieldNumber(0, 0), "address")
            .appendField("length:")
            .appendField(new Blockly.FieldNumber(0, 0, Infinity, 1), "length");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(212);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.JavaScript['modbusread'] = function (block) {
    var dropdown_cmd = block.getFieldValue('cmd');
    var number_address = block.getFieldValue('address');
    var number_length = block.getFieldValue('length');
    var value_list = Blockly.JavaScript.valueToCode(block, 'list', Blockly.JavaScript.ORDER_ATOMIC);

    // TODO: Assemble JavaScript into code variable.
    let cmd = "readHoldingRegisters";
    switch (dropdown_cmd) {
        case '01': cmd = "readCoils";
            break;
        case '02': cmd = "readDiscreteInputs";
            break;
        case '03': cmd = 'readHoldingRegisters';
            break;
        case '04': cmd = 'readInputRegisters';
            break;
    }
    var code = `
    clientreplace.${cmd}(${number_address}, ${number_length}).then(function (resp) {
        ${value_list}=resp.response.body._valuesAsArray;
        // console.log(${value_list});
    }, (err) => {
        // console.log(err)
    });`;
    return code;
};

//modbus write
Blockly.Blocks['modbuswrite'] = {
    init: function () {
        this.appendValueInput("list")
            .setCheck("Array")
            .appendField("modbusWrite")
            .appendField("action")
            .appendField(new Blockly.FieldDropdown([["05writeSingleCoil", "05"], ["06writeSingleRegister", "06"], ["0FwriteMultipleCoils", "0F"], ["10writeMultipleRegisters", "10"]]), "cmd")
            .appendField("address:")
            .appendField(new Blockly.FieldNumber(0, 0), "address");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(212);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.JavaScript['modbuswrite'] = function (block) {
    var dropdown_cmd = block.getFieldValue('cmd');
    var number_address = block.getFieldValue('address');

    var value_list = Blockly.JavaScript.valueToCode(block, 'list', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    // console.log(value_list);
    // TODO: Assemble JavaScript into code variable.
    let cmd = "writeSingleCoil";
    switch (dropdown_cmd) {
        case '05': cmd = "writeSingleCoil";
            break;
        case '06': cmd = "writeSingleRegister";
            break;
        case '0F': cmd = 'writeMultipleCoils';
            break;
        case '10': cmd = 'writeMultipleRegisters';
            break;
    }

    var code = `
    clientreplace.${cmd}(${number_address},${value_list}).then(function (resp) {
   
        // console.log(${value_list});
    }, (err) => {
        // console.log(err)
    });`;
    return code;
}


Blockly.Blocks['logic_main'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("plc_logic()")
            .appendField("scan:")
            .appendField(new Blockly.FieldNumber(5, 1), "scan")
            .appendField("x10 ms");
        this.appendStatementInput("main")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['logic_main'] = function (block) {
    var number_scan = block.getFieldValue('scan');
    var statements_main = Blockly.JavaScript.statementToCode(block, 'main');
    // TODO: Assemble JavaScript into code variable.

    var code = `
    //startplccyclecode
    if(vsplcWholeCounter%${number_scan}==0){
        ${statements_main}
    }
    //endplccyclecode
    `;
    return code;
};

var toolbox = {
    "kind": "categoryToolbox",
    "contents": [
        {
            "kind": "category",
            "name": "Logic",
            "categorystyle": "logic_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "controls_if"
                },
                {
                    "kind": "block",
                    "type": "logic_compare"
                },
                {
                    "kind": "block",
                    "type": "logic_operation"
                },
                {
                    "kind": "block",
                    "type": "logic_negate"
                },
                {
                    "kind": "block",
                    "type": "logic_boolean"
                }
            ]
        },
        {
            "kind": "category",
            "name": "Loops",
            "categorystyle": "loop_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "controls_repeat_ext",
                    "inputs": {
                        "TIMES": {
                            "block": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 10
                                }
                            }
                        }
                    }
                }
            ]
        },
        {
            "kind": "category",
            "name": "Math",
            "categorystyle": "math_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "math_number",
                    "fields": {
                        "NUM": 123
                    }
                },
                {
                    "kind": "block",
                    "type": "math_arithmetic",
                    "fields": {
                        "OP": "ADD"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_single",
                    "fields": {
                        "OP": "ROOT"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_trig",
                    "fields": {
                        "OP": "SIN"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_constant",
                    "fields": {
                        "CONSTANT": "PI"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_number_property",
                    "extraState": "<mutation divisor_input=\"false\"></mutation>",
                    "fields": {
                        "PROPERTY": "EVEN"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_round",
                    "fields": {
                        "OP": "ROUND"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_on_list",
                    "extraState": "<mutation op=\"SUM\"></mutation>",
                    "fields": {
                        "OP": "SUM"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_modulo"
                },
                {
                    "kind": "block",
                    "type": "math_constrain",
                    "inputs": {
                        "LOW": {
                            "block": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 1
                                }
                            }
                        },
                        "HIGH": {
                            "block": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 100
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "math_random_int",
                    "kind": "block",
                    "inputs": {
                        "FROM": {
                            "block": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 1
                                }
                            }
                        },
                        "TO": {
                            "block": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 100
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "math_random_float"
                },
                {
                    "kind": "block",
                    "type": "math_atan2"
                }
            ]
        },
        {
            "kind": "category",
            "name": "Text",
            "categorystyle": "text_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "text"
                },
                {
                    "kind": "block",
                    "type": "text_length"
                },
                {
                    "kind": "block",
                    "type": "text_print"
                }
            ]
        },
        {
            "kind": "category",
            "name": "Variables",
            "categorystyle": "variable_category",
            "custom": "VARIABLE"
        },
        {
            "kind": "category",
            "name": "Lists",
            "categorystyle": "list_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "lists_create_empty"
                },
                {
                    "kind": "block",
                    "type": "lists_create_with",
                    "extraState": {
                        "itemCount": 3
                    }
                },
                {
                    "kind": "block",
                    "type": "lists_repeat",
                    "inputs": {
                        "NUM": {
                            "block": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 5
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "lists_length"
                },
                {
                    "kind": "block",
                    "type": "lists_isEmpty"
                },
                {
                    "kind": "block",
                    "type": "lists_indexOf",
                    "fields": {
                        "END": "FIRST"
                    }
                },
                {
                    "kind": "block",
                    "type": "lists_getIndex",
                    "fields": {
                        "MODE": "GET",
                        "WHERE": "FROM_START"
                    }
                },
                {
                    "kind": "block",
                    "type": "lists_setIndex",
                    "fields": {
                        "MODE": "SET",
                        "WHERE": "FROM_START"
                    }
                }
            ]
        },

        {
            "kind": "category",
            "name": "PLC",
            "categorystyle": "math_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "modbusclient"
                },
                {
                    "kind": "block",
                    "type": "modbusread"
                },
                {
                    "kind": "block",
                    "type": "modbuswrite"
                },
                {
                    "kind": "block",
                    "type": "logic_main"
                }
            ]

        },

    ]
}

var demoWorkspace = Blockly.inject('blocklyDiv',
    {
        media: 'https://unpkg.com/blockly/media/',
        toolbox: toolbox
    });
function runCode() {
    // Generate JavaScript code and display it.
    Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
    var code = Blockly.JavaScript.workspaceToCode(demoWorkspace);
    vscode.postMessage({
        type: 'code',
        code: code,

    });

    // console.log(code);
}

function stopCode() {
    vscode.postMessage({
        type: 'stop'
    });

}

function updateContent(xmlText) {
    let xml = Blockly.Xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(xml, demoWorkspace);
}
function clearWorkspace() {
    demoWorkspace.clear();
}
window.onload = function () {
    vscode.postMessage({
        type: 'load',
    });
}
var savedog;
demoWorkspace.addChangeListener((event) => {
    // console.log(event.type)
    if (event.type == "change" || event.type == "delete" || event.type == "drag") {

        clearTimeout(savedog)
        savedog = setTimeout(() => {
            const xml = Blockly.Xml.workspaceToDom(demoWorkspace);
            const xmlText = Blockly.Xml.domToText(xml);
            vscode.postMessage({
                type: 'change',
                code: xmlText,
            });
        }, 500);
    }



});

window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent

    switch (message.type) {
        case 'update':
            demoWorkspace.clear();
            const text = message.text;
            // console.log(text);
            // Update our webview's content
            updateContent(text);
            vscode.setState({ text });
            return;
    }
});
const state = vscode.getState();

//create value

function createVar(name) {
    if (!name) {
        name = document.getElementById('narname').value;
    }
    demoWorkspace.createVariable(name, "");

}


function clear() {
    demoWorkspace.clear();
    console.log(demoWorkspace.createVariable)
}


if (state) {
    updateContent(state.text);
}


/** Override Blockly.dialog.setAlert() with custom implementation. */
Blockly.dialog.setAlert(function (message, callback) {
    console.log('Alert: ' + message);
    console.log(message);
});


/** Override Blockly.dialog.setConfirm() with custom implementation. */
Blockly.dialog.setConfirm(function (message, callback) {
    console.log('Confirm: ' + message);
    callback(true);

});

/** Override Blockly.dialog.setPrompt() with custom implementation. */
Blockly.dialog.setPrompt(function (message, defaultValue, callback) {
    console.log('Prompt: ' + message);

});