import * as vscode from 'vscode';

/**
 * Interface representing statistics for C++ logic and loop constructs.
 * 
 * Tracks counts of different conditional statements and loops
 * found in C++ source code files.
 * 
 * @property {number} if - Count of 'if' statements
 * @property {number} elseIf - Count of 'else if' statements
 * @property {number} else - Count of 'else' statements (excluding 'else if')
 * @property {number} while - Count of 'while' loops (excluding 'do while')
 * @property {number} doWhile - Count of 'do-while' loops
 * @property {number} for - Count of 'for' loops
 * @property {number} total - Total count of all logical constructs
 * 
 * @example
 * // Example stats object:
 * const stats: LogicStats = {
 *   if: 5,
 *   elseIf: 3,
 *   else: 2,
 *   while: 4,
 *   doWhile: 1,
 *   for: 6,
 *   total: 21
 * };
 */
interface LogicStats {
    if: number;
    elseIf: number;
    else: number;
    while: number;
    doWhile: number;
    for: number;
    total: number;
}

/**
 * Main extension activation function.
 * 
 * Initializes the C++ Logic & Loop Counter extension by:
 * - Creating a status bar item for displaying statistics
 * - Setting up event listeners for document changes
 * - Registering commands for manual control
 * - Starting initial analysis of active document
 *
 * @param context - The VS Code extension context for managing subscriptions and resources
 * 
 * @example
 * // Called automatically by VS Code when extension is activated
 * activate(context);
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('C++ Logic & Loop Counter activated');
    
    /**
     * Status bar item for displaying C++ construct statistics.
     * Positioned on the right side with priority 100.
     * @type {vscode.StatusBarItem}
     */
    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    
    /**
     * Counts C++ logic and loop constructs in the given text.
     * 
     * Uses regular expressions to identify and count different
     * C++ constructs. Handles edge cases like distinguishing
     * 'else if' from separate 'else' and 'if' statements.
     * 
     * @param text - The source code text to analyze
     * @returns {LogicStats} Object containing counts of all detected constructs
     * 
     * @example
     * // Analyzing C++ code:
     * const code = "if (x) { for (int i=0; i<10; i++) { } } else if (y) { }";
     * const stats = countConstructs(code);
     * // Returns: { if: 1, elseIf: 1, else: 0, while: 0, doWhile: 0, for: 1, total: 3 }
     */
    function countConstructs(text: string): LogicStats {
        const stats: LogicStats = {
            if: 0,
            elseIf: 0,
            else: 0,
            while: 0,
            doWhile: 0,
            for: 0,
            total: 0
        };
        
        // Count 'if' statements (pattern: "if (")
        stats.if = (text.match(/\bif\s*\(/g) || []).length;
        
        // Count 'else if' statements (pattern: "else if (")
        stats.elseIf = (text.match(/\belse\s+if\s*\(/g) || []).length;
        
        // Count 'while' loops (excluding 'do while', pattern: "while (")
        stats.while = (text.match(/\bwhile\s*\(/g) || []).length;
        
        // Count 'do while' loops (count 'do' keywords)
        const doMatches = text.match(/\bdo\b/g) || [];
        stats.doWhile = doMatches.length;
        
        // Count 'for' loops (pattern: "for (")
        stats.for = (text.match(/\bfor\s*\(/g) || []).length;
        
        // Count 'else' statements (excluding 'else if')
        const totalElse = (text.match(/\belse\b/g) || []).length;
        stats.else = totalElse - stats.elseIf;  // Subtract 'else if' occurrences
        
        // Calculate total sum of all constructs
        stats.total = stats.if + stats.elseIf + stats.else + 
                     stats.while + stats.doWhile + stats.for;
        
        return stats;
    }
    
    /**
     * Updates the status bar with current C++ construct statistics.
     * 
     * Analyzes the active text editor's document if it's a C++/C file,
     * counts constructs, and updates the status bar display.
     * Shows different formats based on available space and preferences.
     * 
     * @returns {void}
     * 
     * @example
     * // Updates status bar to show: "$(symbol-boolean)5 $(symbol-loop)3 $(refresh)2"
     * // Tooltip shows detailed breakdown on hover
     */
    function updateStatusBar() {
        const editor = vscode.window.activeTextEditor;
        
        // No active editor - show placeholder
        if (!editor) {
            statusBar.text = "C++: No file";
            statusBar.hide();
            return;
        }
        
        // Only analyze C/C++ files
        if (editor.document.languageId !== 'cpp' && 
            editor.document.languageId !== 'c') {
            statusBar.hide();
            return;
        }
        
        const text = editor.document.getText();
        const stats = countConstructs(text);
        
        /**
         * Format options for status bar display:
         * 
         * Option 1: Compact format - "C++: 15 (if:5 for:4)"
         * Option 2: Icon format - uses VS Code icons (current selection)
         * Option 3: Detailed format - shows all construct types
         */
        
        // Current: Icon format with VS Code icons
        statusBar.text = `$(symbol-boolean)${stats.if} $(symbol-loop)${stats.for} $(refresh)${stats.while}`;
        
        /**
         * Tooltip shown on hover with detailed statistics.
         * Uses box-drawing characters for visual separation.
         * 
         * @type {string}
         */
        statusBar.tooltip = `C++ Logic Constructs:
        ─────────────────
        If: ${stats.if}
        Else If: ${stats.elseIf}
        Else: ${stats.else}
        For: ${stats.for}
        While: ${stats.while}
        Do-While: ${stats.doWhile}
        ─────────────────
        Total: ${stats.total}`;
        
        statusBar.show();
    }
    
    /**
     * Command handler for manual statistics update.
     * 
     * Triggers status bar update and shows confirmation message.
     * Can be invoked via Command Palette or keybinding.
     * 
     * @returns {void}
     * 
     * @example
     * // Command: "C++ Counter: Update Statistics"
     * // Shows: "C++ counter updated" notification
     */
    const updateCommand = vscode.commands.registerCommand('cpp-counter.update', () => {
        updateStatusBar();
        vscode.window.showInformationMessage('C++ counter updated');
    });
    
    /**
     * Command handler for displaying detailed statistics.
     * 
     * Shows a detailed analysis in a notification popup
     * with formatted output including all construct types.
     * 
     * @returns {void}
     * 
     * @example
     * // Command: "C++ Counter: Show Details"
     * // Shows detailed popup with all statistics
     */
    const showDetailsCommand = vscode.commands.registerCommand('cpp-counter.showDetails', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        const text = editor.document.getText();
        const stats = countConstructs(text);
        
        /**
         * Formatted details string for popup display.
         * Uses box-drawing characters and emojis for visual appeal.
         * 
         * @type {string}
         */
        const details = `
            📊 C++ Code Analysis
            ══════════════════
            Conditional Statements:
            • If: ${stats.if}
            • Else If: ${stats.elseIf}
            • Else: ${stats.else}

            Loop Statements:
            • For: ${stats.for}
            • While: ${stats.while}
            • Do-While: ${stats.doWhile}

            ══════════════════
            Total Logical Constructs: ${stats.total}
        `;
        
        vscode.window.showInformationMessage(details.trim());
    });
    
    /**
     * Register all extension resources with VS Code context.
     * 
     * Includes:
     * - Event listeners for document changes
     * - Event listeners for editor changes
     * - Event listeners for file saves
     * - Registered commands
     * - Status bar item
     */
    context.subscriptions.push(
        // Update on text changes
        vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document === vscode.window.activeTextEditor?.document) {
                updateStatusBar();
            }
        }),
        
        // Update when switching editors
        vscode.window.onDidChangeActiveTextEditor(() => {
            updateStatusBar();
        }),
        
        // Update on file save
        vscode.workspace.onDidSaveTextDocument(() => {
            updateStatusBar();
        }),
        
        // Register commands
        updateCommand,
        showDetailsCommand,
        
        // Status bar item (disposed automatically)
        statusBar
    );
    
    // Initial analysis on activation
    updateStatusBar();
    
    console.log('C++ Logic & Loop Counter ready');
}

/**
 * Extension deactivation function.
 * 
 * Called automatically when the extension is deactivated or unloaded.
 * All cleanup is handled through disposable resources registered in context.subscriptions.
 * 
 * @returns {void}
 * 
 * @example
 * // Called automatically by VS Code when extension is deactivated
 * deactivate();
 */
export function deactivate() {
    console.log('C++ Logic & Loop Counter deactivated');
}