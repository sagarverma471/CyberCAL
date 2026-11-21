// CyberCalc - Futuristic Calculator
class CyberCalc {
    constructor() {
        this.currentMode = 'basic';
        this.display = '0';
        this.history = '';
        this.operation = null;
        this.previousValue = null;
        this.waitingForOperand = false;
        this.calculationHistory = JSON.parse(localStorage.getItem('cybercalc_history')) || [];
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.loadHistory();
    }

    initializeElements() {
        // Display elements
        this.displayMain = document.getElementById('displayMain');
        this.displayHistory = document.getElementById('displayHistory');
        
        // Mode elements
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.currentModeSpan = document.querySelector('.current-mode');
        
        // Calculator elements
        this.basicCalculator = document.getElementById('basicCalculator');
        this.scientificCalculator = document.getElementById('scientificCalculator');
        this.converterCalculator = document.getElementById('converterCalculator');
        this.aiCalculator = document.getElementById('aiCalculator');
        
        // Control buttons
        this.clearBtn = document.getElementById('clearBtn');
        this.backspaceBtn = document.getElementById('backspaceBtn');
        this.historyBtn = document.getElementById('historyBtn');
        
        // History panel
        this.historyPanel = document.getElementById('historyPanel');
        this.historyContent = document.getElementById('historyContent');
        this.closeHistory = document.getElementById('closeHistory');
        this.clearHistory = document.getElementById('clearHistory');
        this.exportHistory = document.getElementById('exportHistory');
        
        // AI elements
        this.aiInput = document.getElementById('aiInput');
        this.aiSubmit = document.getElementById('aiSubmit');
        this.aiResponse = document.getElementById('aiResponse');
        
        // Converter elements
        this.convertButtons = document.querySelectorAll('.convert-btn');
    }

    bindEvents() {
        // Mode switching
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        // Basic calculator buttons
        this.basicCalculator.addEventListener('click', (e) => {
            if (e.target.classList.contains('calc-btn')) {
                this.handleButtonClick(e.target);
            }
        });

        // Scientific calculator buttons
        this.scientificCalculator.addEventListener('click', (e) => {
            if (e.target.classList.contains('calc-btn')) {
                this.handleButtonClick(e.target);
            }
        });

        // Control buttons
        this.clearBtn.addEventListener('click', () => this.clear());
        this.backspaceBtn.addEventListener('click', () => this.backspace());
        this.historyBtn.addEventListener('click', () => this.toggleHistory());

        // History panel
        this.closeHistory.addEventListener('click', () => this.toggleHistory());
        this.clearHistory.addEventListener('click', () => this.clearAllHistory());
        this.exportHistory.addEventListener('click', () => this.exportHistoryData());

        // AI query
        this.aiSubmit.addEventListener('click', () => this.processAIQuery());
        this.aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processAIQuery();
        });

        // Example chips
        document.querySelectorAll('.example-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.aiInput.value = chip.textContent;
                this.processAIQuery();
            });
        });

        // Unit converter
        this.convertButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.convertUnit(e.target.dataset.type));
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update mode buttons
        this.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Update mode indicator
        this.currentModeSpan.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        
        // Show/hide calculators
        this.basicCalculator.classList.toggle('hidden', mode !== 'basic');
        this.scientificCalculator.classList.toggle('hidden', mode !== 'scientific');
        this.converterCalculator.classList.toggle('hidden', mode !== 'converter');
        this.aiCalculator.classList.toggle('hidden', mode !== 'ai');
        
        // Clear display when switching modes
        this.clear();
    }

    handleButtonClick(button) {
        const action = button.dataset.action;
        const number = button.dataset.number;
        
        if (number !== undefined) {
            this.inputNumber(number);
        } else if (action) {
            this.handleAction(action);
        }
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.display = num;
            this.waitingForOperand = false;
        } else {
            this.display = this.display === '0' ? num : this.display + num;
        }
        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.handleOperator(action);
                break;
            case 'equals':
                this.calculate();
                break;
            case 'percentage':
                this.percentage();
                break;
            // Scientific functions
            case 'sin':
                this.scientificFunction('sin');
                break;
            case 'cos':
                this.scientificFunction('cos');
                break;
            case 'tan':
                this.scientificFunction('tan');
                break;
            case 'asin':
                this.scientificFunction('asin');
                break;
            case 'acos':
                this.scientificFunction('acos');
                break;
            case 'atan':
                this.scientificFunction('atan');
                break;
            case 'log':
                this.scientificFunction('log');
                break;
            case 'ln':
                this.scientificFunction('ln');
                break;
            case 'sqrt':
                this.scientificFunction('sqrt');
                break;
            case 'cbrt':
                this.scientificFunction('cbrt');
                break;
            case 'power':
                this.scientificFunction('power', 2);
                break;
            case 'power3':
                this.scientificFunction('power', 3);
                break;
            case 'factorial':
                this.scientificFunction('factorial');
                break;
            case 'exp':
                this.scientificFunction('exp');
                break;
            case 'pow10':
                this.scientificFunction('pow10');
                break;
            case 'abs':
                this.scientificFunction('abs');
                break;
            case 'floor':
                this.scientificFunction('floor');
                break;
            case 'ceil':
                this.scientificFunction('ceil');
                break;
            case 'random':
                this.random();
                break;
            case 'mod':
                this.handleOperator('mod');
                break;
            case 'pi':
                this.inputConstant(Math.PI);
                break;
            case 'e':
                this.inputConstant(Math.E);
                break;
        }
    }

    handleOperator(nextOperator) {
        const inputValue = parseFloat(this.display);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousValue || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.operation);
            
            this.display = String(newValue);
            this.previousValue = newValue;
            this.updateDisplay();
        }
        
        this.waitingForOperand = true;
        this.operation = nextOperator;
    }

    performCalculation(firstValue, secondValue, operation) {
        switch (operation) {
            case 'add':
                return firstValue + secondValue;
            case 'subtract':
                return firstValue - secondValue;
            case 'multiply':
                return firstValue * secondValue;
            case 'divide':
                return secondValue !== 0 ? firstValue / secondValue : 0;
            case 'mod':
                return secondValue !== 0 ? firstValue % secondValue : 0;
            default:
                return secondValue;
        }
    }

    calculate() {
        const inputValue = parseFloat(this.display);
        
        if (this.previousValue !== null && this.operation) {
            const calculation = `${this.previousValue} ${this.getOperatorSymbol(this.operation)} ${inputValue}`;
            const result = this.performCalculation(this.previousValue, inputValue, this.operation);
            
            this.history = calculation;
            this.display = String(result);
            this.addToHistory(calculation, result);
            
            this.previousValue = null;
            this.operation = null;
            this.waitingForOperand = true;
            
            this.updateDisplay();
            this.animateCalculation();
        }
    }

    getOperatorSymbol(operation) {
        const symbols = {
            'add': '+',
            'subtract': '-',
            'multiply': '×',
            'divide': '÷',
            'mod': 'mod'
        };
        return symbols[operation] || operation;
    }

    scientificFunction(func, power = null) {
        const value = parseFloat(this.display);
        let result;
        let calculation;
        
        switch (func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180);
                calculation = `sin(${value}°)`;
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                calculation = `cos(${value}°)`;
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                calculation = `tan(${value}°)`;
                break;
            case 'asin':
                result = Math.asin(value) * 180 / Math.PI;
                calculation = `sin⁻¹(${value})`;
                break;
            case 'acos':
                result = Math.acos(value) * 180 / Math.PI;
                calculation = `cos⁻¹(${value})`;
                break;
            case 'atan':
                result = Math.atan(value) * 180 / Math.PI;
                calculation = `tan⁻¹(${value})`;
                break;
            case 'log':
                result = Math.log10(value);
                calculation = `log(${value})`;
                break;
            case 'ln':
                result = Math.log(value);
                calculation = `ln(${value})`;
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                calculation = `√${value}`;
                break;
            case 'cbrt':
                result = Math.cbrt(value);
                calculation = `∛${value}`;
                break;
            case 'power':
                result = Math.pow(value, power);
                calculation = `${value}^${power}`;
                break;
            case 'factorial':
                result = this.factorial(value);
                calculation = `${value}!`;
                break;
            case 'exp':
                result = Math.exp(value);
                calculation = `e^${value}`;
                break;
            case 'pow10':
                result = Math.pow(10, value);
                calculation = `10^${value}`;
                break;
            case 'abs':
                result = Math.abs(value);
                calculation = `|${value}|`;
                break;
            case 'floor':
                result = Math.floor(value);
                calculation = `⌊${value}⌋`;
                break;
            case 'ceil':
                result = Math.ceil(value);
                calculation = `⌈${value}⌉`;
                break;
        }
        
        if (result !== undefined) {
            this.history = calculation;
            this.display = String(result);
            this.addToHistory(calculation, result);
            this.updateDisplay();
            this.animateCalculation();
        }
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    inputConstant(constant) {
        this.display = String(constant);
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    random() {
        const result = Math.random();
        this.display = String(result);
        this.addToHistory('Random', result);
        this.updateDisplay();
        this.animateCalculation();
    }

    percentage() {
        const value = parseFloat(this.display);
        const result = value / 100;
        this.display = String(result);
        this.addToHistory(`${value}%`, result);
        this.updateDisplay();
        this.animateCalculation();
    }

    clear() {
        this.display = '0';
        this.history = '';
        this.operation = null;
        this.previousValue = null;
        this.waitingForOperand = false;
        this.updateDisplay();
    }

    backspace() {
        if (this.display.length > 1) {
            this.display = this.display.slice(0, -1);
        } else {
            this.display = '0';
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.displayMain.textContent = this.display;
        this.displayHistory.textContent = this.history;
    }

    addToHistory(calculation, result) {
        const historyItem = {
            id: Date.now(),
            calculation: calculation,
            result: result,
            timestamp: new Date().toLocaleString()
        };
        
        this.calculationHistory.unshift(historyItem);
        
        // Keep only last 100 calculations
        if (this.calculationHistory.length > 100) {
            this.calculationHistory = this.calculationHistory.slice(0, 100);
        }
        
        this.saveHistory();
        this.loadHistory();
    }

    saveHistory() {
        localStorage.setItem('cybercalc_history', JSON.stringify(this.calculationHistory));
    }

    loadHistory() {
        if (this.calculationHistory.length === 0) {
            this.historyContent.innerHTML = '<div class="no-history">No calculations yet</div>';
            return;
        }
        
        this.historyContent.innerHTML = this.calculationHistory.map(item => `
            <div class="history-item">
                <div class="history-calculation">${item.calculation}</div>
                <div class="history-result">= ${item.result}</div>
                <div class="history-timestamp">${item.timestamp}</div>
            </div>
        `).join('');
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('hidden');
    }

    clearAllHistory() {
        this.calculationHistory = [];
        this.saveHistory();
        this.loadHistory();
    }

    exportHistory() {
        const dataStr = JSON.stringify(this.calculationHistory, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cybercalc_history.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    // Unit Converter Functions
    convertUnit(type) {
        let input, fromSelect, toSelect, resultElement;
        
        switch (type) {
            case 'temperature':
                input = document.getElementById('tempInput');
                fromSelect = document.getElementById('tempFrom');
                toSelect = document.getElementById('tempTo');
                resultElement = document.getElementById('tempResult');
                break;
            case 'length':
                input = document.getElementById('lengthInput');
                fromSelect = document.getElementById('lengthFrom');
                toSelect = document.getElementById('lengthTo');
                resultElement = document.getElementById('lengthResult');
                break;
            case 'weight':
                input = document.getElementById('weightInput');
                fromSelect = document.getElementById('weightFrom');
                toSelect = document.getElementById('weightTo');
                resultElement = document.getElementById('weightResult');
                break;
        }
        
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            resultElement.textContent = 'Please enter a valid number';
            return;
        }
        
        const fromUnit = fromSelect.value;
        const toUnit = toSelect.value;
        
        let result;
        switch (type) {
            case 'temperature':
                result = this.convertTemperature(value, fromUnit, toUnit);
                break;
            case 'length':
                result = this.convertLength(value, fromUnit, toUnit);
                break;
            case 'weight':
                result = this.convertWeight(value, fromUnit, toUnit);
                break;
        }
        
        resultElement.textContent = `${value} ${fromUnit} = ${result} ${toUnit}`;
    }

    convertTemperature(value, from, to) {
        // Convert to Celsius first
        let celsius;
        switch (from) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
        }
        
        // Convert from Celsius to target
        switch (to) {
            case 'celsius':
                return celsius.toFixed(2);
            case 'fahrenheit':
                return (celsius * 9/5 + 32).toFixed(2);
            case 'kelvin':
                return (celsius + 273.15).toFixed(2);
        }
    }

    convertLength(value, from, to) {
        // Convert to meters first
        const toMeters = {
            'meter': 1,
            'kilometer': 1000,
            'centimeter': 0.01,
            'millimeter': 0.001,
            'inch': 0.0254,
            'foot': 0.3048,
            'yard': 0.9144,
            'mile': 1609.344
        };
        
        const meters = value * toMeters[from];
        
        // Convert from meters to target
        const result = meters / toMeters[to];
        return result.toFixed(6);
    }

    convertWeight(value, from, to) {
        // Convert to kilograms first
        const toKilograms = {
            'kilogram': 1,
            'gram': 0.001,
            'pound': 0.453592,
            'ounce': 0.0283495,
            'ton': 1000
        };
        
        const kilograms = value * toKilograms[from];
        
        // Convert from kilograms to target
        const result = kilograms / toKilograms[to];
        return result.toFixed(6);
    }

    // AI Query Processing
    processAIQuery() {
        const query = this.aiInput.value.trim();
        if (!query) return;
        
        const response = this.parseMathQuery(query);
        this.displayAIResponse(query, response);
        this.aiInput.value = '';
    }

    parseMathQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        // Basic arithmetic
        if (lowerQuery.includes('+') || lowerQuery.includes('plus')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 2) {
                const result = numbers.reduce((a, b) => a + b);
                return { type: 'calculation', result: result, calculation: numbers.join(' + ') };
            }
        }
        
        if (lowerQuery.includes('-') || lowerQuery.includes('minus')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 2) {
                const result = numbers[0] - numbers[1];
                return { type: 'calculation', result: result, calculation: `${numbers[0]} - ${numbers[1]}` };
            }
        }
        
        if (lowerQuery.includes('*') || lowerQuery.includes('×') || lowerQuery.includes('times') || lowerQuery.includes('multiply')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 2) {
                const result = numbers.reduce((a, b) => a * b);
                return { type: 'calculation', result: result, calculation: numbers.join(' × ') };
            }
        }
        
        if (lowerQuery.includes('/') || lowerQuery.includes('÷') || lowerQuery.includes('divide')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 2) {
                const result = numbers[0] / numbers[1];
                return { type: 'calculation', result: result, calculation: `${numbers[0]} ÷ ${numbers[1]}` };
            }
        }
        
        // Percentage calculations
        if (lowerQuery.includes('percent') || lowerQuery.includes('%')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 2) {
                const result = (numbers[0] * numbers[1]) / 100;
                return { type: 'calculation', result: result, calculation: `${numbers[0]}% of ${numbers[1]}` };
            }
        }
        
        // Square root
        if (lowerQuery.includes('square root') || lowerQuery.includes('sqrt')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 1) {
                const result = Math.sqrt(numbers[0]);
                return { type: 'calculation', result: result, calculation: `√${numbers[0]}` };
            }
        }
        
        // Power
        if (lowerQuery.includes('power') || lowerQuery.includes('^') || lowerQuery.includes('to the power')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 2) {
                const result = Math.pow(numbers[0], numbers[1]);
                return { type: 'calculation', result: result, calculation: `${numbers[0]}^${numbers[1]}` };
            }
        }
        
        // Area of circle
        if (lowerQuery.includes('area of circle') || lowerQuery.includes('circle area')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 1) {
                const radius = numbers[0];
                const result = Math.PI * radius * radius;
                return { type: 'calculation', result: result, calculation: `π × ${radius}²` };
            }
        }
        
        // Temperature conversion
        if (lowerQuery.includes('celsius to fahrenheit') || lowerQuery.includes('c to f')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 1) {
                const celsius = numbers[0];
                const fahrenheit = (celsius * 9/5) + 32;
                return { type: 'conversion', result: fahrenheit, calculation: `${celsius}°C to °F` };
            }
        }
        
        if (lowerQuery.includes('fahrenheit to celsius') || lowerQuery.includes('f to c')) {
            const numbers = this.extractNumbers(query);
            if (numbers.length >= 1) {
                const fahrenheit = numbers[0];
                const celsius = (fahrenheit - 32) * 5/9;
                return { type: 'conversion', result: celsius, calculation: `${fahrenheit}°F to °C` };
            }
        }
        
        return { type: 'error', result: 'Sorry, I couldn\'t understand that query. Try rephrasing it.' };
    }

    extractNumbers(text) {
        const numberRegex = /-?\d+\.?\d*/g;
        return text.match(numberRegex)?.map(Number) || [];
    }

    displayAIResponse(query, response) {
        const responseDiv = document.createElement('div');
        responseDiv.className = 'ai-response-item';
        
        if (response.type === 'calculation' || response.type === 'conversion') {
            responseDiv.innerHTML = `
                <div class="ai-query">"${query}"</div>
                <div class="ai-calculation">${response.calculation}</div>
                <div class="ai-result">= ${response.result}</div>
            `;
            
            // Add to calculation history
            this.addToHistory(response.calculation, response.result);
        } else {
            responseDiv.innerHTML = `
                <div class="ai-query">"${query}"</div>
                <div class="ai-error">${response.result}</div>
            `;
        }
        
        // Clear examples and show response
        this.aiResponse.innerHTML = '';
        this.aiResponse.appendChild(responseDiv);
        
        // Add back examples after a delay
        setTimeout(() => {
            const examplesDiv = document.createElement('div');
            examplesDiv.className = 'ai-examples';
            examplesDiv.innerHTML = `
                <h4>Try these examples:</h4>
                <div class="example-chips">
                    <span class="example-chip">square root of 144</span>
                    <span class="example-chip">20 percent of 500</span>
                    <span class="example-chip">what is 15% of 200</span>
                    <span class="example-chip">convert 25 celsius to fahrenheit</span>
                    <span class="example-chip">area of circle with radius 5</span>
                </div>
            `;
            
            // Re-bind example chip events
            examplesDiv.querySelectorAll('.example-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    this.aiInput.value = chip.textContent;
                    this.processAIQuery();
                });
            });
            
            this.aiResponse.appendChild(examplesDiv);
        }, 3000);
    }

    // Keyboard support
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT') return;
        
        const key = e.key;
        
        // Numbers
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
        }
        
        // Decimal point
        if (key === '.') {
            this.inputNumber('.');
        }
        
        // Operators
        if (key === '+') this.handleOperator('add');
        if (key === '-') this.handleOperator('subtract');
        if (key === '*') this.handleOperator('multiply');
        if (key === '/') {
            e.preventDefault();
            this.handleOperator('divide');
        }
        
        // Equals
        if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        }
        
        // Clear
        if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        }
        
        // Backspace
        if (key === 'Backspace') {
            this.backspace();
        }
    }

    animateCalculation() {
        this.displayMain.classList.add('calculation-complete');
        setTimeout(() => {
            this.displayMain.classList.remove('calculation-complete');
        }, 300);
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CyberCalc();
});

// Add some additional CSS for AI responses
const style = document.createElement('style');
style.textContent = `
    .ai-response-item {
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        animation: slideIn 0.3s ease;
    }
    
    .ai-query {
        color: #ffffff;
        font-style: italic;
        margin-bottom: 10px;
    }
    
    .ai-calculation {
        color: #00ffff;
        font-family: 'Orbitron', monospace;
        font-size: 1.1rem;
        margin-bottom: 5px;
    }
    
    .ai-result {
        color: #00ffff;
        font-family: 'Orbitron', monospace;
        font-size: 1.3rem;
        font-weight: 700;
    }
    
    .ai-error {
        color: #ff6b6b;
        font-style: italic;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
