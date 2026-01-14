"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    console.log('C++ Logic & Loop Counter activated');
    // Создаем статус-бар элемент
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    // Функция подсчета конструкций
    function countConstructs(text) {
        const stats = {
            if: 0,
            elseIf: 0,
            else: 0,
            while: 0,
            doWhile: 0,
            for: 0,
            total: 0
        };
        // Упрощенный подсчет через регулярные выражения
        stats.if = (text.match(/\bif\s*\(/g) || []).length;
        stats.elseIf = (text.match(/\belse\s+if\s*\(/g) || []).length;
        // while циклы (но не do while)
        stats.while = (text.match(/\bwhile\s*\(/g) || []).length;
        // do while циклы
        const doMatches = text.match(/\bdo\b/g) || [];
        stats.doWhile = doMatches.length;
        // for циклы
        stats.for = (text.match(/\bfor\s*\(/g) || []).length;
        // else (исключая else if)
        const totalElse = (text.match(/\belse\b/g) || []).length;
        stats.else = totalElse - stats.elseIf;
        // Общая сумма
        stats.total = stats.if + stats.elseIf + stats.else +
            stats.while + stats.doWhile + stats.for;
        return stats;
    }
    // Функция обновления статус-бара
    function updateStatusBar() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            statusBar.text = "C++: No file";
            statusBar.hide();
            return;
        }
        // Проверяем, что это C++ файл
        if (editor.document.languageId !== 'cpp' &&
            editor.document.languageId !== 'c') {
            statusBar.hide();
            return;
        }
        const text = editor.document.getText();
        const stats = countConstructs(text);
        // Форматируем вывод для статус-бара
        // Вариант 1: Краткий
        // statusBar.text = `C++: ${stats.total} (if:${stats.if} for:${stats.for})`;
        // Вариант 2: С иконками
        statusBar.text = `$(symbol-boolean)${stats.if} $(symbol-loop)${stats.for} $(refresh)${stats.while}`;
        // Вариант 3: Детальный
        // statusBar.text = `if:${stats.if} eif:${stats.elseIf} e:${stats.else} for:${stats.for} wh:${stats.while}`;
        // Подсказка при наведении
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
    // Команда для ручного обновления
    const updateCommand = vscode.commands.registerCommand('cpp-counter.update', () => {
        updateStatusBar();
        vscode.window.showInformationMessage('C++ counter updated');
    });
    // Команда для показа деталей
    const showDetailsCommand = vscode.commands.registerCommand('cpp-counter.showDetails', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const text = editor.document.getText();
        const stats = countConstructs(text);
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
    // Подписываемся на события
    context.subscriptions.push(
    // При изменении текста
    vscode.workspace.onDidChangeTextDocument((e) => {
        var _a;
        if (e.document === ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document)) {
            updateStatusBar();
        }
    }), 
    // При смене активного редактора
    vscode.window.onDidChangeActiveTextEditor(() => {
        updateStatusBar();
    }), 
    // При сохранении файла
    vscode.workspace.onDidSaveTextDocument(() => {
        updateStatusBar();
    }), 
    // Команды
    updateCommand, showDetailsCommand, 
    // Статус-бар
    statusBar);
    // Инициализация при запуске
    updateStatusBar();
    // Также можно добавить в контекстное меню
    console.log('C++ Logic & Loop Counter ready');
}
exports.activate = activate;
function deactivate() {
    console.log('C++ Logic & Loop Counter deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
