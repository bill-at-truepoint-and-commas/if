// Command Router v2 - Natural Language Verb Syntax
// Parses: "verb [scope] [params]"
// Example: "expand week", "carve 10am-12pm deep work", "pivot"

(function() {
    'use strict';

    // ========================================
    // VERB DEFINITIONS
    // ========================================
    
    const VERBS = {
        orient: {
            scopes: ['block', 'day', 'week', 'quarter', 'year'],
            default: 'block',
            method: 'orient'
        },
        pivot: {
            scopes: ['day'],
            default: 'day',
            method: 'pivot'
        },
        shutdown: {
            scopes: ['day', 'week'],
            default: 'day',
            method: 'shutdown'
        },
        carve: {
            scopes: ['block'],
            default: 'block',
            method: 'carve'
        },
        get: {
            scopes: ['block', 'day', 'week', 'quarter', 'year'],
            default: 'day',
            method: 'getState'
        },
        patch: {
            scopes: ['block', 'day', 'week', 'quarter', 'year'],
            default: 'block',
            method: 'patch'
        },
        post: {
            scopes: ['block', 'day', 'week', 'quarter', 'year'],
            default: 'block',
            method: 'post'
        },
        delete: {
            scopes: ['block', 'day', 'week', 'quarter', 'year'],
            default: 'block',
            method: 'delete'
        }
    };

    const SCOPES = ['block', 'day', 'week', 'quarter', 'year'];

    // ========================================
    // PARSER
    // ========================================
    
    function parseCommand(input) {
        const cleaned = input.trim().toLowerCase();
        const parts = cleaned.split(/\s+/);
        
        if (parts.length === 0) {
            return { error: 'Empty command' };
        }

        const verb = parts[0];
        
        if (!VERBS[verb]) {
            return { error: `Unknown verb: ${verb}. Available: ${Object.keys(VERBS).join(', ')}` };
        }

        const verbDef = VERBS[verb];
        
        // Check if second part is a scope
        let scope = verbDef.default;
        let params = [];
        
        if (parts.length > 1) {
            const potentialScope = parts[1];
            if (SCOPES.includes(potentialScope) && verbDef.scopes.includes(potentialScope)) {
                scope = potentialScope;
                params = parts.slice(2);
            } else {
                // Not a scope, treat as params
                params = parts.slice(1);
            }
        }

        return {
            verb,
            scope,
            method: verbDef.method,
            params: params.join(' '),
            raw: input
        };
    }

    // ========================================
    // EXECUTOR
    // ========================================
    
    function execute(command) {
        const parsed = parseCommand(command);
        
        if (parsed.error) {
            console.error(parsed.error);
            return { error: parsed.error };
        }

        console.log('Executing:', parsed);

        // Navigate to correct namespace
        let target = window.inf;
        
        if (parsed.scope !== 'day') {
            // day is default, others need explicit namespace
            if (parsed.scope === 'block') {
                target = window.inf.block || window.inf;
            } else {
                target = window.inf[parsed.scope];
            }
        }

        if (!target) {
            return { error: `Namespace not found: ${parsed.scope}` };
        }

        // Get the method
        const method = target[parsed.method];
        
        if (!method || typeof method !== 'function') {
            return { error: `Method not found: ${parsed.scope}.${parsed.method}()` };
        }

        // Execute with params
        try {
            const result = parsed.params ? method.call(target, parsed.params) : method.call(target);
            console.log('Result:', result);
            return result;
        } catch (e) {
            console.error('Execution error:', e);
            return { error: e.message };
        }
    }

    // ========================================
    // CHAINING SUPPORT
    // ========================================
    
    function executeChain(commands) {
        // Execute multiple commands in sequence, passing results forward
        const results = [];
        let context = {};

        for (let cmd of commands) {
            const result = execute(cmd);
            results.push({ command: cmd, result });
            
            // Store result in context for next command
            if (result && !result.error) {
                context = { ...context, ...result };
            } else if (result && result.error) {
                console.error(`Chain broken at: ${cmd}`);
                break;
            }
        }

        return { results, context };
    }

    // ========================================
    // COMMAND INPUT UI
    // ========================================
    
    function createCommandInput() {
        const container = document.createElement('div');
        container.id = 'command-input-container';
        container.style.cssText = `
            position: fixed;
            bottom: 60px;
            left: 20px;
            z-index: 1001;
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        const input = document.createElement('input');
        input.id = 'command-input';
        input.type = 'text';
        input.placeholder = 'orient day';
        input.style.cssText = `
            font-family: 'Comic Neue', 'Comic Sans MS', cursive;
            font-size: 14px;
            padding: 8px 12px;
            border: 2px solid #333;
            border-radius: 3px;
            background: white;
            outline: none;
            width: 250px;
        `;

        const executeBtn = document.createElement('button');
        executeBtn.textContent = 'run';
        executeBtn.className = 'control-button';
        executeBtn.style.cssText = `
            padding: 8px 16px;
        `;

        const helpText = document.createElement('div');
        helpText.style.cssText = `
            font-size: 11px;
            color: #666;
            font-family: 'Comic Neue', 'Comic Sans MS', cursive;
        `;
        helpText.textContent = 'Ctrl+K to focus';

        const handleExecute = () => {
            const cmd = input.value.trim();
            if (cmd) {
                const result = execute(cmd);
                console.log('Command result:', result);
                
                // Visual feedback
                if (result && !result.error) {
                    input.style.borderColor = '#96ceb4';
                    setTimeout(() => input.style.borderColor = '#333', 500);
                } else {
                    input.style.borderColor = '#ffaaa5';
                    setTimeout(() => input.style.borderColor = '#333', 500);
                }
                
                input.value = '';
            }
        };

        executeBtn.addEventListener('click', handleExecute);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleExecute();
            }
        });

        container.appendChild(input);
        container.appendChild(executeBtn);
        container.appendChild(helpText);
        document.body.appendChild(container);

        // Keyboard shortcut: Ctrl+K to focus
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                input.focus();
            }
        });

        return input;
    }

    // ========================================
    // HELP SYSTEM
    // ========================================
    
    function showHelp() {
        console.log(`
Infinite Frontiers Commands v2
======================

VERBS:
  orient [scope]        - Read the room, suggest next moves
  pivot                 - Reset day, move incomplete tasks to start
  shutdown              - Close the day, roll over to tomorrow
  carve [params]        - Name time block(s)
  get [scope]           - Read state
  patch [scope] {data}  - Update existing
  post [scope] {data}   - Create new
  delete [scope]        - Remove

SCOPES:
  block (default)       - Individual time slots
  day                   - Daily planning
  week                  - Weekly intentions
  quarter               - Quarterly goals (future)
  year                  - Annual vision (future)

EXAMPLES:
  orient                → Orient on current block
  orient day            → Survey day vs weekly intentions
  orient week           → Open weekly intentions panel
  pivot                 → Reset day, move incomplete tasks to 09:00am
  shutdown              → Close day, roll over incomplete to tomorrow
  carve deep work       → Name current block
  carve 10am-12pm mtg   → Name multi-hour block
  get day               → Get day state

CHAINING:
  AI can execute multiple commands in sequence:
  executeChain(['get day', 'orient day', 'post block {tasks: [...]}'])
        `);
    }

    // ========================================
    // EXPOSE API
    // ========================================
    
    window.executeCommand = execute;
    window.executeChain = executeChain;
    window.parseCommand = parseCommand;
    window.showCommandHelp = showHelp;

    // Update inf router reference
    window.inf = window.inf || {};
    window.inf._router = {
        execute,
        executeChain,
        parse: parseCommand,
        help: showHelp,
        verbs: Object.keys(VERBS),
        scopes: SCOPES
    };

    // ========================================
    // INITIALIZE
    // ========================================
    
    function init() {
        createCommandInput();
        console.log('Command Router v2 loaded');
        console.log('Type showCommandHelp() for usage');
        console.log('Commands: orient · carve · pivot · shutdown · get · post · patch');
        console.log('Tip: orient day — reads weekly intentions vs day plan');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
