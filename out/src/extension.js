"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Анализатор кода
class CodeAnalyzer {
    constructor() {
        this.statsTemplate = {
            if: 0,
            elseIf: 0,
            else: 0,
            for: 0,
            while: 0,
            doWhile: 0,
            switch: 0,
            ternary: 0,
            logicalAnd: 0,
            logicalOr: 0,
            total: 0,
            complexityScore: 0
        };
    }
    analyzeCode(code) {
        const stats = { ...this.statsTemplate };
        // Очищаем код от комментариев и строк
        const cleanCode = this._preprocessCode(code);
        // Подсчет конструкций
        stats.if = this._countMatches(cleanCode, /\bif\s*\(/g);
        stats.elseIf = this._countMatches(cleanCode, /\belse\s+if\s*\(/g);
        stats.else = this._countMatches(cleanCode, /\belse\b/g) - stats.elseIf;
        stats.for = this._countMatches(cleanCode, /\bfor\s*\(/g);
        stats.while = this._countMatches(cleanCode, /\bwhile\s*\(/g);
        stats.doWhile = this._countMatches(cleanCode, /\bdo\s*\{/g);
        stats.switch = this._countMatches(cleanCode, /\bswitch\s*\(/g);
        stats.ternary = this._countMatches(cleanCode, /\?/g);
        stats.logicalAnd = this._countMatches(cleanCode, /&&/g);
        stats.logicalOr = this._countMatches(cleanCode, /\|\|/g);
        // Итоговое количество
        let total = 0;
        Object.keys(stats).forEach(key => {
            if (key !== 'complexityScore' && key !== 'total') {
                total += stats[key];
            }
        });
        stats.total = total;
        // Рассчитываем оценку сложности
        stats.complexityScore = this._calculateComplexity(stats);
        return stats;
    }
    analyzeFile(filePath) {
        const code = fs.readFileSync(filePath, 'utf-8');
        return this.analyzeCode(code);
    }
    _preprocessCode(code) {
        // Удаляем строковые литералы
        let clean = code
            .replace(/'(?:[^'\\]|\\.)*'/g, "''")
            .replace(/"(?:[^"\\]|\\.)*"/g, '""')
            .replace(/`(?:[^`\\]|\\.)*`/g, '``');
        // Удаляем комментарии
        clean = clean
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '');
        return clean;
    }
    _countMatches(text, regex) {
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }
    _calculateComplexity(stats) {
        // Простая формула для оценки сложности
        let score = 0;
        score += stats.if * 1;
        score += stats.elseIf * 0.5;
        score += stats.else * 0.3;
        score += stats.for * 2;
        score += stats.while * 2;
        score += stats.doWhile * 2;
        score += stats.switch * 1.5;
        score += stats.ternary * 0.5;
        score += (stats.logicalAnd + stats.logicalOr) * 0.2;
        return Math.round(score * 10) / 10;
    }
}
// Генератор VISX файлов
class VisxExporter {
    generateVisx(analysisResults, options = {}) {
        const { title = "Code Analysis", width = 800, height = 600, theme = "light" } = options;
        const timestamp = new Date().toISOString();
        const dataPoints = this._prepareDataPoints(analysisResults);
        const visxTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<Visualization xmlns="http://schemas.microsoft.com/visx/2021">
  <Metadata>
    <Title>${this._escapeXml(title)}</Title>
    <Created>${timestamp}</Created>
    <Generator>JS Logic Counter VSCode Plugin</Generator>
    <Version>1.0</Version>
  </Metadata>
  
  <Configuration>
    <Dimensions>
      <Width>${width}</Width>
      <Height>${height}</Height>
    </Dimensions>
    <Theme>${theme}</Theme>
    <Interactivity enabled="true">
      <Tooltips enabled="true"/>
      <Zoom enabled="true"/>
      <Pan enabled="true"/>
    </Interactivity>
  </Configuration>
  
  <Data>
    <Dataset id="logic-constructs">
      ${dataPoints.map(point => this._createDataPoint(point)).join('\n      ')}
    </Dataset>
    
    <Dataset id="complexity-metrics">
      <Record>
        <Field name="totalConstructs">${analysisResults.total}</Field>
        <Field name="complexityScore">${analysisResults.complexityScore}</Field>
        <Field name="cyclomaticComplexity">${this._calculateCyclomaticComplexity(analysisResults)}</Field>
        <Field name="maintainabilityIndex">${this._calculateMaintainabilityIndex(analysisResults)}</Field>
      </Record>
    </Dataset>
  </Data>
  
  <Visualizations>
    <BarChart dataset="logic-constructs" x="name" y="value" color="category">
      <Title>Logical Constructs Distribution</Title>
      <Axis position="left" label="Count"/>
      <Axis position="bottom" label="Construct Type"/>
      <Legend position="top-right"/>
    </BarChart>
    
    <PieChart dataset="logic-constructs" value="value" label="name" innerRadius="80">
      <Title>Constructs Proportion</Title>
      <Legend position="bottom"/>
    </PieChart>
    
    <RadarChart dataset="logic-constructs" angle="name" radius="value">
      <Title>Code Complexity Radar</Title>
      <Grid levels="5"/>
    </RadarChart>
    
    <MetricsPanel>
      <Metric title="Total Constructs" value="${analysisResults.total}" trend="neutral"/>
      <Metric title="Complexity Score" value="${analysisResults.complexityScore}" trend="${analysisResults.complexityScore > 10 ? 'up' : 'down'}"/>
      <Metric title="Maintainability" value="${this._calculateMaintainabilityIndex(analysisResults)}%" trend="${analysisResults.complexityScore > 10 ? 'down' : 'up'}"/>
    </MetricsPanel>
  </Visualizations>
  
  <ExportOptions>
    <Format>SVG</Format>
    <Format>PNG</Format>
    <Format>PDF</Format>
    <Resolution>300</Resolution>
  </ExportOptions>
</Visualization>`;
        return visxTemplate;
    }
    _prepareDataPoints(results) {
        const categories = {
            conditions: ['if', 'elseIf', 'else', 'switch', 'ternary'],
            loops: ['for', 'while', 'doWhile'],
            logical: ['logicalAnd', 'logicalOr']
        };
        const dataPoints = [];
        // Добавляем основные конструкции
        Object.keys(results).forEach(key => {
            const value = results[key];
            if (typeof value === 'number' && key !== 'total' && key !== 'complexityScore') {
                let category = 'other';
                if (categories.conditions.includes(key)) {
                    category = 'conditions';
                }
                else if (categories.loops.includes(key)) {
                    category = 'loops';
                }
                else if (categories.logical.includes(key)) {
                    category = 'logical';
                }
                dataPoints.push({
                    name: key,
                    value: value,
                    category: category
                });
            }
        });
        return dataPoints;
    }
    _createDataPoint(point) {
        return `<Record>
        <Field name="name">${this._escapeXml(point.name)}</Field>
        <Field name="value">${point.value}</Field>
        <Field name="category">${this._escapeXml(point.category)}</Field>
        <Field name="percentage">${point.percentage || 0}</Field>
      </Record>`;
    }
    _escapeXml(text) {
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    _calculateCyclomaticComplexity(results) {
        // Упрощенный расчет цикломатической сложности
        return results.if + results.elseIf + results.switch +
            results.for + results.while + results.doWhile + 1;
    }
    _calculateMaintainabilityIndex(results) {
        // Упрощенный расчет индекса сопровождаемости (0-100)
        const complexity = this._calculateCyclomaticComplexity(results);
        const maxScore = 100;
        const penalty = Math.min(complexity * 2 + results.total * 0.5, 50);
        return Math.max(0, maxScore - penalty);
    }
}
// Основная логика расширения VSCode
function activate(context) {
    console.log('JS Logic Counter extension is now active!');
    const analyzer = new CodeAnalyzer();
    const exporter = new VisxExporter();
    // Команда для подсчета конструкций
    const countCommand = vscode.commands.registerCommand('js-logic-counter.countLogic', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }
        const document = editor.document;
        const code = document.getText();
        try {
            const stats = analyzer.analyzeCode(code);
            // Показываем результаты в панели
            const panel = vscode.window.createWebviewPanel('codeAnalysis', 'Code Analysis Results', vscode.ViewColumn.Two, { enableScripts: true });
            panel.webview.html = getWebviewContent(stats);
            // Сохраняем результаты в workspace state
            context.workspaceState.update('lastAnalysis', {
                stats: stats,
                timestamp: new Date().toISOString(),
                file: document.fileName
            });
            vscode.window.showInformationMessage(`Found ${stats.total} logical constructs`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
        }
    });
    // Команда для экспорта в VISX
    const exportCommand = vscode.commands.registerCommand('js-logic-counter.exportToVisx', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }
        const document = editor.document;
        const code = document.getText();
        try {
            // Анализируем код
            const stats = analyzer.analyzeCode(code);
            // Запрашиваем путь для сохранения
            const options = {
                defaultUri: vscode.Uri.file(path.join(path.dirname(document.fileName), 'analysis.visx')),
                filters: {
                    'VISX Files': ['visx'],
                    'All Files': ['*']
                }
            };
            const saveUri = await vscode.window.showSaveDialog(options);
            if (saveUri) {
                // Генерируем VISX
                const visxContent = exporter.generateVisx(stats, {
                    title: `Analysis of ${path.basename(document.fileName)}`,
                    theme: vscode.window.activeColorTheme.kind === 1 ? 'dark' : 'light'
                });
                // Сохраняем файл
                await vscode.workspace.fs.writeFile(saveUri, Buffer.from(visxContent, 'utf8'));
                // Показываем уведомление
                vscode.window.showInformationMessage(`VISX file saved to ${saveUri.fsPath}`, 'Open File').then(selection => {
                    if (selection === 'Open File') {
                        vscode.commands.executeCommand('vscode.open', saveUri);
                    }
                });
                // Сохраняем историю экспорта
                const history = context.workspaceState.get('exportHistory', []);
                history.push({
                    file: document.fileName,
                    visxFile: saveUri.fsPath,
                    timestamp: new Date().toISOString(),
                    stats: stats
                });
                context.workspaceState.update('exportHistory', history.slice(-10)); // Храним последние 10
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    });
    // Команда для анализа всей папки проекта
    const analyzeProjectCommand = vscode.commands.registerCommand('js-logic-counter.analyzeProject', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open!');
            return;
        }
        const folderUri = workspaceFolders[0].uri;
        // Запрашиваем настройки анализа
        const includePattern = await vscode.window.showInputBox({
            prompt: 'File pattern to include (e.g., **/*.js)',
            value: '**/*.js'
        });
        if (!includePattern) {
            return;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Analyzing project files...",
            cancellable: true
        }, async (progress, token) => {
            try {
                // Находим все JS файлы
                const files = await vscode.workspace.findFiles(includePattern, '**/node_modules/**', 100);
                if (files.length === 0) {
                    vscode.window.showInformationMessage('No JavaScript files found!');
                    return;
                }
                progress.report({ increment: 0, message: `Found ${files.length} files` });
                const allStats = [];
                // Анализируем каждый файл
                for (let i = 0; i < files.length; i++) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    const fileUri = files[i];
                    const relativePath = path.relative(folderUri.fsPath, fileUri.fsPath);
                    try {
                        const document = await vscode.workspace.openTextDocument(fileUri);
                        const stats = analyzer.analyzeCode(document.getText());
                        allStats.push({
                            file: relativePath,
                            stats: stats,
                            complexity: stats.complexityScore
                        });
                    }
                    catch (error) {
                        console.warn(`Failed to analyze ${relativePath}: ${error.message}`);
                    }
                    progress.report({
                        increment: 100 / files.length,
                        message: `Analyzing ${i + 1}/${files.length}`
                    });
                }
                if (allStats.length === 0) {
                    vscode.window.showWarningMessage('No files could be analyzed!');
                    return;
                }
                // Сортируем по сложности
                allStats.sort((a, b) => b.complexity - a.complexity);
                // Генерируем суммарную статистику
                const totalStats = analyzer.analyzeCode('');
                allStats.forEach(item => {
                    Object.keys(item.stats).forEach(key => {
                        if (typeof totalStats[key] === 'number' && key !== 'complexityScore') {
                            totalStats[key] += item.stats[key];
                        }
                    });
                });
                // Пересчитываем total и complexityScore
                let total = 0;
                Object.keys(totalStats).forEach(key => {
                    if (key !== 'complexityScore' && key !== 'total') {
                        total += totalStats[key];
                    }
                });
                totalStats.total = total;
                totalStats.complexityScore = analyzer['_calculateComplexity'](totalStats);
                // Показываем результаты
                const panel = vscode.window.createWebviewPanel('projectAnalysis', 'Project Analysis Results', vscode.ViewColumn.One, { enableScripts: true });
                panel.webview.html = getProjectWebviewContent(allStats, totalStats);
                // Предлагаем экспорт
                const exportOption = await vscode.window.showInformationMessage(`Analysis complete! Analyzed ${allStats.length} files.`, 'Export Project Report', 'Show Details');
                if (exportOption === 'Export Project Report') {
                    // Генерируем VISX для всего проекта
                    const visxContent = exporter.generateVisx(totalStats, {
                        title: `Project Analysis: ${path.basename(folderUri.fsPath)}`,
                        theme: vscode.window.activeColorTheme.kind === 1 ? 'dark' : 'light'
                    });
                    const saveUri = await vscode.window.showSaveDialog({
                        defaultUri: vscode.Uri.file(path.join(folderUri.fsPath, 'project-analysis.visx')),
                        filters: { 'VISX Files': ['visx'] }
                    });
                    if (saveUri) {
                        await vscode.workspace.fs.writeFile(saveUri, Buffer.from(visxContent, 'utf8'));
                        vscode.window.showInformationMessage(`Project report saved to ${saveUri.fsPath}`);
                    }
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Project analysis failed: ${error.message}`);
            }
            return Promise.resolve();
        });
    });
    // Добавляем команды в контекст
    context.subscriptions.push(countCommand, exportCommand, analyzeProjectCommand);
    // Регистрируем поставщик для отображения статистики в status bar
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'js-logic-counter.countLogic';
    statusBarItem.text = '$(symbol-method) Analyze Logic';
    statusBarItem.tooltip = 'Count logical constructs in current file';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
// HTML для webview панели
function getWebviewContent(stats) {
    const dataPoints = Object.entries(stats)
        .filter(([key, value]) => typeof value === 'number' && key !== 'total' && key !== 'complexityScore')
        .map(([key, value]) => ({ name: key, value: value }));
    const maxValue = Math.max(...dataPoints.map(d => d.value));
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Analysis Results</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 20px;
        background: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
      }
      h1 {
        color: var(--vscode-textLink-foreground);
        border-bottom: 2px solid var(--vscode-textLink-foreground);
        padding-bottom: 10px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin: 20px 0;
      }
      .stat-card {
        background: var(--vscode-editorWidget-background);
        border: 1px solid var(--vscode-widget-border);
        border-radius: 6px;
        padding: 15px;
        text-align: center;
      }
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--vscode-charts-blue);
      }
      .stat-label {
        font-size: 12px;
        text-transform: uppercase;
        color: var(--vscode-descriptionForeground);
        margin-top: 5px;
      }
      .complexity-score {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .complexity-value {
        font-size: 36px;
        font-weight: bold;
      }
      .bar-chart {
        margin: 30px 0;
      }
      .bar {
        display: flex;
        align-items: center;
        margin: 10px 0;
      }
      .bar-label {
        width: 120px;
        font-size: 14px;
      }
      .bar-container {
        flex: 1;
        height: 20px;
        background: var(--vscode-editor-lineHighlightBorder);
        border-radius: 10px;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        border-radius: 10px;
        transition: width 0.5s ease;
      }
      .export-button {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 20px;
      }
      .export-button:hover {
        background: var(--vscode-button-hoverBackground);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Code Analysis Results</h1>
      
      <div class="complexity-score">
        <div>Complexity Score</div>
        <div class="complexity-value">${stats.complexityScore.toFixed(1)}</div>
        <div>${stats.complexityScore > 10 ? 'High complexity - consider refactoring' :
        stats.complexityScore > 5 ? 'Moderate complexity' : 'Low complexity'}</div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Total Constructs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.if + stats.elseIf + stats.else}</div>
          <div class="stat-label">If/Else</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.for + stats.while + stats.doWhile}</div>
          <div class="stat-label">Loops</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.ternary}</div>
          <div class="stat-label">Ternary</div>
        </div>
      </div>
      
      <div class="bar-chart">
        <h3>Detailed Breakdown</h3>
        ${dataPoints.map(item => `
          <div class="bar">
            <div class="bar-label">${item.name}: ${item.value}</div>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${(item.value / maxValue) * 100}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <button class="export-button" onclick="exportToVisx()">
        Export to VISX Format
      </button>
    </div>
    
    <script>
      const vscode = acquireVsCodeApi();
      
      function exportToVisx() {
        vscode.postMessage({
          command: 'export'
        });
      }
      
      window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'update') {
          // Handle updates if needed
        }
      });
    </script>
  </body>
  </html>`;
}
// HTML для отображения анализа проекта
function getProjectWebviewContent(filesStats, totalStats) {
    const topComplexFiles = filesStats.slice(0, 10);
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Analysis</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 20px;
        background: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
      }
      .summary {
        background: var(--vscode-editorWidget-background);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .file-list {
        max-height: 400px;
        overflow-y: auto;
      }
      .file-item {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid var(--vscode-widget-border);
      }
      .file-item:hover {
        background: var(--vscode-list-hoverBackground);
      }
      .complexity-badge {
        background: var(--vscode-badge-background);
        color: var(--vscode-badge-foreground);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
      }
      .high-complexity {
        background: #ff6b6b;
        color: white;
      }
      .medium-complexity {
        background: #ffd93d;
        color: #333;
      }
      .low-complexity {
        background: #6bcf7f;
        color: white;
      }
    </style>
  </head>
  <body>
    <h1>Project Analysis Results</h1>
    
    <div class="summary">
      <h3>Summary</h3>
      <p>Total Files Analyzed: ${filesStats.length}</p>
      <p>Total Logical Constructs: ${totalStats.total}</p>
      <p>Average Complexity: ${(filesStats.reduce((sum, f) => sum + f.complexity, 0) / filesStats.length).toFixed(1)}</p>
    </div>
    
    <h3>Top ${topComplexFiles.length} Most Complex Files</h3>
    <div class="file-list">
      ${topComplexFiles.map((file, index) => `
        <div class="file-item">
          <div>
            <strong>${index + 1}.</strong> ${file.file}
            <div style="font-size: 12px; color: #888;">
              Constructs: ${file.stats.total} | 
              If/Else: ${file.stats.if + file.stats.elseIf + file.stats.else} |
              Loops: ${file.stats.for + file.stats.while + file.stats.doWhile}
            </div>
          </div>
          <div class="complexity-badge ${file.complexity > 15 ? 'high-complexity' : file.complexity > 8 ? 'medium-complexity' : 'low-complexity'}">
            ${file.complexity.toFixed(1)}
          </div>
        </div>
      `).join('')}
    </div>
  </body>
  </html>`;
}
//# sourceMappingURL=extension.js.map
