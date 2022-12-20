
import { Console } from 'console';
import * as vscode from 'vscode';
const modbus = require('jsmodbus');
const net = require('net');

class PLC {
    cycle: NodeJS.Timeout | null = null;
    state: number = 0;
    code: string = "";
    scan: number = 10;
    socket: any;
    constructor() {
        this.init();
    }

    private init() {
        vscode.window.showInformationMessage('Welcome Use VSPLC');
        this.state = 0;
        if (this.cycle !== null) {
            clearInterval(this.cycle);
        }
    }
    public setscan(num: number) {
        this.scan = num;
    }
    public start(code: string) {

        this.code = code;
        if (this.cycle !== null) {
            clearInterval(this.cycle);
        }

        this.logic(code);

    }
    public stop() {
        if (this.cycle !== null) {
            clearInterval(this.cycle);
        }
    }
    public logic(code: string) {
        let cyccleCode = `
        `;

        this.findCode(code, "", (rcode: string, hcode: string) => {
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
            } catch (e) {
                console.log(e);
            }
        });



    }

    private findCode(code: string, res: string, cb: Function) {
        let sindex = code.indexOf('//startplccyclecode');//19
        if (sindex >= 0) {
            let eindex = code.indexOf('//endplccyclecode');//17
            if (eindex >= 0) {
                let nres = code.slice(sindex+19, eindex);
                nres = nres.replace('//startplccyclecode', "");
                res += nres;

                // console.log("***********:" + code.slice(eindex).replace('//endplccyclecode', ""));
                this.findCode(code.slice(0, sindex)+code.slice(eindex+17), res, cb);
            }

        } else {
            // console.log(res,code);
            cb(res, code);
        }

    }
    private client() {

    }


}
export { PLC };