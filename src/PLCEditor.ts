import * as vscode from 'vscode';
import { getNonce } from './util';
import { PLC } from './plc';


/**
 * Provider for cat scratch editors.
 * 
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class PLCEditorProvider implements vscode.CustomTextEditorProvider {

  public static register(context: vscode.ExtensionContext): vscode.Disposable {


    const provider = new PLCEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(PLCEditorProvider.viewType, provider);
    return providerRegistration;
  }


  private static readonly viewType = 'vsplc.editor';
  private nplc: PLC = new PLC();
  private static readonly scratchCharacters = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '🙀', '😿', '🐱'];
  private code: string = "";
  constructor(
    private readonly context: vscode.ExtensionContext
  ) {

  }

  /**
   * Called when our custom editor is opened.
   * 
   * 
   */

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      console.log("vscode update");
      webviewPanel.webview.postMessage({
        type: 'update',
        text: document.getText(),
      });
    }
    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    // 
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)


    // const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
    //   console.log(e);
    //   console.log("document change");
    //   // console.log(document.uri.toString());
    //   if (e.document.uri.toString() === document.uri.toString()) {
    //     // updateWebview();
    //   }
    // });

    // // // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {

      this.nplc.stop();
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(e => {
      switch (e.type) {
        case 'stop':
          this.nplc.stop();
          return;
        case 'code':
          let code = e.code;
          code = code.replace(/window.alert/g, 'console.log ');
          this.code = code;
          console.log(code);
          // eval(code);
          // vscode.window.showInformationMessage("dsadsadas");
          this.nplc.start(code);
          return;
        case 'change':
          this.updateTextDocument(document, e.code);
          return;
        case 'load':
          updateWebview();
          return;
      }
    });

    updateWebview();
  }


  /**
   * Get the static html used for the editor webviews.
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    // Local path to script and css for the webview
    const scriptUri1 = webview.asWebviewUri(vscode.Uri.joinPath(
      this.context.extensionUri, 'media', 'blockly_compressed.js'));
    const scriptUri2 = webview.asWebviewUri(vscode.Uri.joinPath(
      this.context.extensionUri, 'media', 'blocks_compressed.js'));
    const scriptUri3 = webview.asWebviewUri(vscode.Uri.joinPath(
      this.context.extensionUri, 'media', 'en.js'));
    const scriptUri4 = webview.asWebviewUri(vscode.Uri.joinPath(
      this.context.extensionUri, 'media', 'javascript_compressed.js'));
    const scriptUri5 = webview.asWebviewUri(vscode.Uri.joinPath(
      this.context.extensionUri, 'media', 'zblockly.js'));
    // const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
    //     this.context.extensionUri, 'media', 'vscode.css'));

    // const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
    //     this.context.extensionUri, 'media', 'catScratch.css'));

    // Use a nonce to whitelist which scripts can be run`
    const nonce = getNonce();

    return /* html */`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Blockly Demo: Fixed Blockly</title>
          <script nonce="${nonce}" src="${scriptUri1}"></script>
          <script nonce="${nonce}" src="${scriptUri2}"></script>
          <script nonce="${nonce}" src="${scriptUri3}"></script>
          <script nonce="${nonce}" src="${scriptUri4}"></script>


            <style>
            body{
              color: black;
            }
            .demo {
              padding: 0.5rem;
            }
          </style>
        </head>
        <body>
          <div class="demo">
          <p>
          <button onClick="runCode()"> run</button>
          <button onClick="stopCode()"> stop</button>

        
          <input id="narname"></input>
          <button onClick="createVar()">newVar</button>
         
          </p>
     
          <div id="blocklyDiv" style="height: 75vh; width: 80vw;"></div>
          </div>
          <script nonce="${nonce}" src="${scriptUri5}"> </script>
        
        </body>
        </html>
        `;
  }

  /**
   * Add a new scratch to the current document.
   */
  private addNewScratch(document: vscode.TextDocument) {
    const json = this.getDocumentAsJson(document);
    const character = PLCEditorProvider.scratchCharacters[Math.floor(Math.random() * PLCEditorProvider.scratchCharacters.length)];
    json.scratches = [
      ...(Array.isArray(json.scratches) ? json.scratches : []),
      {
        id: getNonce(),
        text: character,
        created: Date.now(),
      }
    ];

    return this.updateTextDocument(document, json);
  }

  /**
   * Delete an existing scratch from a document.
   */
  private deleteScratch(document: vscode.TextDocument, id: string) {
    const json = this.getDocumentAsJson(document);
    if (!Array.isArray(json.scratches)) {
      return;
    }

    json.scratches = json.scratches.filter((note: any) => note.id !== id);

    return this.updateTextDocument(document, json);
  }

  /**
   * Try to get a current document as json text.
   */
  private getDocumentAsJson(document: vscode.TextDocument): any {
    const text = document.getText();
    if (text.trim().length === 0) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Could not get document as json. Content is not valid json');
    }
  }

  /**
   * Write out the json to a given document.
   */
  private updateTextDocument(document: vscode.TextDocument, xml: string) {
    const edit = new vscode.WorkspaceEdit();
    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      xml);
    return vscode.workspace.applyEdit(edit);
  }
}
