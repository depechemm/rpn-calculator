const priority = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
    '!': 4,
    'sin': 5,
    'cos': 5,
    'tan': 5,
    'ctg': 5,
    'sqrt': 5,
    'log': 5,
    'ln': 5,
    'exp': 5,
    'abs': 5,
}

const operators = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => b === 0 ? Infinity : a / b,
    '^': (a, b) => Math.pow(a, b),
    '!': (a) => factorial(a),
    'sin': (a) => Math.sin(a),
    'cos': (a) => Math.cos(a),
    'tan': (a) => Math.tan(a),
    'ctg': (a) => 1 / Math.tan(a),
    'sqrt': (a) => Math.sqrt(a),
    'log': (a) => Math.log10(a),
    'ln': (a) => Math.log(a),
    'exp': (a) => Math.exp(a),
    'abs': (a) => Math.abs(a),
}


function factorial(n) {
    if (n === 0 || n === 1) return 1
    return n * factorial(n - 1)
}

function toRpn(expression) {
    let numberOpenParentheses = 0
    let numberCloseParentheses = 0

    for (let char of expression) {
        if (char === '(') {
            numberOpenParentheses++
        } else if (char === ')') {
            numberCloseParentheses++
        }
    }

    if (numberOpenParentheses < numberCloseParentheses) {
        throw 'Ошибка: лишняя закрывающая скобка'
    } else if (numberOpenParentheses > numberCloseParentheses) {
        throw 'Ошибка: не хватает закрывающей скобки'
    }

    if (/\d\s+\d/.test(expression)) {
        throw 'Ошибка: нет операции между числами'
    }

    expression = expression.split(' ').join('').match(/(\d+|[+\-*/^()!]|sin|cos|tan|ctg|sqrt|log|ln|exp|abs)/g)

    const rpn = []
    const stack = []

    for (let elem of expression) {
        if (!isNaN(elem)) {
            rpn.push(elem)
            continue
        }

        if (['sin', 'cos', 'tan', 'ctg', 'sqrt', 'log', 'ln', 'exp', 'abs', '('].includes(elem)) {
            stack.push(elem)
            continue
        }

        if (elem === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                rpn.push(stack.pop())
            }
            stack.pop()
            continue
        }

        if (['+', '-', '*', '/', '^'].includes(elem)) {
            while (stack.length > 0 && priority[stack[stack.length - 1]] >= priority[elem]) {
                rpn.push(stack.pop())
            }
            stack.push(elem)
            continue
        }

        rpn.push(elem)
    }

    while (stack.length) {
        rpn.push(stack.pop())
    }

    return rpn
}


function evaluateRpn(rpn) {
    const stack = []

    for (const token of rpn) {
        if (!isNaN(token)) {
            stack.push(Number(token));
        } else if (operators[token]) {
            if (['sin', 'cos', 'tan', 'ctg', 'sqrt', 'log', 'ln', 'exp', 'abs', '!'].includes(token)) {
                const a = stack.pop()
                stack.push(operators[token](a))
            } else {
                const b = stack.pop()
                const a = stack.pop()
                stack.push(operators[token](a, b))
            }
        } else {
            throw 'Ошибка: неизвестный оператор'
        }
    }

    if (stack.length !== 1) {
        throw 'Ошибка: некорректное выражение'
    }

    const result = stack.pop()

    if (isNaN(result)) {
        throw 'Ошибка: результат выражения не число'
    }

    return result
}


document.addEventListener('DOMContentLoaded', function () {
    const expressionInput = document.getElementById('expression')
    const buttons = document.querySelectorAll('.calc-button')
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const operator = this.textContent
            expressionInput.value += operator
            if (['sin', 'cos', 'tan', 'ctg', 'sqrt', 'log', 'ln', 'exp', 'abs'].includes(operator)) {
                expressionInput.value += ' '
            }
        })
    })

    document.getElementById('erase').addEventListener('click', function () {
        if (expressionInput.value !== '') {
            expressionInput.value = expressionInput.value.slice(0, -1)
        }
    })

    document.getElementById('show-func').addEventListener('click', function () {
        if (document.getElementById('hide-func').classList.contains('hide')) {
            document.getElementById('hide-func').classList.remove('hide')
            document.getElementById('show-func').textContent = 'Cкрыть'
        }
        else {
            document.getElementById('hide-func').classList.add('hide')
            document.getElementById('show-func').textContent = 'f(x)'
        }

    });

    document.getElementById('delete').addEventListener('click', function () {
        expressionInput.value = ''
        document.getElementById('rpn').textContent = ''
        document.getElementById('result').textContent = ''
    })

    document.getElementById('calculate').addEventListener('click', function () {
        try {
            const expression = expressionInput.value
            const rpn = toRpn(expression)
            document.getElementById('rpn').textContent = rpn.join(' ')
            const result = document.getElementById('result')
            result.textContent = evaluateRpn(rpn)
        } catch (e) {
            rpn.textContent = e
            result.textContent = e
        }
    });
});
