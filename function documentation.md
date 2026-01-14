# C++ Logic & Loop Counter Extension Documentation

## Function Reference

### Interface: `LogicStats`

**Purpose:** Represents statistics for C++ logic and loop constructs.

**Properties:**
- `if` (number) - Count of 'if' statements
- `elseIf` (number) - Count of 'else if' statements  
- `else` (number) - Count of 'else' statements (excluding 'else if')
- `while` (number) - Count of 'while' loops (excluding 'do while')
- `doWhile` (number) - Count of 'do-while' loops
- `for` (number) - Count of 'for' loops
- `total` (number) - Total count of all logical constructs

**Usage Example:**
```typescript
const stats: LogicStats = {
  if: 5,
  elseIf: 3,
  else: 2,
  while: 4,
  doWhile: 1,
  for: 6,
  total: 21
};
```

### Function: `activate`

**Purpose:** Main extension activation function.

**Parameters:**
- `context` (vscode.ExtensionContext) - The VS Code extension context for managing subscriptions and resources

**Algorithm:**
1. Creates a status bar item for displaying statistics
2. Sets up event listeners for document changes
3. Registers commands for manual control
4. Starts initial analysis of active document
5. Subscribes all resources to the extension context

**Functionality:**
- Automatically analyzes C++/C files when opened or modified
- Updates status bar in real-time as code changes
- Registers two commands for manual interaction
- Handles multiple event sources (text changes, editor switches, file saves)

### Function: `countConstructs`

**Purpose:** Counts C++ logic and loop constructs in the given text.

**Parameters:**
- `text` (string) - The source code text to analyze

**Returns:**
- `LogicStats` - Object containing counts of all detected constructs

**Algorithm:**
1. Counts 'if' statements using pattern `\bif\s*\(`
2. Counts 'else if' statements using pattern `\belse\s+if\s*\(`
3. Counts 'while' loops using pattern `\bwhile\s*\(` (excludes 'do while')
4. Counts 'do while' loops by counting 'do' keywords
5. Counts 'for' loops using pattern `\bfor\s*\(`
6. Calculates 'else' statements by subtracting 'else if' from total 'else'
7. Computes total sum of all constructs

**Usage Examples:**
```typescript
// Analyzing C++ code:
const code = "if (x) { for (int i=0; i<10; i++) { } } else if (y) { }";
const stats = countConstructs(code);
// Returns: { if: 1, elseIf: 1, else: 0, while: 0, doWhile: 0, for: 1, total: 3 }

// Complex C++ code analysis:
const complexCode = `
  if (condition) {
      for (int i = 0; i < n; i++) {
          while (test) {
              // code
          }
      }
  } else if (other) {
      do {
          // code
      } while (cond);
  } else {
      // final else
  }
`;
// Returns appropriate counts for all constructs
```

### Function: `updateStatusBar`

**Purpose:** Updates the status bar with current C++ construct statistics.

**Parameters:** None

**Returns:** void

**Algorithm:**
1. Checks if an active text editor exists
2. Verifies the document is a C++ or C file
3. Analyzes the document text using `countConstructs`
4. Updates the status bar text with formatted statistics
5. Sets a detailed tooltip for hover information
6. Shows or hides the status bar based on context

**Display Formats:**
1. **Compact format**: "C++: 15 (if:5 for:4)"
2. **Icon format** (current): Uses VS Code icons to display counts
   - `$(symbol-boolean)` for if statements
   - `$(symbol-loop)` for for loops  
   - `$(refresh)` for while loops
3. **Detailed format**: Shows all construct types explicitly

**Tooltip Format:**
```
C++ Logic Constructs:
─────────────────
If: 5
Else If: 3
Else: 2
For: 6
While: 4
Do-While: 1
─────────────────
Total: 21
```

### Command: `cpp-counter.update`

**Purpose:** Manual statistics update command.

**Parameters:** None

**Returns:** void

**Functionality:**
- Triggers immediate update of the status bar statistics
- Shows confirmation message: "C++ counter updated"
- Can be invoked via Command Palette or configured keybinding

**Usage:**
1. Open Command Palette (Ctrl+Shift+P)
2. Type "C++ Counter: Update Statistics"
3. Execute to refresh the displayed counts

### Command: `cpp-counter.showDetails`

**Purpose:** Displays detailed statistics in a popup.

**Parameters:** None

**Returns:** void

**Functionality:**
- Shows comprehensive analysis in a notification popup
- Uses formatted output with emojis and visual separators
- Displays all construct types with individual counts

**Output Format:**
```
📊 C++ Code Analysis
══════════════════
Conditional Statements:
• If: 5
• Else If: 3  
• Else: 2

Loop Statements:
• For: 6
• While: 4
• Do-While: 1

══════════════════
Total Logical Constructs: 21
```

### Event Handlers

**Document Change Handler:**
- Listens to `onDidChangeTextDocument` events
- Updates statistics when text in the active editor changes
- Ensures real-time feedback as code is being written

**Editor Change Handler:**
- Listens to `onDidChangeActiveTextEditor` events
- Updates statistics when switching between editors
- Maintains accurate counts for the currently focused file

**File Save Handler:**
- Listens to `onDidSaveTextDocument` events
- Updates statistics when files are saved
- Provides confirmation that saved file has been analyzed

### Function: `deactivate`

**Purpose:** Extension deactivation function.

**Parameters:** None

**Returns:** void

**Algorithm:**
1. Called automatically when extension is deactivated or unloaded
2. All cleanup is handled through disposable resources in `context.subscriptions`
3. Currently no additional cleanup required

**Features:**
- Automatic resource management via VS Code's disposable pattern
- No manual cleanup needed for registered commands and event listeners
- Can be extended for additional cleanup if required in future versions

## Extension Features Summary

**Automatic Analysis:**
- Real-time counting as you type
- Automatic detection of C++/C files
- Background processing without interrupting workflow

**Visual Feedback:**
- Status bar integration with icons
- Hover tooltips for detailed information
- Clean, unobtrusive display

**Manual Controls:**
- Update command for manual refresh
- Details command for comprehensive view
- Context-aware (only shows for C++/C files)

**Performance:**
- Efficient regex-based parsing
- Minimal overhead during normal editing
- Event-driven updates (no polling)