"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLC = void 0;
const vscode = require("vscode");
const modbus = require('jsmodbus');
const net = require('net');
class PLC {
    constructor() {
        this.cycle = null;
        this.state = 0;
        this.code = "";
        this.scan = 10;
        this.init();
    }
    init() {
        vscode.window.showInformationMessage('Welcome Use VSPLC');
        this.state = 0;
        if (this.cycle !== null) {
            clearInterval(this.cycle);
        }
    }
    setscan(num) {
        this.scan = num;
    }
    start(code) {
        this.code = code;
        if (this.cycle !== null) {
            clearInterval(this.cycle);
        }
        this.logic(code);
    }
    stop() {
        if (this.cycle !== null) {
            clearInterval(this.cycle);
        }
    }
    logic(code) {
        let cyccleCode = `
        `;
        this.findCode(code, "", (rcode, hcode) => {
            let headCode = `
            var vsplcWholeCounter=0;
            ${hcode}
            `;
            let ncode = headCode + `
            setInterval(()=>{
                ${rcode}
                vsplcWholeCounter++;
            },10)
            `;
            try {
                this.cycle = eval(ncode);
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    findCode(code, res, cb) {
        let sindex = code.indexOf('//startplccyclecode'); //19
        if (sindex >= 0) {
            let eindex = code.indexOf('//endplccyclecode'); //17
            if (eindex >= 0) {
                let nres = code.slice(sindex + 19, eindex);
                nres = nres.replace('//startplccyclecode', "");
                res += nres;
                // console.log("***********:" + code.slice(eindex).replace('//endplccyclecode', ""));
                this.findCode(code.slice(0, sindex) + code.slice(eindex + 17), res, cb);
            }
        }
        else {
            // console.log(res,code);
            cb(res, code);
        }
    }
    client() {
    }
}
exports.PLC = PLC;
//# sourceMappingURL=plc.js.map